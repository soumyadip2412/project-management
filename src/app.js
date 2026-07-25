import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import logger from "./utils/logger.js";
import { globalLimiter, authLimiter } from "./middlewares/rateLimiter.middleware.js";
import { ApiError } from "./utils/api-errors.js";

const app = express();

// Apply global rate limiting
app.use(globalLimiter);

// Setup morgan log streaming
app.use(morgan("combined", { stream: { write: message => logger.info(message.trim()) } }));

app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"]
}));

// Load Swagger documentation
const swaggerDocument = YAML.load("./docs/swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Route Imports
import healthCheckRouter from "./routes/healthcheck.route.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import taskRouter from "./routes/task.routes.js";
import noteRouter from "./routes/note.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

// Route Registrations
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authLimiter, authRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/notes", noteRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || (error.name === "ValidationError" ? 400 : 500);
        const message = error.message || "Internal Server Error";
        error = new ApiError(statusCode, message, error?.errors || [], error.stack);
    }

    const response = {
        statusCode: error.statusCode,
        message: error.message,
        success: false,
        errors: error.errors || [],
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
    };

    logger.error(`[${req.method}] ${req.url} - ${error.statusCode} - ${error.message}`);
    return res.status(error.statusCode).json(response);
});

export default app;