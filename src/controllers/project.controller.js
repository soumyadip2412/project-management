import Project from '../models/project.models.js';
import { User } from '../models/user.models.js';
import { asynchandler } from '../utils/asynchandler.js';
// src/controllers/project.controller.js


// Helper to check if user is project admin
const isProjectAdmin = (project, userId) => {
    return project.members.some(
        (m) => m.user.toString() === userId.toString() && m.role === 'admin'
    );
};

// Helper to check if user is project owner
const isProjectOwner = (project, userId) => {
    return project.owner.toString() === userId.toString();
};

// Create a new project
const createProject = asynchandler(async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const ownerId = req.user._id;

        const project = new Project({
            name,
            description,
            owner: ownerId,
            members: [{ user: ownerId, role: 'admin' }],
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
        const project = await Project.findById(projectId);

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

// Update project (only owner or system admin)
const updateProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const userId = req.user._id;
        const updates = req.body;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Assuming req.user.role === 'admin' is system-level admin
        if (!isProjectOwner(project, userId) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update project' });
        }

        Object.assign(project, updates);
        await project.save();
        res.json(project);
    } catch (err) {
        next(err);
    }
};

// Delete project (only owner or system admin)
const deleteProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const userId = req.user._id;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        if (!isProjectOwner(project, userId) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete project' });
        }

        await project.deleteOne();
        res.json({ message: 'Project deleted' });
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
    //3. find project in database
    const project = await Project.findById(projectId);

    //4. validate project exists 
    if (!project) return res.status(404).json({ message: 'Project not found' });


    //5. validate user is member of project
    const isMember = project.members.some(
        (m) => m.user.toString() === userId.toString()
    );
    if (!isMember)
        return res.status(403).json({ message: 'Not authorized for this project' });


    //6.populate members with their details
    
    res.json(project);
})
// Add member to project (only project admin)
const addMemberToProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { email, role = 'member' } = req.body;
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

        project.members.push({ user: userToAdd._id, role });
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


    //2.Filtering build the filter object based on query params agar koi param nahi hai to empty filter object
    const filter={};
    if(status) filter.status=status;
    if(priority) filter.priority=priority;
    

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
    getProjectMembers
};