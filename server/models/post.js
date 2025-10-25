import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    user: { type: String, ref: "User", required: true },
    content: { type: String, },
    imageUrls: [{ type: String }],
    postType: { type: String, enum: ["text", "image", "text_with_image"], required: true },
    likeCount: [{ type: String, ref: "User" }]

}, { timestamps: true })

const Post = mongoose.model("Post", postSchema)
export default Post