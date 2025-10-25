
import fs from "fs"
import imagekit from "../config/imagekit.js";
import Post from "../models/post.js";
import User from "../models/userModel.js";


// create Post
export const addPost = async (req, res) => {
    try {
        const userId = req.user._id
        const { content, postType } = req.body;
        const images = req.files

        let imageUrls = []
        if (images?.length) {
            imageUrls = await Promise.all(
                images.map(async (image) => {
                    const fileBuffer = fs.readFileSync(image.path)
                    const response = await imagekit.upload({
                        file: fileBuffer,
                        fileName: image.originalname,
                        folder: "social/posts"
                    });
                    return response.url

                })
            )
        }
        await Post.create({
            user: userId,
            content,
            imageUrls,
            postType,

        })
        res.json({ success: true, message: "Post created successfully" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }

}

// get post
export const getFeedPosts = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId)

        // user connections and followings
        const userIds = [userId, ...user.connections, ...user.following]
        const posts = await Post.find({ user: { $in: userIds } }).populate("user").sort({ createdAt: -1 })

        res.json({ success: true, posts })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}

// Like post - FIXED VERSION
export const likePost = async (req, res) => {
    try {
        const userId = req.user._id
        const { postId } = req.body

        if (!postId) {
            return res.json({ success: false, message: "Post ID is required" })
        }

        const post = await Post.findById(postId)
        if (!post) {
            return res.json({ success: false, message: "Post not found" })
        }

        if (post.likeCount.includes(userId)) {
            // Unlike the post
            post.likeCount = post.likeCount.filter(user => user.toString() !== userId.toString())
            await post.save()
            return res.json({ success: true, message: "Post unliked", post })
        } else {
            // Like the post
            post.likeCount.push(userId)
            await post.save()
            return res.json({ success: true, message: "Post liked", post })
        }

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message })
    }
}

// Get posts by user ID
export const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const posts = await Post.find({ user: userId })
            .populate("user")
            .sort({ createdAt: -1 });

        res.json({ success: true, posts });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};