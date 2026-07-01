/**
 * Email service powered by Resend.
 * Falls back to console logging in development if RESEND_API_KEY is not set.
 */

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

const DEFAULT_FROM = process.env.EMAIL_FROM ?? "FormCraft <noreply@formcraft.io>";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export class EmailService {
  async send(opts: SendEmailOptions): Promise<EmailResult> {
    if (!RESEND_API_KEY) {
      console.log("[EmailService] Would send email:", {
        to: opts.to,
        subject: opts.subject,
      });
      return { success: true, id: "dev-no-op" };
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: opts.from ?? DEFAULT_FROM,
          to: Array.isArray(opts.to) ? opts.to : [opts.to],
          subject: opts.subject,
          html: opts.html,
          reply_to: opts.replyTo,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        return { success: false, error: body };
      }

      const data = (await res.json()) as { id: string };
      return { success: true, id: data.id };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return { success: false, error: message };
    }
  }

  // ---------------------------------------------------------------------------
  // Pre-built email templates
  // ---------------------------------------------------------------------------

  async sendWelcomeEmail(to: string, fullName: string): Promise<EmailResult> {
    return this.send({
      to,
      subject: "Welcome to FormCraft 🎉",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto">
          <h1 style="color:#6366f1">Welcome to FormCraft, ${fullName}!</h1>
          <p>We're thrilled to have you on board. Start building beautiful forms in minutes.</p>
          <a href="${process.env.APP_URL ?? "http://localhost:3000"}/dashboard"
            style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            Go to Dashboard
          </a>
          <p style="color:#888;font-size:12px;margin-top:32px">FormCraft — The modern form builder</p>
        </div>
      `,
    });
  }

  async sendEmailVerification(opts: {
    to: string;
    fullName: string;
    verifyUrl: string;
  }): Promise<EmailResult> {
    return this.send({
      to: opts.to,
      subject: "Verify your FormCraft email address",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto">
          <h2 style="color:#6366f1">Verify your email address</h2>
          <p>Hi ${opts.fullName},</p>
          <p>Please click the button below to verify your email address. This link expires in 24 hours.</p>
          <a href="${opts.verifyUrl}"
            style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            Verify Email
          </a>
          <p style="color:#888;font-size:12px;margin-top:16px">If you didn't create a FormCraft account, you can safely ignore this email.</p>
        </div>
      `,
    });
  }

  async sendPasswordReset(opts: {
    to: string;
    fullName: string;
    resetUrl: string;
  }): Promise<EmailResult> {
    return this.send({
      to: opts.to,
      subject: "Reset your FormCraft password",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto">
          <h2 style="color:#6366f1">Reset your password</h2>
          <p>Hi ${opts.fullName},</p>
          <p>We received a request to reset your password. Click the link below to set a new one. This link expires in <strong>1 hour</strong>.</p>
          <a href="${opts.resetUrl}"
            style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            Reset Password
          </a>
          <p style="color:#888;font-size:12px;margin-top:16px">If you didn't request this, ignore this email. Your password won't be changed.</p>
        </div>
      `,
    });
  }

  async sendNewResponseNotification(opts: {
    creatorEmail: string;
    creatorName: string;
    formTitle: string;
    formId: string;
    responseId: string;
    respondentEmail?: string;
  }): Promise<EmailResult> {
    const dashUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/forms/${opts.formId}/responses/${opts.responseId}`;
    return this.send({
      to: opts.creatorEmail,
      subject: `New response for "${opts.formTitle}"`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto">
          <h2 style="color:#6366f1">You have a new response!</h2>
          <p>Hi ${opts.creatorName},</p>
          <p>Someone just submitted a response to your form <strong>${opts.formTitle}</strong>.</p>
          ${opts.respondentEmail ? `<p>Respondent: ${opts.respondentEmail}</p>` : ""}
          <a href="${dashUrl}"
            style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            View Response
          </a>
        </div>
      `,
    });
  }

  async sendResponseConfirmation(opts: {
    to: string;
    respondentName?: string;
    formTitle: string;
    customMessage?: string;
  }): Promise<EmailResult> {
    const name = opts.respondentName ?? "there";
    return this.send({
      to: opts.to,
      subject: `Your response to "${opts.formTitle}" has been received`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto">
          <h2 style="color:#6366f1">Response received ✅</h2>
          <p>Hi ${name},</p>
          <p>${opts.customMessage ?? `Thank you for filling out <strong>${opts.formTitle}</strong>. We've received your response.`}</p>
          <p style="color:#888;font-size:12px;margin-top:32px">Powered by FormCraft</p>
        </div>
      `,
    });
  }

  /** @deprecated Use sendPasswordReset instead */
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<EmailResult> {
    const resetUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/reset-password?token=${resetToken}`;
    return this.sendPasswordReset({ to, fullName: "there", resetUrl });
  }
}

export const emailService = new EmailService();
