import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./db/databaseconnection.js";
import { User } from "./models/user.models.js";
import Project from "./models/project.models.js";

// Load environment variables since this is a standalone script
dotenv.config();

const seedDatabase = async () => {
    try {
        await connectDB();

        console.log("Clearing existing data...");
        await User.deleteMany({});
        await Project.deleteMany({});

        console.log("Creating Users...");
        const users = [];
        for (let i = 1; i <= 5; i++) {
            users.push({
                username: `user${i}`,
                email: `user${i}@example.com`,
                fullName: `Test User ${i}`,
                password: "password123", 
                isEmailVerified: true
            });
        }
        // Using User.create instead of insertMany so the Mongoose pre('save') hook runs and hashes the passwords!
        const createdUsers = await User.create(users);
        console.log(`✅ ${createdUsers.length} Users created.`);

        console.log("Creating Projects...");
        const projects = [];
        for (let i = 1; i <= 55; i++) {
            // Pick a random owner from our created users
            const randomOwner = createdUsers[Math.floor(Math.random() * createdUsers.length)];
            
            projects.push({
                name: `Project Alpha ${i}`,
                description: `This is a detailed description for Project ${i}. It contains multiple sentences to simulate real-world data and help us test our frontend layouts and backend pagination perfectly.`,
                owner: randomOwner._id,
                members: [
                    { user: randomOwner._id, role: "admin" }
                ]
            });
        }
        
        const createdProjects = await Project.insertMany(projects);
        console.log(`✅ ${createdProjects.length} Projects created.`);

        console.log("🎉 Database seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedDatabase();
