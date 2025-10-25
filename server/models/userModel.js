import mongoose from "mongoose"

const userSchema = new mongoose.Schema({

    fullname: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    profileimagelink: { type: String, default: "" },
    profilefileid: { type: String, default: "" },
    coverimglink: { type: String, default: "" },
    coverfileid: { type: String, default: "" },
    bio: { type: String, default: "hey i am using safiul alam sarkers project" },
    location: { type: String, default: "" },
    followers: [{ type: String, ref: "User" }],
    following: [{ type: String, ref: "User" }],
    connections: [{ type: String, ref: "User" }],

}, { timestamps: true, minimize: false })

const User = mongoose.model("User", userSchema)
export default User