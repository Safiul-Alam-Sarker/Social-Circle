import express from "express"
import { protect } from "../middleware/auth.js"
import upload from "../middleware/multer.js"
import { addUserStory, getStories } from "../controllers/storyController.js"


const storyRoutes = express.Router()

storyRoutes.post("/create", protect, upload.single("media"), addUserStory)
storyRoutes.get("/get", protect, getStories)





export default storyRoutes