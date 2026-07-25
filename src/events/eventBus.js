/**
 * ═══════════════════════════════════════════════
 *  EVENT BUS
 *  Decoupled event-driven side effects
 *  Emitters: controllers → Events → Handlers
 * ═══════════════════════════════════════════════
 */

import { EventEmitter } from "events";
import logger from "../utils/logger.js";

class AppEventBus extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(50);
    }

    /**
     * Emit with error handling — never let a handler crash the app.
     */
    safeEmit(event, data) {
        try {
            this.emit(event, data);
        } catch (err) {
            logger.error(`Event handler error for "${event}":`, err);
        }
    }
}

export const eventBus = new AppEventBus();

// ─── Event Constants ─────────────────────────
export const Events = {
    // Task events
    TASK_CREATED: "task:created",
    TASK_UPDATED: "task:updated",
    TASK_DELETED: "task:deleted",
    TASK_ASSIGNED: "task:assigned",
    TASK_UNASSIGNED: "task:unassigned",
    TASK_STATUS_CHANGED: "task:status_changed",
    TASK_COMMENTED: "task:commented",

    // Sprint events
    SPRINT_CREATED: "sprint:created",
    SPRINT_STARTED: "sprint:started",
    SPRINT_COMPLETED: "sprint:completed",

    // Project events
    PROJECT_CREATED: "project:created",
    PROJECT_UPDATED: "project:updated",
    PROJECT_ARCHIVED: "project:archived",
    PROJECT_MEMBER_ADDED: "project:member_added",
    PROJECT_MEMBER_REMOVED: "project:member_removed",

    // Comment events
    COMMENT_CREATED: "comment:created",
    COMMENT_MENTIONED: "comment:mentioned",

    // Approval events
    APPROVAL_REQUESTED: "approval:requested",
    APPROVAL_DECIDED: "approval:decided",
};
