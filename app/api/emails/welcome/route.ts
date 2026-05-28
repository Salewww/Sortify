import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    const firstName = name?.split(' ')[0] || 'there';

    await resend.emails.send({
      from: 'Sortify <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to Sortify — your first client is 2 minutes away',
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

    <!-- Header -->
    <div style="background:#4f46e5;padding:32px 40px;">
      <div style="display:inline-flex;align-items:center;gap:10px;">
        <div style="width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <span style="color:white;font-weight:bold;font-size:16px;">→</span>
        </div>
        <span style="color:white;font-size:18px;font-weight:700;">Sortify</span>
      </div>
    </div>

    <!-- Body -->
    <div style="padding:40px;">
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
        Welcome, ${firstName} 👋
      </h1>
      <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
        You've joined hundreds of bookkeepers who've stopped chasing clients for documents.
        Here's how to get your first client set up in under 2 minutes:
      </p>

      <!-- Steps -->
      <div style="background:#f9fafb;border-radius:10px;padding:24px;margin-bottom:24px;">
        <div style="margin-bottom:16px;display:flex;gap:14px;">
          <div style="width:28px;height:28px;background:#4f46e5;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;">1</div>
          <div>
            <div style="font-weight:600;color:#111827;font-size:14px;">Add your first client</div>
            <div style="color:#6b7280;font-size:13px;margin-top:2px;">Enter their name and email — takes 30 seconds.</div>
          </div>
        </div>
        <div style="margin-bottom:16px;display:flex;gap:14px;">
          <div style="width:28px;height:28px;background:#4f46e5;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;">2</div>
          <div>
            <div style="font-weight:600;color:#111827;font-size:14px;">Pick a task template</div>
            <div style="color:#6b7280;font-size:13px;margin-top:2px;">QBO access, Xero, bank statements — or AI-generate a custom pack.</div>
          </div>
        </div>
        <div style="display:flex;gap:14px;">
          <div style="width:28px;height:28px;background:#4f46e5;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;">3</div>
          <div>
            <div style="font-weight:600;color:#111827;font-size:14px;">Send the portal link</div>
            <div style="color:#6b7280;font-size:13px;margin-top:2px;">One link. Client completes everything. You get notified in real-time.</div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:32px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/clients/new"
           style="display:inline-block;background:#4f46e5;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
          Add your first client →
        </a>
        <p style="margin:12px 0 0;color:#9ca3af;font-size:12px;">
          Your 14-day free trial is active. No credit card needed yet.
        </p>
      </div>

      <!-- PS -->
      <div style="border-top:1px solid #f3f4f6;padding-top:24px;">
        <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
          Questions? Just reply to this email — I read every one.<br>
          <strong style="color:#111827;">Saso</strong>, founder of Sortify
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f3f4f6;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">
        © 2026 Sortify · <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy" style="color:#9ca3af;">Privacy</a> · <a href="${process.env.NEXT_PUBLIC_APP_URL}/terms" style="color:#9ca3af;">Terms</a>
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Welcome email error:', error);
    // Non-fatal — don't block signup
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
