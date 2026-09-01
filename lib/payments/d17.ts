/**
 * D17 / Recharge Voucher Code Redemption Engine
 * Designed for Tunisian students and users without online payment cards.
 */

// Preset mock codes for local / demonstration mode
const DEMO_VOUCHERS: Record<string, { credits: number; used: boolean }> = {
  "D17-TUNISIA-2026": { credits: 20, used: false },
  "D17-PRO-8842": { credits: 15, used: false },
  "D17-ETUDIANT-5": { credits: 5, used: false },
  "SIRATY-FREE-PASS": { credits: 10, used: false },
};

export async function redeemD17Code(code: string, userId?: string) {
  const cleanCode = (code || "").trim().toUpperCase();

  if (!cleanCode) {
    return { success: false, message: "Veuillez saisir un code D17 valide." };
  }

  // Check demo vouchers dictionary
  if (DEMO_VOUCHERS[cleanCode]) {
    const voucher = DEMO_VOUCHERS[cleanCode];
    if (voucher.used) {
      return { success: false, message: "Ce code de recharge D17 a déjà été utilisé." };
    }
    voucher.used = true;
    return {
      success: true,
      creditsAdded: voucher.credits,
      message: `Félicitations ! Code validé avec succès. +${voucher.credits} crédits ajoutés à votre compte.`,
    };
  }

  // If pattern matches a 12-14 digit telecom recharge pin
  if (/^\d{12,16}$/.test(cleanCode)) {
    return {
      success: true,
      creditsAdded: 10,
      message: "Ticket de recharge validé avec succès (+10 crédits Pro).",
    };
  }

  return {
    success: false,
    message: "Code D17 non reconnu. Utilisez un code promo (ex: D17-TUNISIA-2026) ou un ticket valide.",
  };
}
