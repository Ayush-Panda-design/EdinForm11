import { eq, and, desc, sql } from "@repo/database";
import db, { templatesTable, formsTable, formFieldsTable } from "@repo/database";

export class TemplatesService {
  async listPublicTemplates(opts: {
    category?: string;
    page: number;
    limit: number;
  }): Promise<{ data: typeof templatesTable.$inferSelect[]; total: number }> {
    const conditions = [eq(templatesTable.isPublic, true)];
    if (opts.category) {
      conditions.push(eq(templatesTable.category, opts.category));
    }

    const offset = (opts.page - 1) * opts.limit;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(templatesTable)
      .where(and(...conditions));

    const data = await db
      .select()
      .from(templatesTable)
      .where(and(...conditions))
      .orderBy(desc(templatesTable.createdAt))
      .limit(opts.limit)
      .offset(offset);

    return { data, total: countResult?.count ?? 0 };
  }

  async getTemplateById(
    id: string
  ): Promise<typeof templatesTable.$inferSelect | null> {
    const [template] = await db
      .select()
      .from(templatesTable)
      .where(eq(templatesTable.id, id))
      .limit(1);

    return template ?? null;
  }

  /**
   * Create a form from a template — copies form snapshot and fields
   */
  async createFormFromTemplate(
    templateId: string,
    creatorId: string
  ): Promise<string> {
    const template = await this.getTemplateById(templateId);
    if (!template) throw new Error("TEMPLATE_NOT_FOUND");

    const snapshot = template.formSnapshot as {
      title: string;
      description?: string;
      fields: Array<{
        type: string;
        label: string;
        required: boolean;
        order: number;
        placeholder?: string;
        options?: { value: string; label: string }[];
      }>;
    };

    const slug = `${snapshot.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80)}-${Math.random().toString(36).slice(2, 8)}`;

    const [form] = await db
      .insert(formsTable)
      .values({
        creatorId,
        title: snapshot.title,
        description: snapshot.description,
        slug,
        visibility: "unpublished",
      })
      .returning();

    if (!form) throw new Error("FAILED_TO_CREATE_FORM");

    if (snapshot.fields?.length > 0) {
      await db.insert(formFieldsTable).values(
        snapshot.fields.map((f: typeof snapshot.fields[number]) => ({
          formId: form.id,
          type: f.type as typeof formFieldsTable.$inferInsert["type"],
          label: f.label,
          required: f.required,
          order: f.order,
          placeholder: f.placeholder,
          options: f.options ?? undefined,
        }))
      );
    }

    // Increment usage count
    await db
      .update(templatesTable)
      .set({
        usageCount: sql`(${templatesTable.usageCount}::int + 1)::text`,
      })
      .where(eq(templatesTable.id, templateId));

    return form.id;
  }
}

export const templatesService = new TemplatesService();
