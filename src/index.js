import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/databaseconnection.js";
import logger from "./utils/logger.js";


dotenv.config({
    path: "./.env",
});


const port = process.env.PORT || 3000;

connectDB()
.then(()=>{
    app.listen(port, () => {
    logger.info(`Example app listening on http://localhost:${port}`);
})
})
.catch((err) =>{
    logger.error("Something is wrong with MongoDB: ", err);
    process.exit(1)
})

// app.listen(port, () => {
//   console.log(`Example app listening on http://localhost:${port}`)
// })


// let myusername = process.env.database;

// console.log("value:", myusername)

logger.info("starting of a backend project journey");