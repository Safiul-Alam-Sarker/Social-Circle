import fs from "fs"
import imagekit from "../config/imagekit.js"
import Story from "../models/story.js"
import User from "../models/userModel.js"


export const addUserStory = async (req, res) => {
    try {
        const userId = req.user._id
        console.log(req.user);

        const { content, mediaType, backgroundColor } = req.body
        const media = req.file
        let mediaUrl = ""

        if (mediaType === "image" || mediaType === "video") {
            const fileBuffer = fs.readFileSync(media.path)
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: media.originalname,

            })
            mediaUrl = response.url
        }
        const story = await Story.create({
            user: userId,
            content,
            mediaUrl,
            mediaType,
            backgroundColor
        })
        res.json({ success: true, })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }

}

// get user story

export const getStories = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId)

        const userIds = [userId, ...user.connections, ...user.following]
        const stories = await Story.find({
            user: { $in: userIds }
        }).populate("user").sort({ createdAt: -1 })


        res.json({ success: true, stories })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }

}
