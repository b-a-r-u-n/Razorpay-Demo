import dotenv from "dotenv";

dotenv.config({
    path: ".env"
})

import connectDB from "./db/index.js";
import app from "./app.js"

connectDB()
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on PORT ${process.env.PORT}`);
    }) 
})
.catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
})