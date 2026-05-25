import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import { globalLimiter } from "./middlewares/rateLimiter.middleware.js";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import logger from "./utils/logger.js";

//baic configuration and middlewares 
const app = express();

// Apply rate limiting to all requests
app.use(globalLimiter);

// Setup morgan to stream logs to winston
app.use(morgan("combined", { stream: { write: message => logger.info(message.trim()) } }));

app.use(express.json({limit:"32kb"}))//limit jeta seta optional 
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))//iamges er jonne lage eta 
app.use(cookieParser())
//cors configuration 
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",")||"http://localhost:5173",//5173 jo hai woh vite k liye hai isiliye likha hai and origin jo rhta hai wohi tera front end ka jo url hoga request send karne k liye and woh depend karega device to device
    credentials:true,//credentials are used for auth headers and cookies
    methods:["GET","POST","PUT","DELETE","PATCH","OPTIONS"],
    allowedHeaders:["Authorization","Content-Type"]//yeh har project mein lagta hai
    
}))

// Load Swagger documentation
const swaggerDocument = YAML.load("./docs/swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//import the routes it is after the configuration 
import healthCheckRouter from "./routes/healthcheck.route.js"
import authRouter from "./routes/auth.routes.js"
import projectRouter from "./routes/project.routes.js";
import taskRouter from "./routes/task.routes.js";
import noteRouter from "./routes/note.routes.js";

app.use("/api/v1/healthcheck",healthCheckRouter)
app.use("/api/v1/auth",authRouter)
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/notes", noteRouter);
app.get("/",(req,res) =>{
    res.send("welcome to postmannnn")
})


app.get("/instagram", (req,res)=>{
    res.send("Hii this is the part of the instagram page ")
})
export default app;