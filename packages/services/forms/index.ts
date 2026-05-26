import { eq, and, desc, asc, ne, sql, inArray } from "@repo/database";
import db, {
  formsTable,
  formFieldsTable,
  formPagesTable,
  formResponsesTable,
  formViewsTable,
  usersTable,
} from "@repo/database";
import type {
  CreateFormInput,
  UpdateFormInput,
  CreateFormFieldInput,
  UpdateFormFieldInput,
} from "@repo/validators/forms";
import type { Form, FormField, FormWithStats } from "@repo/types/forms";
import { randomBytes } from "crypto";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  const suffix = randomBytes(4).toString("hex");
  return `${base}-${suffix}`;
}

function mapField(row: typeof formFieldsTable.$inferSelect): FormField {
  return {
    id: row.id,
    formId: row.formId,
    pageId: row.pageId ?? null,
    type: row.type as FormField["type"],
    label: row.label,
    placeholder: row.placeholder ?? null,
    helpText: row.helpText ?? null,
    required: row.required,
    order: row.order,
    options: (row.options as FormField["options"]) ?? null,
    validationRules: (row.validationRules as FormField["validationRules"]) ?? null,
    conditionalLogic: (row.conditionalLogic as FormField["conditionalLogic"]) ?? null,
    isLocked: row.isLocked ?? false,
  };
}

function mapForm(row: typeof formsTable.$inferSelect): Form {
  return {
    id: row.id,
    creatorId: row.creatorId,
    title: row.title,
    description: row.description ?? null,
    slug: row.slug,
    visibility: row.visibility as Form["visibility"],
    isArchived: row.isArchived,
    themeId: row.themeId ?? null,
    allowMultipleResponses: row.allowMultipleResponses,
    showProgressBar: row.showProgressBar,
    submitButtonText: row.submitButtonText ?? null,
    successMessage: row.successMessage ?? null,
    maxResponses: row.maxResponses ?? null,
    closeAfterDate: row.closeAfterDate ?? null,
    isPasswordProtected: row.isPasswordProtected ?? false,
    publishedAt: row.publishedAt ?? null,
    createdAt: row.createdAt ?? null,
    updatedAt: row.updatedAt ?? null,
  };
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class FormsService {
  /**
   * Create a new form for a creator
   */
  async createForm(creatorId: string, input: CreateFormInput): Promise<Form> {
    const slug = generateSlug(input.title);

    const [form] = await db
      .insert(formsTable)
      .values({
        creatorId,
        title: input.title,
        description: input.description,
        slug,
        themeId: input.themeId,
        allowMultipleResponses: input.allowMultipleResponses,
        showProgressBar: input.showProgressBar,
        shuffleFields: input.shuffleFields,
        maxResponses: input.maxResponses,
        submitButtonText: input.submitButtonText,
        successMessage: input.successMessage,
        redirectUrl: input.redirectUrl,
        notifyCreatorOnSubmission: input.notifyCreatorOnSubmission,
        sendConfirmationEmail: input.sendConfirmationEmail,
        visibility: "unpublished",
      })
      .returning();

    if (!form) throw new Error("FAILED_TO_CREATE_FORM");
    return mapForm(form);
  }

  /**
   * Get a single form by id, enforcing ownership
   */
  async getFormById(formId: string, creatorId?: string): Promise<Form | null> {
    const conditions = [eq(formsTable.id, formId)];
    if (creatorId) conditions.push(eq(formsTable.creatorId, creatorId));

    const [form] = await db
      .select()
      .from(formsTable)
      .where(and(...conditions))
      .limit(1);

    return form ? mapForm(form) : null;
  }

  /**
   * Get a form with its fields
   */
  async getFormWithFields(
    formId: string,
    creatorId?: string
  ): Promise<(Form & { fields: FormField[] }) | null> {
    const form = await this.getFormById(formId, creatorId);
    if (!form) return null;

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.order));

    return { ...form, fields: fields.map(mapField) };
  }

  /**
   * Get a form by slug (for public access)
   */
  async getFormBySlug(slug: string): Promise<(Form & { fields: FormField[] }) | null> {
    const [form] = await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.slug, slug))
      .limit(1);

    if (!form) return null;

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, form.id))
      .orderBy(asc(formFieldsTable.order));

    return { ...mapForm(form), fields: fields.map(mapField) };
  }

  /**
   * List all forms for a creator
   */
  async listForms(
    creatorId: string,
    opts: { includeArchived?: boolean } = {}
  ): Promise<FormWithStats[]> {
    const conditions = [eq(formsTable.creatorId, creatorId)];
    if (!opts.includeArchived) {
      conditions.push(eq(formsTable.isArchived, false));
    }

    const forms = await db
      .select()
      .from(formsTable)
      .where(and(...conditions))
      .orderBy(desc(formsTable.createdAt));

    // Get response counts in bulk
    const formIds = forms.map((f) => f.id);
    if (formIds.length === 0) return [];

    const responseCounts = await db
      .select({
        formId: formResponsesTable.formId,
        count: sql<number>`count(*)::int`,
      })
      .from(formResponsesTable)
      .where(inArray(formResponsesTable.formId, formIds))
      .groupBy(formResponsesTable.formId);

    const viewCounts = await db
      .select({
        formId: formViewsTable.formId,
        count: sql<number>`count(*)::int`,
      })
      .from(formViewsTable)
      .where(inArray(formViewsTable.formId, formIds))
      .groupBy(formViewsTable.formId);

    const responseMap = new Map(responseCounts.map((r) => [r.formId, r.count]));
    const viewMap = new Map(viewCounts.map((v) => [v.formId, v.count]));

    return forms.map((form) => {
      const responses = responseMap.get(form.id) ?? 0;
      const views = viewMap.get(form.id) ?? 0;
      const conversionRate = views > 0 ? (responses / views) * 100 : 0;
      return {
        ...mapForm(form),
        responseCount: responses,
        viewCount: views,
        conversionRate: Math.round(conversionRate * 10) / 10,
      };
    });
  }

  /**
   * Update form metadata
   */
  async updateForm(
    formId: string,
    creatorId: string,
    input: UpdateFormInput
  ): Promise<Form> {
    const [updated] = await db
      .update(formsTable)
      .set({
        ...input,
        closeAfterDate: input.closeAfterDate
          ? new Date(input.closeAfterDate)
          : undefined,
      })
      .where(
        and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId))
      )
      .returning();

    if (!updated) throw new Error("FORM_NOT_FOUND_OR_UNAUTHORIZED");
    return mapForm(updated);
  }

  /**
   * Publish a form (sets visibility to public or unlisted)
   */
  async publishForm(
    formId: string,
    creatorId: string,
    visibility: "public" | "unlisted" = "public"
  ): Promise<Form> {
    const [updated] = await db
      .update(formsTable)
      .set({ visibility, publishedAt: new Date() })
      .where(
        and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId))
      )
      .returning();

    if (!updated) throw new Error("FORM_NOT_FOUND_OR_UNAUTHORIZED");
    return mapForm(updated);
  }

  /**
   * Unpublish a form
   */
  async unpublishForm(formId: string, creatorId: string): Promise<Form> {
    const [updated] = await db
      .update(formsTable)
      .set({ visibility: "unpublished" })
      .where(
        and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId))
      )
      .returning();

    if (!updated) throw new Error("FORM_NOT_FOUND_OR_UNAUTHORIZED");
    return mapForm(updated);
  }

  /**
   * Archive a form (soft delete)
   */
  async archiveForm(formId: string, creatorId: string): Promise<Form> {
    const [updated] = await db
      .update(formsTable)
      .set({ isArchived: true, visibility: "unpublished" })
      .where(
        and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId))
      )
      .returning();

    if (!updated) throw new Error("FORM_NOT_FOUND_OR_UNAUTHORIZED");
    return mapForm(updated);
  }

  /**
   * Duplicate a form (copies form + fields with new ids and slug)
   */
  async duplicateForm(formId: string, creatorId: string): Promise<Form> {
    const existing = await this.getFormWithFields(formId, creatorId);
    if (!existing) throw new Error("FORM_NOT_FOUND_OR_UNAUTHORIZED");

    const newSlug = generateSlug(`${existing.title} copy`);

    const [newForm] = await db
      .insert(formsTable)
      .values({
        creatorId,
        title: `${existing.title} (Copy)`,
        description: existing.description ?? undefined,
        slug: newSlug,
        themeId: existing.themeId ?? undefined,
        allowMultipleResponses: existing.allowMultipleResponses,
        showProgressBar: existing.showProgressBar,
        submitButtonText: existing.submitButtonText ?? undefined,
        successMessage: existing.successMessage ?? undefined,
        visibility: "unpublished",
      })
      .returning();

    if (!newForm) throw new Error("FAILED_TO_DUPLICATE_FORM");

    // Duplicate fields
    if (existing.fields.length > 0) {
      await db.insert(formFieldsTable).values(
        existing.fields.map((f) => ({
          formId: newForm.id,
          type: f.type,
          label: f.label,
          placeholder: f.placeholder ?? undefined,
          helpText: f.helpText ?? undefined,
          required: f.required,
          order: f.order,
          options: f.options ?? undefined,
          validationRules: f.validationRules ?? undefined,
          conditionalLogic: f.conditionalLogic ?? undefined,
        }))
      );
    }

    return mapForm(newForm);
  }

  /**
   * Soft-delete a form (sets deletedAt timestamp instead of hard deleting).
   * Use restoreForm() to undo.
   */
  async deleteForm(formId: string, creatorId: string): Promise<void> {
    await db
      .update(formsTable)
      .set({ deletedAt: new Date(), visibility: "unpublished" })
      .where(
        and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId))
      );
  }

  /**
   * Restore a soft-deleted form.
   */
  async restoreForm(formId: string, creatorId: string): Promise<void> {
    await db
      .update(formsTable)
      .set({ deletedAt: null })
      .where(
        and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId))
      );
  }

  /**
   * Permanently delete a form (only if already soft-deleted).
   */
  async permanentlyDeleteForm(formId: string, creatorId: string): Promise<void> {
    await db
      .delete(formsTable)
      .where(
        and(
          eq(formsTable.id, formId),
          eq(formsTable.creatorId, creatorId),
          // Only allow hard delete if already soft-deleted
          sql`${formsTable.deletedAt} IS NOT NULL`
        )
      );
  }

  // ---------------------------------------------------------------------------
  // Fields
  // ---------------------------------------------------------------------------

  async addField(
    formId: string,
    creatorId: string,
    input: CreateFormFieldInput
  ): Promise<FormField> {
    // Verify ownership
    const form = await this.getFormById(formId, creatorId);
    if (!form) throw new Error("FORM_NOT_FOUND_OR_UNAUTHORIZED");

    const [field] = await db
      .insert(formFieldsTable)
      .values({
        formId,
        type: input.type,
        label: input.label,
        placeholder: input.placeholder,
        helpText: input.helpText,
        required: input.required,
        order: input.order,
        options: input.options ?? undefined,
        validationRules: input.validationRules ?? undefined,
        conditionalLogic: input.conditionalLogic ?? undefined,
        pageId: input.pageId,
      })
      .returning();

    if (!field) throw new Error("FAILED_TO_CREATE_FIELD");
    return mapField(field);
  }

  async updateField(
    fieldId: string,
    formId: string,
    creatorId: string,
    input: Partial<CreateFormFieldInput>
  ): Promise<FormField> {
    // Verify form ownership first
    const form = await this.getFormById(formId, creatorId);
    if (!form) throw new Error("FORM_NOT_FOUND_OR_UNAUTHORIZED");

    // Check if field is locked
    const [existingField] = await db
      .select({ isLocked: formFieldsTable.isLocked })
      .from(formFieldsTable)
      .where(and(eq(formFieldsTable.id, fieldId), eq(formFieldsTable.formId, formId)))
      .limit(1);
    if (existingField?.isLocked) throw new Error("FIELD_LOCKED");

    const [updated] = await db
      .update(formFieldsTable)
      .set({
        ...input,
        options: input.options ?? undefined,
        validationRules: input.validationRules ?? undefined,
        conditionalLogic: input.conditionalLogic ?? undefined,
      })
      .where(
        and(
          eq(formFieldsTable.id, fieldId),
          eq(formFieldsTable.formId, formId)
        )
      )
      .returning();

    if (!updated) throw new Error("FIELD_NOT_FOUND");
    return mapField(updated);
  }

  async deleteField(
    fieldId: string,
    formId: string,
    creatorId: string
  ): Promise<void> {
    const form = await this.getFormById(formId, creatorId);
    if (!form) throw new Error("FORM_NOT_FOUND_OR_UNAUTHORIZED");

    await db
      .delete(formFieldsTable)
      .where(
        and(
          eq(formFieldsTable.id, fieldId),
          eq(formFieldsTable.formId, formId)
        )
      );
  }

  /** Lock a field to prevent editing when responses exist */
  async lockField(
    fieldId: string,
    formId: string,
    creatorId: string
  ): Promise<FormField> {
    const form = await this.getFormById(formId, creatorId);
    if (!form) throw new Error("FORM_NOT_FOUND_OR_UNAUTHORIZED");

    const [updated] = await db
      .update(formFieldsTable)
      .set({ isLocked: true })
      .where(and(eq(formFieldsTable.id, fieldId), eq(formFieldsTable.formId, formId)))
      .returning();
    if (!updated) throw new Error("FIELD_NOT_FOUND");
    return mapField(updated);
  }

  /** Unlock a field */
  async unlockField(
    fieldId: string,
    formId: string,
    creatorId: string
  ): Promise<FormField> {
    const form = await this.getFormById(formId, creatorId);
    if (!form) throw new Error("FORM_NOT_FOUND_OR_UNAUTHORIZED");

    const [updated] = await db
      .update(formFieldsTable)
      .set({ isLocked: false })
      .where(and(eq(formFieldsTable.id, fieldId), eq(formFieldsTable.formId, formId)))
      .returning();
    if (!updated) throw new Error("FIELD_NOT_FOUND");
    return mapField(updated);
  }

  /** Auto-lock all fields for a form that has responses */
async autoLockFieldsWithResponses(formId: string): Promise<void> {
  const [responseCount] = await db
    .select({ count: sql`count(*)::int` })
    .from(formResponsesTable)
    .where(eq(formResponsesTable.formId, formId));

  if (typeof responseCount?.count === "number" && responseCount.count > 0) {
    await db
      .update(formFieldsTable)
      .set({ isLocked: true })
      .where(eq(formFieldsTable.formId, formId));
  }
}

  async reorderFields(
    formId: string,
    creatorId: string,
    fieldOrders: { fieldId: string; order: number }[]
  ): Promise<void> {
    const form = await this.getFormById(formId, creatorId);
    if (!form) throw new Error("FORM_NOT_FOUND_OR_UNAUTHORIZED");

    // Update each field order in parallel
    await Promise.all(
      fieldOrders.map(({ fieldId, order }) =>
        db
          .update(formFieldsTable)
          .set({ order })
          .where(
            and(
              eq(formFieldsTable.id, fieldId),
              eq(formFieldsTable.formId, formId)
            )
          )
      )
    );
  }

  // ---------------------------------------------------------------------------
  // Public explore listing
  // ---------------------------------------------------------------------------

  async listPublicForms(opts: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{ data: Form[]; total: number }> {
    const offset = (opts.page - 1) * opts.limit;

    const conditions = [
      eq(formsTable.visibility, "public"),
      eq(formsTable.isArchived, false),
    ];

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(formsTable)
      .where(and(...conditions));

    const forms = await db
      .select()
      .from(formsTable)
      .where(and(...conditions))
      .orderBy(desc(formsTable.publishedAt))
      .limit(opts.limit)
      .offset(offset);

    return {
      data: forms.map(mapForm),
      total: countResult?.count ?? 0,
    };
  }

  /**
   * Record a form view event
   */
  async recordView(
    formId: string,
    meta?: { ipAddress?: string; userAgent?: string; referrer?: string }
  ): Promise<void> {
    await db.insert(formViewsTable).values({
      formId,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
      referrer: meta?.referrer,
    });
  }

  /**
   * Count submitted responses for a form (used for limit checks)
   */
  async getResponseCount(formId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, formId));
    return result?.count ?? 0;
  }
  // ---------------------------------------------------------------------------
  // Password Protection
  // ---------------------------------------------------------------------------

  async setFormPassword(formId: string, creatorId: string, password: string | null): Promise<Form> {
    const form = await this.getFormById(formId, creatorId);
    if (!form) throw new Error("FORM_NOT_FOUND_OR_UNAUTHORIZED");

    let passwordHash: string | null = null;
    let isPasswordProtected = false;

    if (password) {
      const { createHash } = await import("crypto");
      passwordHash = createHash("sha256").update(password).digest("hex");
      isPasswordProtected = true;
    }

    const [updated] = await db
      .update(formsTable)
      .set({ isPasswordProtected, passwordHash })
      .where(and(eq(formsTable.id, formId), eq(formsTable.creatorId, creatorId)))
      .returning();

    if (!updated) throw new Error("UPDATE_FAILED");
    return mapForm(updated);
  }

  async verifyFormPassword(formId: string, password: string): Promise<boolean> {
    const [form] = await db
      .select({ passwordHash: formsTable.passwordHash, isPasswordProtected: formsTable.isPasswordProtected })
      .from(formsTable)
      .where(eq(formsTable.id, formId))
      .limit(1);

    if (!form || !form.isPasswordProtected || !form.passwordHash) return false;
    const { createHash } = await import("crypto");
    const hash = createHash("sha256").update(password).digest("hex");
    return hash === form.passwordHash;
  }

  // ---------------------------------------------------------------------------
  // Pages
  // ---------------------------------------------------------------------------

  async listPages(formId: string, creatorId: string): Promise<typeof formPagesTable.$inferSelect[]> {
    const form = await this.getFormById(formId, creatorId);
    if (!form) throw new Error("FORM_NOT_FOUND_OR_UNAUTHORIZED");

    return db
      .select()
      .from(formPagesTable)
      .where(eq(formPagesTable.formId, formId))
      .orderBy(asc(formPagesTable.order));
  }

  async addPage(formId: string, creatorId: string, input: { title?: string; description?: string; order?: number }): Promise<typeof formPagesTable.$inferSelect> {
    const form = await this.getFormById(formId, creatorId);
    if (!form) throw new Error("FORM_NOT_FOUND_OR_UNAUTHORIZED");

    // Determine order if not provided
    let order = input.order;
    if (order === undefined) {
      const [maxRow] = await db
        .select({ maxOrder: sql<number>`coalesce(max("order"), -1)` })
        .from(formPagesTable)
        .where(eq(formPagesTable.formId, formId));
      order = (maxRow?.maxOrder ?? -1) + 1;
    }

    const [page] = await db
      .insert(formPagesTable)
      .values({ formId, title: input.title, description: input.description, order })
      .returning();

    if (!page) throw new Error("FAILED_TO_CREATE_PAGE");
    return page;
  }

  async updatePage(pageId: string, formId: string, creatorId: string, input: { title?: string; description?: string }): Promise<typeof formPagesTable.$inferSelect> {
    const form = await this.getFormById(formId, creatorId);
    if (!form) throw new Error("FORM_NOT_FOUND_OR_UNAUTHORIZED");

    const [page] = await db
      .update(formPagesTable)
      .set(input)
      .where(and(eq(formPagesTable.id, pageId), eq(formPagesTable.formId, formId)))
      .returning();

    if (!page) throw new Error("PAGE_NOT_FOUND");
    return page;
  }

  async deletePage(pageId: string, formId: string, creatorId: string): Promise<void> {
    const form = await this.getFormById(formId, creatorId);
    if (!form) throw new Error("FORM_NOT_FOUND_OR_UNAUTHORIZED");

    // Null out pageId on fields that belonged to this page
    await db
      .update(formFieldsTable)
      .set({ pageId: null })
      .where(and(eq(formFieldsTable.formId, formId), eq(formFieldsTable.pageId, pageId)));

    await db
      .delete(formPagesTable)
      .where(and(eq(formPagesTable.id, pageId), eq(formPagesTable.formId, formId)));
  }

  async assignFieldToPage(fieldId: string, formId: string, creatorId: string, pageId: string | null): Promise<void> {
    const form = await this.getFormById(formId, creatorId);
    if (!form) throw new Error("FORM_NOT_FOUND_OR_UNAUTHORIZED");

    await db
      .update(formFieldsTable)
      .set({ pageId })
      .where(and(eq(formFieldsTable.id, fieldId), eq(formFieldsTable.formId, formId)));
  }

  // ---------------------------------------------------------------------------
  // Admin
  // ---------------------------------------------------------------------------

  async adminListAllForms(opts: { page: number; limit: number; search?: string }): Promise<{ data: Form[]; total: number }> {
    const offset = (opts.page - 1) * opts.limit;
    const conditions = [sql`${formsTable.deletedAt} IS NULL`];
    if (opts.search) {
      conditions.push(sql`${formsTable.title} ilike ${'%' + opts.search + '%'}`);
    }

    const [total, rows] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(formsTable).where(and(...conditions)).then(r => r[0]?.count ?? 0),
      db.select().from(formsTable).where(and(...conditions)).orderBy(desc(formsTable.createdAt)).limit(opts.limit).offset(offset),
    ]);

    return { data: rows.map(mapForm), total };
  }

  async adminListAllUsers(opts: { page: number; limit: number; search?: string }): Promise<{ data: Array<{ id: string; fullName: string; email: string; role: string; isActive: boolean; createdAt: Date | null; formCount: number }>; total: number }> {
    const offset = (opts.page - 1) * opts.limit;
    const conditions: Parameters<typeof and>[] = [];
    if (opts.search) {
      conditions.push(sql`(${usersTable.email} ilike ${'%' + opts.search + '%'} OR ${usersTable.fullName} ilike ${'%' + opts.search + '%'})` as any);
    }

    const whereClause = conditions.length > 0 ? and(...(conditions as any[])) : undefined;

    const [totalRows, users] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(whereClause).then(r => r[0]?.count ?? 0),
      db.select().from(usersTable).where(whereClause).orderBy(desc(usersTable.createdAt)).limit(opts.limit).offset(offset),
    ]);

    const formCounts = await db
      .select({ creatorId: formsTable.creatorId, count: sql<number>`count(*)::int` })
      .from(formsTable)
      .where(sql`${formsTable.deletedAt} IS NULL`)
      .groupBy(formsTable.creatorId);

    const countMap = new Map(formCounts.map(r => [r.creatorId, r.count]));

    return {
      data: users.map(u => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt,
        formCount: countMap.get(u.id) ?? 0,
      })),
      total: totalRows,
    };
  }

  async adminSetUserRole(userId: string, role: "admin" | "creator"): Promise<void> {
    await db.update(usersTable).set({ role }).where(eq(usersTable.id, userId));
  }

  async adminDeleteForm(formId: string): Promise<void> {
    await db.delete(formsTable).where(eq(formsTable.id, formId));
  }

  async adminGetStats(): Promise<{ totalUsers: number; totalForms: number; totalResponses: number; publishedForms: number }> {
    const [users, forms, responses, published] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable).then(r => r[0]?.count ?? 0),
      db.select({ count: sql<number>`count(*)::int` }).from(formsTable).where(sql`${formsTable.deletedAt} IS NULL`).then(r => r[0]?.count ?? 0),
      db.select({ count: sql<number>`count(*)::int` }).from(formResponsesTable).then(r => r[0]?.count ?? 0),
      db.select({ count: sql<number>`count(*)::int` }).from(formsTable).where(and(sql`${formsTable.deletedAt} IS NULL`, ne(formsTable.visibility, "unpublished"))).then(r => r[0]?.count ?? 0),
    ]);
    return { totalUsers: users, totalForms: forms, totalResponses: responses, publishedForms: published };
  }
}

export const formsService = new FormsService();
