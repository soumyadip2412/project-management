import Project from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { AuditLog } from "../models/auditLog.models.js";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/api-response.js";

export const getDashboardStats = asynchandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Fetch user's projects
  const userProjects = await Project.find({ "members.user": userId })
    .sort({ updatedAt: -1 })
    .lean();

  const projectIds = userProjects.map((p) => p._id);

  // 2. Fetch tasks count & breakdown across user projects
  const totalTasks = await Task.countDocuments({ project: { $in: projectIds } });
  
  const activeTasks = await Task.countDocuments({
    project: { $in: projectIds },
    status: { $in: ["todo", "in_progress", "in_review", "qa_testing"] }
  });

  const completedTasks = await Task.countDocuments({
    project: { $in: projectIds },
    status: "done"
  });

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 3. Count unique team members across all projects
  const memberSet = new Set();
  userProjects.forEach((p) => {
    p.members?.forEach((m) => {
      if (m.user) memberSet.add(m.user.toString());
    });
  });

  // 4. Fetch recent tasks
  const recentTasks = await Task.find({ project: { $in: projectIds } })
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate("project", "name key")
    .populate("assignee", "fullName username avatar")
    .lean();

  // 5. Fetch recent audit logs / activity
  let recentActivities = [];
  try {
    recentActivities = await AuditLog.find({ project: { $in: projectIds } })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("performedBy", "fullName username")
      .lean();
  } catch (err) {
    recentActivities = [];
  }

  const stats = {
    totalProjects: userProjects.length,
    activeTasks,
    completedTasks,
    totalTasks,
    completionRate,
    teamMembers: memberSet.size,
    recentProjects: userProjects.slice(0, 4),
    recentTasks,
    recentActivities
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Dashboard statistics retrieved successfully"));
});
