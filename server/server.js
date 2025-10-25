import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/connectDB.js";
import userRoutes from "./routers/userRoutes.js";
import postRoutes from "./routers/postRoutes.js";
import storyRoutes from "./routers/storyRoutes.js";
import messageRoutes from "./routers/MessageRoutes.js";
import { initializeSocket } from "./socket/socket.js";

const app = express();

app.use(cors());
app.use(express.json());

// connect db
connectDB();

app.get("", (req, res) => {
    res.send("hello sofail");
});

app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/story", storyRoutes);
app.use("/api/message", messageRoutes);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`server is running in port ${PORT}`);
});

// Initialize Socket.io
initializeSocket(server);