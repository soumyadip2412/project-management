/**
 * ═══════════════════════════════════════════════
 *  AUDIT MIDDLEWARE
 *  Automatically logs mutations to AuditLog
 *  Usage: router.post("/", audit("task", "created"), handler)
 * ═══════════════════════════════════════════════
 */

import { AuditLog } from "../models/auditLog.models.js";
import logger from "../utils/logger.js";

/**
 * Audit middleware factory.
 * Intercepts res.json() to log the action after a successful response.
 *
 * @param {string} entityType - The entity being modified (e.g., "task", "project")
 * @param {string} action - The action being performed (e.g., "created", "updated")
 */
export const audit = (entityType, action) => {
    return (req, res, next) => {
        const originalJson = res.json.bind(res);

        res.json = function (body) {
            // Only log on successful responses
            if (res.statusCode < 400) {
                const auditEntry = {
                    workspace: req.params.workspaceId || req.body?.workspace,
                    project: req.params.projectId || req.body?.project,
                    entityType,
                    entityId: body?.data?._id || req.params.taskId || req.params.sprintId || req.params.commentId,
                    action,
                    actor: req.user?._id,
                    changes: req._auditChanges || [],
                    ipAddress: req.ip || req.connection?.remoteAddress,
                    userAgent: req.get("User-Agent")
                };

                // Fire and forget — never block the response
                AuditLog.create(auditEntry).catch((err) =>
                    logger.error("Audit log write failed:", err)
                );
            }

            return originalJson(body);
        };

        next();
    };
};

/**
 * Helper to track field changes for audit logging.
 * Call in controllers before updating:
 *   trackChanges(req, originalDoc, updatedFields);
 */
export const trackChanges = (req, originalDoc, updatedFields) => {
    if (!req._auditChanges) {
        req._auditChanges = [];
    }
    for (const [field, newValue] of Object.entries(updatedFields)) {
        const oldValue = originalDoc[field];
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            req._auditChanges.push({
                field,
                oldValue: oldValue ?? null,
                newValue: newValue ?? null
            });
        }
    }
};
