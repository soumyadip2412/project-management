import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/http";
import { useAuthStore } from "@/store/auth.store";
import { useTaskStore } from "@/store/task.store";
import { toast } from "sonner";
import {
  Folder,
  ArrowLeft,
  Loader2,
  Users,
  Shield,
  Trash2,
  Key,
  Kanban,
  Layers,
  Plus,
  UserPlus,
  Crown,
  ChevronDown,
  UserMinus,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/projects/KanbanBoard";
import { BacklogView } from "@/components/projects/BacklogView";
import { IssueDetailDrawer } from "@/components/projects/IssueDetailDrawer";
import { CreateIssueModal } from "@/components/projects/CreateIssueModal";
import { InviteMemberModal } from "@/components/projects/InviteMemberModal";

import { DeleteProjectModal } from "@/components/projects/DeleteProjectModal";

const ROLE_OPTIONS = ["project_manager", "admin", "member"];

const ROLE_COLORS = {
  project_manager: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  admin: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  owner: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  member: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  developer: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const ROLE_LABELS = {
  project_manager: "Project Manager",
  admin: "Admin",
  owner: "Owner",
  member: "Member",
  developer: "Developer",
};

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("board");

  // Member management state
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(null);
  const [removingMember, setRemovingMember] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(null);
  
  // Issue management state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { tasks, setTasks, fetchTasks, openCreateModal } = useTaskStore();

  const fetchProjectDetails = async () => {
    try {
      const res = await apiClient.get(`/projects/${projectId}`);
      setProject(res.data?.data || res.data);
    } catch (error) {
      toast.error("Failed to fetch project details");
      navigate("/app/projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksLocal = async () => {
    try {
      await fetchTasks(projectId);
    } catch (err) {
      setTasks([]);
    }
  };

  // Determine if current user is admin of this project
  const currentMember = project?.members?.find(
    (m) => {
      const mUserId = m.user?._id || m.user;
      return mUserId?.toString() === user?._id?.toString();
    }
  );
  const isAdmin =
    currentMember?.role === "project_manager" ||
    currentMember?.role === "admin" ||
    project?.owner?.toString() === user?._id?.toString() ||
    user?.systemRole === "super_admin";

  const fetchMembers = async () => {
    setMembersLoading(true);
    try {
      const res = await apiClient.get(`/projects/${projectId}/members`);
      const data = res.data?.data || res.data;
      setMembers(data?.members || data?.members || []);
    } catch (err) {
      // Fallback to project.members if the dedicated endpoint fails
      if (project?.members) {
        setMembers(project.members);
      }
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
      fetchTasksLocal();
    }
  }, [projectId]);

  useEffect(() => {
    if (activeTab === "members" && projectId) {
      fetchMembers();
    }
  }, [activeTab, projectId]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiClient.delete(`/projects/${projectId}`);
      toast.success("Project deleted successfully");
      setIsDeleteModalOpen(false);
      navigate("/app/projects");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete project");
      setDeleting(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    setUpdatingRole(memberId);
    try {
      await apiClient.put(`/projects/${projectId}/members/${memberId}`, {
        newRole,
      });
      toast.success("Role updated successfully");
      setRoleDropdownOpen(null);
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName || "this member"} from the project?`)) return;

    setRemovingMember(memberId);
    try {
      await apiClient.delete(`/projects/${projectId}/members/${memberId}`);
      toast.success("Member removed successfully");
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove member");
    } finally {
      setRemovingMember(null);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-16 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
        <p className="mt-3 text-sm text-muted-foreground">Loading workspace project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="px-4 py-12 max-w-4xl mx-auto text-center">
        <h2 className="text-xl font-semibold text-foreground">Project Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The project you are looking for does not exist or you do not have access.
        </p>
        <Link
          to="/app/projects"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-sky-400 hover:text-sky-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top back navigation */}
      <Link
        to="/app/projects"
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Folder className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              {project.key && (
                <span className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-0.5 rounded-md bg-muted border border-border text-foreground">
                  <Key className="h-3 w-3 text-sky-400" />
                  {project.key}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {project.description || "No description provided."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openCreateModal("todo")}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            New Issue
          </button>
          {isAdmin && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-2 text-sm font-semibold transition-all disabled:opacity-50"
              title="Delete Project"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("board")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "board"
              ? "border-sky-500 text-sky-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Kanban className="h-4 w-4" />
          Kanban Board
        </button>

        <button
          onClick={() => setActiveTab("backlog")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "backlog"
              ? "border-sky-500 text-sky-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4" />
          Backlog & Sprints
        </button>

        <button
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "members"
              ? "border-sky-500 text-sky-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          Members ({project.members?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === "board" && <KanbanBoard projectId={projectId} />}
        {activeTab === "backlog" && <BacklogView projectId={projectId} />}
        {activeTab === "members" && (
          <div className="space-y-6 max-w-3xl">
            {/* Members Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-sky-400" />
                Project Members
              </h3>
              {isAdmin && (
                <Button
                  onClick={() => setInviteModalOpen(true)}
                  className="gap-2"
                  size="sm"
                >
                  <UserPlus className="h-4 w-4" />
                  Invite Member
                </Button>
              )}
            </div>

            {/* Members List */}
            {membersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-6 py-3 border-b border-border bg-muted/30">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Member</span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center min-w-[140px]">Role</span>
                  {isAdmin && (
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center w-10">
                    </span>
                  )}
                </div>

                {/* Member Rows */}
                {members.map((m, idx) => {
                  const memberUser = m.user || {};
                  const memberId = memberUser._id || memberUser;
                  const memberName = memberUser.fullName || memberUser.username || "Unknown";
                  const memberEmail = memberUser.email || "";
                  const memberInitial = (memberName[0] || "U").toUpperCase();
                  const memberRole = m.role || "member";
                  const isOwner = project.owner?.toString() === memberId?.toString();
                  const isSelf = user?._id?.toString() === memberId?.toString();
                  const roleColor = ROLE_COLORS[memberRole] || ROLE_COLORS.member;

                  return (
                    <div
                      key={memberId || idx}
                      className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-6 py-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      {/* User Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="bg-sky-500/10 text-sky-400 font-bold text-xs">
                            {memberInitial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {memberName}
                            </p>
                            {isOwner && (
                              <Crown className="h-3.5 w-3.5 text-amber-400 shrink-0" title="Project Owner" />
                            )}
                            {isSelf && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400">
                                you
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{memberEmail}</p>
                        </div>
                      </div>

                      {/* Role Badge / Dropdown */}
                      <div className="relative min-w-[140px] flex justify-center">
                        {isAdmin && !isOwner && !isSelf ? (
                          <div className="relative">
                            <button
                              onClick={() =>
                                setRoleDropdownOpen(
                                  roleDropdownOpen === memberId ? null : memberId
                                )
                              }
                              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border uppercase tracking-wider transition-colors hover:opacity-80 ${roleColor}`}
                            >
                              <Shield className="h-3 w-3" />
                              {ROLE_LABELS[memberRole] || memberRole}
                              <ChevronDown className="h-3 w-3" />
                            </button>

                            {/* Role Dropdown */}
                            {roleDropdownOpen === memberId && (
                              <div className="absolute top-full mt-1 right-0 z-20 w-48 rounded-xl border border-border bg-card shadow-xl py-1">
                                {ROLE_OPTIONS.map((roleOpt) => (
                                  <button
                                    key={roleOpt}
                                    onClick={() => handleRoleChange(memberId, roleOpt)}
                                    disabled={updatingRole === memberId}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                      memberRole === roleOpt
                                        ? "text-sky-400 bg-sky-500/10 font-semibold"
                                        : "text-foreground hover:bg-muted"
                                    }`}
                                  >
                                    {ROLE_LABELS[roleOpt] || roleOpt}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border uppercase tracking-wider ${roleColor}`}
                          >
                            {isOwner ? <Crown className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                            {isOwner ? "Owner" : ROLE_LABELS[memberRole] || memberRole}
                          </span>
                        )}
                      </div>

                      {/* Remove Button */}
                      {isAdmin && (
                        <div className="w-10 flex justify-center">
                          {!isOwner && !isSelf ? (
                            <button
                              onClick={() => handleRemoveMember(memberId, memberName)}
                              disabled={removingMember === memberId}
                              className="rounded-lg p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                              title="Remove member"
                            >
                              {removingMember === memberId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <UserMinus className="h-4 w-4" />
                              )}
                            </button>
                          ) : (
                            <div className="w-4" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {members.length === 0 && (
                  <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No members found. Invite team members to collaborate.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <IssueDetailDrawer projectId={projectId} />
      <CreateIssueModal projectId={projectId} members={project.members || []} />
      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        projectId={projectId}
        onMemberAdded={() => {
          fetchMembers();
          fetchProjectDetails();
        }}
      />
      <DeleteProjectModal
        isOpen={isDeleteModalOpen}
        onClose={setIsDeleteModalOpen}
        project={project}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}
