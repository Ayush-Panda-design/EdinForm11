import { eq, and, desc, sql } from "@repo/database";
import db, { templatesTable, formsTable, formFieldsTable } from "@repo/database";
import {
  BUILTIN_TEMPLATES,
  getBuiltinTemplate,
  listBuiltinTemplates,
  TEMPLATE_CATEGORIES,
  type BuiltinTemplate,
} from "./builtin";

export { TEMPLATE_CATEGORIES, BUILTIN_TEMPLATES };

export type TemplateListItem = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  previewImageUrl: string | null;
  isPublic: boolean;
  usageCount: string | null;
  createdAt: Date | null;
  tags?: string[];
  estimatedMinutes?: number;
  fieldCount?: number;
  isBuiltin?: boolean;
  formSnapshot?: BuiltinTemplate["formSnapshot"];
};

function mapBuiltin(t: BuiltinTemplate): TemplateListItem {
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
    previewImageUrl: null,
    isPublic: true,
    usageCount: "0",
    createdAt: null,
    tags: t.tags,
    estimatedMinutes: t.estimatedMinutes,
    fieldCount: t.fieldCount,
    isBuiltin: true,
    formSnapshot: t.formSnapshot,
  };
}

export class TemplatesService {
  async listPublicTemplates(opts: {
    category?: string;
    search?: string;
    page: number;
    limit: number;
  }): Promise<{ data: TemplateListItem[]; total: number; categories: string[] }> {
    const builtins = listBuiltinTemplates({
      category: opts.category,
      search: opts.search,
    }).map(mapBuiltin);

    const conditions = [eq(templatesTable.isPublic, true)];
    if (opts.category && opts.category !== "All") {
      conditions.push(eq(templatesTable.category, opts.category));
    }

    let dbTemplates: TemplateListItem[] = [];
    try {
      const rows = await db
        .select()
        .from(templatesTable)
        .where(and(...conditions))
        .orderBy(desc(templatesTable.createdAt));

      dbTemplates = rows
        .filter((t) => {
          if (!opts.search?.trim()) return true;
          const q = opts.search.toLowerCase();
          return (
            t.name.toLowerCase().includes(q) ||
            (t.description ?? "").toLowerCase().includes(q) ||
            (t.category ?? "").toLowerCase().includes(q)
          );
        })
        .map((t) => {
          const snap = t.formSnapshot as { fields?: unknown[] };
          return {
            id: t.id,
            name: t.name,
            description: t.description,
            category: t.category,
            previewImageUrl: t.previewImageUrl,
            isPublic: t.isPublic,
            usageCount: t.usageCount,
            createdAt: t.createdAt,
            fieldCount: Array.isArray(snap?.fields) ? snap.fields.length : 0,
            isBuiltin: false,
          };
        });
    } catch {
      dbTemplates = [];
    }

    const merged = [...builtins, ...dbTemplates];
    const total = merged.length;
    const offset = (opts.page - 1) * opts.limit;
    const data = merged.slice(offset, offset + opts.limit);

    return {
      data,
      total,
      categories: [...TEMPLATE_CATEGORIES],
    };
  }

  async getTemplateById(id: string): Promise<TemplateListItem | null> {
    if (id.startsWith("builtin:")) {
      const t = getBuiltinTemplate(id);
      return t ? mapBuiltin(t) : null;
    }

    const [template] = await db
      .select()
      .from(templatesTable)
      .where(eq(templatesTable.id, id))
      .limit(1);

    if (!template) return null;
    const snap = template.formSnapshot as BuiltinTemplate["formSnapshot"];
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      previewImageUrl: template.previewImageUrl,
      isPublic: template.isPublic,
      usageCount: template.usageCount,
      createdAt: template.createdAt,
      formSnapshot: snap,
      fieldCount: snap?.fields?.length ?? 0,
      isBuiltin: false,
    };
  }

  async createFormFromTemplate(templateId: string, creatorId: string): Promise<string> {
    const template = await this.getTemplateById(templateId);
    if (!template?.formSnapshot) throw new Error("TEMPLATE_NOT_FOUND");

    const snapshot = template.formSnapshot;

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
        submitButtonText: snapshot.submitButtonText ?? "Submit",
        successMessage: snapshot.successMessage ?? "Thank you for your response!",
        showProgressBar: snapshot.showProgressBar ?? true,
      })
      .returning();

    if (!form) throw new Error("FAILED_TO_CREATE_FORM");

    if (snapshot.fields?.length > 0) {
      await db.insert(formFieldsTable).values(
        snapshot.fields.map((f) => ({
          formId: form.id,
          type: f.type as typeof formFieldsTable.$inferInsert["type"],
          label: f.label,
          required: f.required,
          order: f.order,
          placeholder: f.placeholder,
          helpText: f.helpText,
          options: f.options ?? undefined,
          validationRules: f.validationRules ?? undefined,
        })),
      );
    }

    if (!templateId.startsWith("builtin:")) {
      await db
        .update(templatesTable)
        .set({
          usageCount: sql`(${templatesTable.usageCount}::int + 1)::text`,
        })
        .where(eq(templatesTable.id, templateId));
    }

    return form.id;
  }
}

export const templatesService = new TemplatesService();
