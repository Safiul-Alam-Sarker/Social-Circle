import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    user: { type: String, ref: "User", required: true },
    content: { type: String, },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ["text", "image", "video"] },
    viewCount: [{ type: String, ref: "User" }],
    backgroundColor: [{ type: String }]

}, { timestamps: true, minimize: false })

const Story = mongoose.model("story", storySchema)
export default Story