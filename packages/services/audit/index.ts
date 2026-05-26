import db, { auditLogsTable } from "@repo/database";
import type { InsertAuditLog } from "@repo/database";

export class AuditService {
  /**
   * Record an audit log entry.
   * Fire-and-forget safe — errors are silently swallowed.
   */
  async log(entry: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    previousValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      await db.insert(auditLogsTable).values({
        userId: entry.userId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        previousValues: entry.previousValues,
        newValues: entry.newValues,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      } as InsertAuditLog);
    } catch {
      // Audit log failures must never block primary operations
    }
  }

  /** Convenience: log a form action */
  async logFormAction(opts: {
    userId: string;
    action: "form.created" | "form.updated" | "form.deleted" | "form.published" | "form.unpublished" | "form.duplicated";
    formId: string;
    previousValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    ipAddress?: string;
  }): Promise<void> {
    return this.log({
      userId: opts.userId,
      action: opts.action,
      entityType: "form",
      entityId: opts.formId,
      previousValues: opts.previousValues,
      newValues: opts.newValues,
      ipAddress: opts.ipAddress,
    });
  }

  /** Convenience: log a response action */
  async logResponseAction(opts: {
    userId?: string;
    action: "response.submitted" | "response.marked_spam" | "response.deleted";
    responseId: string;
    ipAddress?: string;
  }): Promise<void> {
    return this.log({
      userId: opts.userId,
      action: opts.action,
      entityType: "response",
      entityId: opts.responseId,
      ipAddress: opts.ipAddress,
    });
  }
}

export const auditService = new AuditService();
