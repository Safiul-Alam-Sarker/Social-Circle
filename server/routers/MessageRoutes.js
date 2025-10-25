import express from "express"
import { protect } from "../middleware/auth.js"
import upload from "../middleware/multer.js"
import { getChatMessages, sendMessage, sseController, getUserRecentMessages } from "../controllers/messageController.js"

const messageRoutes = express.Router()

messageRoutes.get("/sse/:userId", sseController) // Changed to avoid conflict
messageRoutes.post("/send", upload.single("image"), protect, sendMessage)
messageRoutes.post("/chat", protect, getChatMessages) // Changed from "/get" to "/chat"
messageRoutes.get("/recent", protect, getUserRecentMessages) // Add this for recent messages

export default messageRoutes