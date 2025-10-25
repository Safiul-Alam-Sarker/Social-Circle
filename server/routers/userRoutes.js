import express from "express"
import { acceptConnectionRequest, discoverUsers, followUser, getUserConnections, getUserData, getUserProfiles, loginUser, registerUser, sendConnectionRequest, unfollowUser, updateUserData } from "../controllers/userController.js"
import { protect } from "../middleware/auth.js"
import upload from "../middleware/multer.js"
// Remove getUserRecentMessages import from here since it's in messageRoutes

const userRoutes = express.Router()

userRoutes.post("/register", registerUser)
userRoutes.post("/login", loginUser)
userRoutes.get("/data", protect, getUserData)
userRoutes.post("/update", upload.fields([{ name: "profile", maxCount: 1 }, { name: "cover", maxCount: 1 }]), protect, updateUserData)
userRoutes.post("/discover", protect, discoverUsers)
userRoutes.post("/follow", protect, followUser)
userRoutes.post("/unfollow", protect, unfollowUser)
userRoutes.post("/connect", protect, sendConnectionRequest)
userRoutes.post("/accept", protect, acceptConnectionRequest)
userRoutes.get("/connections", protect, getUserConnections)
userRoutes.post("/profiles", getUserProfiles)
// Remove the recent-messages route from here

export default userRoutes