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
    answerSummary?: Array<{ label: string; value: string }>;
  }): Promise<EmailResult> {
    const dashUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/dashboard/forms/${opts.formId}/responses/${opts.responseId}`;
    const answersHtml =
      opts.answerSummary && opts.answerSummary.length > 0
        ? `<table style="width:100%;border-collapse:collapse;margin:20px 0">
            ${opts.answerSummary
              .map(
                (a) => `
              <tr>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#5f6368;font-size:13px;width:40%">${escapeHtml(a.label)}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#202124;font-size:13px;font-weight:500">${escapeHtml(a.value)}</td>
              </tr>`,
              )
              .join("")}
          </table>`
        : "";

    return this.send({
      to: opts.creatorEmail,
      subject: `New response for "${opts.formTitle}"`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto">
          <h2 style="color:#1a73e8">You have a new response</h2>
          <p>Hi ${escapeHtml(opts.creatorName)},</p>
          <p>Someone just submitted a response to <strong>${escapeHtml(opts.formTitle)}</strong>.</p>
          ${opts.respondentEmail ? `<p style="color:#5f6368">From: ${escapeHtml(opts.respondentEmail)}</p>` : ""}
          ${answersHtml}
          <a href="${dashUrl}"
            style="display:inline-block;background:#1a73e8;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            View full response
          </a>
        </div>
      `,
    });
  }

  async sendDailyDigest(opts: {
    creatorEmail: string;
    creatorName: string;
    totalResponses: number;
    forms: Array<{ title: string; count: number; formId: string }>;
  }): Promise<EmailResult> {
    const rows = opts.forms
      .map(
        (f) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(f.title)}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600">${f.count}</td>
          </tr>`,
      )
      .join("");

    return this.send({
      to: opts.creatorEmail,
      subject: `You got ${opts.totalResponses} response${opts.totalResponses === 1 ? "" : "s"} today`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto">
          <h2 style="color:#1a73e8">Daily digest</h2>
          <p>Hi ${escapeHtml(opts.creatorName)},</p>
          <p>Here's what came in over the last 24 hours:</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <tr>
              <th style="text-align:left;padding:8px 12px;border-bottom:2px solid #eee;color:#5f6368">Form</th>
              <th style="text-align:left;padding:8px 12px;border-bottom:2px solid #eee;color:#5f6368">Responses</th>
            </tr>
            ${rows}
          </table>
          <a href="${process.env.APP_URL ?? "http://localhost:3000"}/dashboard/analytics"
            style="display:inline-block;background:#1a73e8;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            Open analytics
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const emailService = new EmailService();
