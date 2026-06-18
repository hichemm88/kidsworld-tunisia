import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { to, subject, html } = await request.json();
  if (!to?.length || !subject || !html) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY non configurée. Ajoutez-la dans les variables d'environnement Vercel." },
      { status: 500 }
    );
  }

  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "KidsWorld Tunisia <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      to.map((recipient: { email: string; name: string }) => ({
        from: FROM_EMAIL,
        to: [recipient.email],
        subject,
        html: `
          <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <div style="background: #0D2461; padding: 16px 24px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 20px;">KidsWorld Tunisia</h1>
            </div>
            <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              ${html}
              <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
              <p style="font-size: 11px; color: #9ca3af; margin: 0;">
                Vous recevez cet email car vous êtes inscrit sur KidsWorld Tunisia.
                <br>© ${new Date().getFullYear()} KidsWorld Tunisia
              </p>
            </div>
          </div>
        `,
      }))
    ),
  });

  if (!res.ok) {
    const error = await res.text();
    return NextResponse.json({ error: `Resend error: ${error}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sent: to.length });
}
