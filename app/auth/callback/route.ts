import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session?.user) {
      const user = session.user;
      
      // Ensure profile exists in profiles table with 5 free credits
      try {
        const checkRes: any = await supabase
          .from("profiles")
          .select("id, credit_balance")
          .eq("id", user.id)
          .single();

        if (!checkRes?.data) {
          await (supabase.from("profiles") as any).insert({
            id: user.id,
            email: user.email || "",
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Utilisateur",
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            role: "user",
            status: "active",
            credit_balance: 5,
          });
        }
      } catch (profileErr) {
        console.error("Profile auto-creation error:", profileErr);
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // Return the user to an error page or login with instructions
  return NextResponse.redirect(new URL("/login?error=auth_callback_failed", requestUrl.origin));
}
