import { eq } from "@repo/database";
import db, { emailPreferencesTable } from "@repo/database";
import type { EmailPreferencesInput } from "@repo/validators/auth";

const DEFAULT_PREFERENCES: EmailPreferencesInput = {
  marketingEmails: true,
  productUpdates: true,
  responseNotifications: true,
  weeklyDigest: false,
};

export class EmailPreferencesService {
  async createDefaults(userId: string) {
    const [row] = await db
      .insert(emailPreferencesTable)
      .values({ userId, ...DEFAULT_PREFERENCES })
      .onConflictDoNothing()
      .returning();
    return row ?? (await this.getByUserId(userId));
  }

  async getByUserId(userId: string) {
    const [row] = await db
      .select()
      .from(emailPreferencesTable)
      .where(eq(emailPreferencesTable.userId, userId))
      .limit(1);

    if (!row) {
      return this.createDefaults(userId);
    }
    return row;
  }

  async update(userId: string, input: EmailPreferencesInput) {
    const existing = await this.getByUserId(userId);
    const [row] = await db
      .update(emailPreferencesTable)
      .set({
        marketingEmails: input.marketingEmails,
        productUpdates: input.productUpdates,
        responseNotifications: input.responseNotifications,
        weeklyDigest: input.weeklyDigest,
      })
      .where(eq(emailPreferencesTable.id, existing.id))
      .returning();
    if (!row) throw new Error("FAILED_TO_UPDATE_EMAIL_PREFERENCES");
    return row;
  }
}

export const emailPreferencesService = new EmailPreferencesService();
