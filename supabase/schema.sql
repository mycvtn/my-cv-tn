-- ============================================================================
-- my-cv.tn : Supabase Production Database Schema
-- Architecture : Crédits, Transactions Sécurisées, RLS & Verrouillage Atomique
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enumération des Types de Transactions
CREATE TYPE transaction_type AS ENUM (
  'TOPUP_FLOUCI',
  'TOPUP_KONNECT',
  'TOPUP_D17',
  'SPEND_PDF_CLEAN',
  'SPEND_AI_IMPROVE',
  'SPEND_AI_COVER_LETTER',
  'SPEND_ATS_MATCH',
  'BONUS_WELCOME'
);

-- 2. Table Profiles (Solde de Crédits Utilisateur)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  credit_balance INTEGER NOT NULL DEFAULT 10 CHECK (credit_balance >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile name"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Table des Transactions Immuables
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_credits INTEGER NOT NULL,
  amount_tnd NUMERIC(10, 3) DEFAULT 0.000,
  action_type transaction_type NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Fonction RPC Sécurisée : Déduction Atomique Anti-Course (FOR UPDATE)
CREATE OR REPLACE FUNCTION public.deduct_user_credits(
  p_user_id UUID,
  p_cost_credits INTEGER,
  p_action transaction_type,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Verrouillage de la ligne pour éliminer les race conditions
  SELECT credit_balance INTO v_current_balance
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Utilisateur introuvable');
  END IF;

  IF v_current_balance < p_cost_credits THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Solde insuffisant',
      'current_balance', v_current_balance,
      'required', p_cost_credits
    );
  END IF;

  v_new_balance := v_current_balance - p_cost_credits;
  
  UPDATE public.profiles
  SET credit_balance = v_new_balance,
      updated_at = NOW()
  WHERE id = p_user_id;

  INSERT INTO public.credit_transactions (
    user_id,
    amount_credits,
    amount_tnd,
    action_type,
    description,
    metadata
  ) VALUES (
    p_user_id,
    -p_cost_credits,
    (p_cost_credits * 0.800),
    p_action,
    p_description,
    p_metadata
  );

  RETURN jsonb_build_object(
    'success', true,
    'previous_balance', v_current_balance,
    'new_balance', v_new_balance,
    'deducted', p_cost_credits
  );
END;
$$;

-- 5. Trigger d'Inscription Automatique
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, credit_balance)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 10);
  
  INSERT INTO public.credit_transactions (user_id, amount_credits, amount_tnd, action_type, description)
  VALUES (NEW.id, 10, 0.000, 'BONUS_WELCOME', 'Cadeau de bienvenue : 10 Crédits offerts');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
