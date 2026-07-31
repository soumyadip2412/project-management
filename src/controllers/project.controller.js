import Project from '../models/project.models.js';
import { User } from '../models/user.models.js';
import Workspace from '../models/workspace.models.js';
import { asynchandler } from '../utils/asynchandler.js';
// src/controllers/project.controller.js


// Helper to check if user is project admin
const isProjectAdmin = (project, userId) => {
    return project.members.some(
        (m) => m.user.toString() === userId.toString() && (m.role === 'admin' || m.role === 'project_manager')
    );
};

// Helper to check if user is project owner
const isProjectOwner = (project, userId) => {
    return project.owner.toString() === userId.toString();
};

// Create a new project
const createProject = asynchandler(async (req, res, next) => {
    try {
        let { name, description, key, workspaceId } = req.body;
        const ownerId = req.user._id;

        if (!name) {
            return res.status(400).json({ message: "Project name is required" });
        }

        // Find or auto-create a workspace for the user if workspaceId is not provided
        let workspace;
        if (workspaceId) {
            workspace = await Workspace.findById(workspaceId);
        }
        if (!workspace) {
            workspace = await Workspace.findOne({ owner: ownerId });
        }
        if (!workspace) {
            workspace = await Workspace.create({
                name: `${req.user.username || "My"}'s Workspace`,
                slug: `workspace-${ownerId}-${Date.now()}`,
                owner: ownerId,
                members: [{ user: ownerId, role: "owner" }]
            });
        }

        // Auto-generate project key if not provided (e.g. "Alpha Project" => "ALPHA")
        if (!key) {
            const cleanName = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
            let baseKey = cleanName.slice(0, 6) || "PROJ";
            key = baseKey;
            const count = await Project.countDocuments({ workspace: workspace._id, key: new RegExp(`^${baseKey}`) });
            if (count > 0) {
                key = `${baseKey}${count + 1}`;
            }
        }

        const project = new Project({
            name,
            description: description || "",
            owner: ownerId,
            workspace: workspace._id,
            key,
            members: [{ user: ownerId, role: 'project_manager' }],
        });

        await project.save();
        res.status(201).json(project);
    } catch (err) {
        next(err);
    }
});

// Get all projects for the logged-in user
const getUserProjects = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const projects = await Project.find({ 'members.user': userId });
        res.json(projects);
    } catch (err) {
        next(err);
    }
};

// Get a project by ID (only if user is a member)
const getProjectById = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const userId = req.user._id;
        const project = await Project.findById(projectId)
            .populate('members.user', 'fullName username email avatar');

        if (!project) return res.status(404).json({ message: 'Project not found' });

        const isMember = project.members.some(
            (m) => m.user.toString() === userId.toString()
        );
        if (!isMember)
            return res.status(403).json({ message: 'Not authorized for this project' });

        res.json(project);
    } catch (err) {
        next(err);
    }
};

// Update project (only owner, project manager, or system admin)
const updateProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const userId = req.user._id;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const canUpdate = isProjectOwner(project, userId) || 
                          isProjectAdmin(project, userId) || 
                          req.user.systemRole === 'super_admin' || 
                          req.user.role === 'admin';

        if (!canUpdate) {
            return res.status(403).json({ message: 'Not authorized to update project' });
        }

        // Whitelist allowed fields to prevent arbitrary property pollution
        const { name, description, category, methodology, status, visibility } = req.body;
        if (name !== undefined) project.name = name;
        if (description !== undefined) project.description = description;
        if (category !== undefined) project.category = category;
        if (methodology !== undefined) project.methodology = methodology;
        if (status !== undefined) project.status = status;
        if (visibility !== undefined) project.visibility = visibility;

        await project.save();
        res.json(project);
    } catch (err) {
        next(err);
    }
};

// Delete project (only owner, project manager, or system admin)
const deleteProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const userId = req.user._id;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const canDelete = isProjectOwner(project, userId) || 
                          isProjectAdmin(project, userId) || 
                          req.user.systemRole === 'super_admin' || 
                          req.user.role === 'admin';

        if (!canDelete) {
            return res.status(403).json({ message: 'Not authorized to delete this project' });
        }

        await project.deleteOne();
        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (err) {
        next(err);
    }
};


//Get project members 
const getProjectMembers = asynchandler(async(req,res)=>{
    //1. extract project id from params 
    const {projectId} = req.params;
    //2. get user id from request
    const userId = req.user._id;
    //3. find project in database with populated members
    const project = await Project.findById(projectId)
        .populate("members.user", "fullName username email avatar systemRole jobTitle department");

    //4. validate project exists 
    if (!project) return res.status(404).json({ message: 'Project not found' });


    //5. validate user is member of project
    const isMember = project.members.some(
        (m) => m.user?._id?.toString() === userId.toString()
    );
    if (!isMember)
        return res.status(403).json({ message: 'Not authorized for this project' });


    //6. Return populated members
    res.json({ members: project.members, projectName: project.name, projectKey: project.key });
})
// Add member to project (only project admin)
const addMemberToProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { email, role = 'developer' } = req.body;
        const userId = req.user._id;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        if (!isProjectAdmin(project, userId))
            return res.status(403).json({ message: 'Not authorized to add members' });

        const userToAdd = await User.findOne({ email });
        if (!userToAdd)
            return res.status(404).json({ message: 'User to add not found' });

        const alreadyMember = project.members.some(
            (m) => m.user.toString() === userToAdd._id.toString()
        );
        if (alreadyMember)
            return res.status(400).json({ message: 'User already a member' });

        const alreadyInvited = project.invitations?.some(
            (i) => i.user.toString() === userToAdd._id.toString()
        );
        if (alreadyInvited)
            return res.status(400).json({ message: 'User already has a pending invitation' });

        if (!project.invitations) project.invitations = [];
        
        project.invitations.push({ 
            user: userToAdd._id, 
            role, 
            invitedBy: userId 
        });
        await project.save();

        res.json(project);
    } catch (err) {
        next(err);
    }
};

// Update member role (only project admin)
const updateMemberRole = async (req, res, next) => {
    try {
        const { projectId, userId } = req.params;
        const { newRole } = req.body;
        const currentUserId = req.user._id;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        if (!isProjectAdmin(project, currentUserId))
            return res.status(403).json({ message: 'Not authorized to update roles' });

        const member = project.members.find(
            (m) => m.user.toString() === userId.toString()
        );
        if (!member)
            return res.status(404).json({ message: 'Member not found in project' });

        member.role = newRole;
        await project.save();

        res.json(project);
    } catch (err) {
        next(err);
    }
};

// Remove member from project (only project admin)
const removeMemberFromProject = async (req, res, next) => {
    try {
        const { projectId, userId } = req.params;
        const currentUserId = req.user._id;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        if (!isProjectAdmin(project, currentUserId))
            return res.status(403).json({ message: 'Not authorized to remove members' });

        // Prevent removing the owner
        if (project.owner.toString() === userId.toString())
            return res.status(400).json({ message: 'Cannot remove project owner' });

        project.members = project.members.filter(
            (m) => m.user.toString() !== userId.toString()
        );
        await project.save();

        res.json(project);
    } catch (err) {
        next(err);
    }
};
const getAllProjects = asynchandler(async(req,res)=>{

    //1. extracting query params with default values taaki user na bhi de to bhi kaam ho jaaye
    const {
        page=1,
        limit=10,
        sortBy="createdAt",
        sortType="desc",
        status,
        priority
    } = req.query;


    // 2. Scope filter to requesting user's project membership
    const filter = { "members.user": req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    

    //3. Sorting Determine sort direction ascending or descending
    const sort={[sortBy]:sortType === 'desc'?-1:1};    
    
    //4. Pagination calculate skip
    const skip=(page-1)*limit;
    

    //5 Executing query using chain methods 
    const projects = await Project
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
    

    //Get total count of projects
    const totalProjects = await Project.countDocuments(filter);
    res.status(200).json({
        success: true,
        totalProjects,
        page,
        limit,
        projects,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProjects / limit),
        hasPreviousPage: page > 1,
        hasNextPage: page < Math.ceil(totalProjects / limit)
    })
})

// ─── Invitation Management ─────────────────

const getPendingInvitations = asynchandler(async (req, res) => {
    const userId = req.user._id;
    const projects = await Project.find({ "invitations.user": userId })
        .select("name key description invitations owner")
        .populate("invitations.invitedBy", "fullName username email")
        .populate("owner", "fullName username email");

    // Filter down to only this user's invitations
    const pendingInvites = projects.map(p => {
        const invite = p.invitations.find(i => i.user.toString() === userId.toString());
        return {
            projectId: p._id,
            projectName: p.name,
            projectKey: p.key,
            projectDescription: p.description,
            owner: p.owner,
            role: invite.role,
            invitedBy: invite.invitedBy,
            invitedAt: invite.invitedAt
        };
    });

    res.json({ success: true, invitations: pendingInvites });
});

const acceptInvitation = asynchandler(async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const inviteIndex = project.invitations?.findIndex(i => i.user.toString() === userId.toString());
    if (inviteIndex === -1 || inviteIndex === undefined) {
        return res.status(404).json({ message: 'Invitation not found' });
    }

    const invite = project.invitations[inviteIndex];
    
    // Add to members
    project.members.push({
        user: invite.user,
        role: invite.role
    });

    // Remove from invitations
    project.invitations.splice(inviteIndex, 1);
    
    await project.save();

    res.json({ success: true, message: 'Invitation accepted', project });
});

const rejectInvitation = asynchandler(async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const inviteIndex = project.invitations?.findIndex(i => i.user.toString() === userId.toString());
    if (inviteIndex === -1 || inviteIndex === undefined) {
        return res.status(404).json({ message: 'Invitation not found' });
    }

    // Remove from invitations
    project.invitations.splice(inviteIndex, 1);
    await project.save();

    res.json({ success: true, message: 'Invitation rejected' });
});

export {
    createProject,
    getUserProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addMemberToProject,
    updateMemberRole,
    removeMemberFromProject,
    getAllProjects,
    getProjectMembers,
    getPendingInvitations,
    acceptInvitation,
    rejectInvitation
};