import { eq, or, sql } from "@repo/database";
import db, { themesTable } from "@repo/database";

export interface ThemeConfig {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  buttonStyle: "solid" | "outline" | "ghost";
  questionSpacing: "compact" | "normal" | "spacious";
}

export class ThemesService {
  async listThemes(creatorId?: string): Promise<typeof themesTable.$inferSelect[]> {
    // Return default themes + creator's own themes
    const conditions = [eq(themesTable.isDefault, true)];
    if (creatorId) {
      conditions.push(eq(themesTable.createdBy, creatorId));
    }

    return db
      .select()
      .from(themesTable)
      .where(or(...conditions))
      .orderBy(sql`${themesTable.isDefault} desc, ${themesTable.createdAt} desc`);
  }

  async getThemeById(
    id: string
  ): Promise<typeof themesTable.$inferSelect | null> {
    const [theme] = await db
      .select()
      .from(themesTable)
      .where(eq(themesTable.id, id))
      .limit(1);
    return theme ?? null;
  }

  async createTheme(
    creatorId: string,
    input: { name: string; description?: string; config: ThemeConfig }
  ): Promise<typeof themesTable.$inferSelect> {
    const [theme] = await db
      .insert(themesTable)
      .values({
        name: input.name,
        description: input.description,
        config: input.config,
        isDefault: false,
        createdBy: creatorId,
      })
      .returning();

    if (!theme) throw new Error("FAILED_TO_CREATE_THEME");
    return theme;
  }
}

export const themesService = new ThemesService();
