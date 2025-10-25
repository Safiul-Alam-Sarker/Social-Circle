import express from "express"
import { protect } from "../middleware/auth.js"
import upload from "../middleware/multer.js"
import { addPost, getFeedPosts, likePost, getUserPosts } from "../controllers/postController.js"



const postRoutes = express.Router()

postRoutes.post("/add", upload.array("images", 4), protect, addPost)
postRoutes.get("/feed", protect, getFeedPosts)
postRoutes.post("/like", protect, likePost)
postRoutes.get("/user/:userId", protect, getUserPosts);





export default postRoutes