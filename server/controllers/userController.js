import imagekit from "../config/imagekit.js";
import Connection from "../models/connection.js";
import Post from "../models/post.js";
import User from "../models/userModel.js";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const generateToken = (userId) => {
    const payload = { id: userId }
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2d" })
}


// register User
export const registerUser = async (req, res) => {
    try {
        const { fullname, username, password, email } = req.body
        if (!fullname || !username || !password || !email) {
            return res.json({ success: false, message: "fill all the fields" })
        }

        const isExistEmail = await User.findOne({ email })
        if (isExistEmail) {
            return res.json({ success: false, message: "user already exist" })
        }

        const isUsernameExist = await User.findOne({ username })
        if (isUsernameExist) {
            return res.json({ success: false, message: "Username already exist, try different username" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            fullname, username, email, password: hashedPassword
        })
        const token = generateToken(user._id.toString())

        return res.json({ success: true, user, token })

    } catch (error) {
        console.log(error);
        return res.json(error.message)

    }

}


// login User
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!password || !email) {
            return res.json({ success: false, message: "fill all the fields" })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: "Invalid Credential" })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "Invalid Credential" })
        }
        const token = generateToken(user._id.toString())

        return res.json({ success: true, token })

    } catch (error) {
        console.log(error);
        return res.json(error.message)

    }

}

// get user data using user id
export const getUserData = async (req, res) => {
    try {

        res.json({ success: true, user: req.user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
// update user data
export const updateUserData = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        let { username, bio, location, fullname } = req.body;

        const DEFAULT_PROFILE_URL = "../upload/default profile img.jpg";
        const DEFAULT_COVER_URL = "../upload/default cover img.jpg";

        const user = await User.findById(userId);

        // Username handling
        if (!username) username = user.username;
        const userExists = await User.findOne({ username });
        if (userExists && userExists._id.toString() !== userId.toString()) {
            username = user.username;
        }

        const updatedData = { username, bio, location, fullname };

        const profile = req.files?.profile?.[0];
        const cover = req.files?.cover?.[0];

        // ✅ Handle Profile Image
        if (profile) {
            // ❌ Delete previous image if not default and has fileId
            if (user.profilefileid) {
                await imagekit.deleteFile(user.profilefileid).catch(err => {
                    console.log("Error deleting old profile image:", err.message);
                });
            }

            // ✅ Upload new image
            const buffer = fs.readFileSync(profile.path);
            const response = await imagekit.upload({
                file: buffer,
                fileName: profile.originalname,
            });

            updatedData.profileimagelink = response.url;
            updatedData.profilefileid = response.fileId;
            fs.unlinkSync(profile.path); // Remove temp file
        } else if (!user.profileimagelink) {
            // ✅ If no image exists, assign default
            updatedData.profileimagelink = DEFAULT_PROFILE_URL;
            updatedData.profilefileid = "";
        }

        // ✅ Handle Cover Image
        if (cover) {
            // ❌ Delete previous image if not default and has fileId
            if (user.coverfileid) {
                await imagekit.deleteFile(user.coverfileid).catch(err => {
                    console.log("Error deleting old cover image:", err.message);
                });
            }

            // ✅ Upload new image
            const buffer = fs.readFileSync(cover.path);
            const response = await imagekit.upload({
                file: buffer,
                fileName: cover.originalname,
                folder: "social/profile"
            });

            updatedData.coverimglink = response.url;
            updatedData.coverfileid = response.fileId;
            fs.unlinkSync(cover.path);
        } else if (!user.coverimglink) {
            // ✅ If no image exists, assign default
            updatedData.coverimglink = DEFAULT_COVER_URL;
            updatedData.coverfileid = "";
        }

        // ✅ Update User
        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

        res.json({ success: true, user: updatedUser, message: "Profile updated successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Find user using username, email, location, or name
export const discoverUsers = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        const { input } = req.body;

        const allUsers = await User.find({
            $or: [
                { username: new RegExp(input, "i") },
                { email: new RegExp(input, "i") },
                { fullname: new RegExp(input, "i") },
                { location: new RegExp(input, "i") },
            ],
        });

        const filteredUsers = allUsers.filter(
            (user) => user._id.toString() !== userId.toString()
        );

        res.json({ success: true, users: filteredUsers });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Follow user
export const followUser = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        const { id } = req.body;

        const user = await User.findById(userId);

        if (user.following.includes(id)) {
            return res.json({
                success: false,
                message: "You are already following this user",
            });
        }

        user.following.push(id);
        await user.save();

        const toUser = await User.findById(id);
        toUser.followers.push(userId);
        await toUser.save();

        res.json({ success: true, message: "Now you are following this user" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Unfollow user
export const unfollowUser = async (req, res) => {
    try {
        const { _id: userId } = req.user;
        const { id } = req.body;

        const user = await User.findById(userId);
        user.following = user.following.filter(
            (followId) => followId.toString() !== id.toString()
        );
        await user.save();

        const toUser = await User.findById(id);
        toUser.followers = toUser.followers.filter(
            (followerId) => followerId.toString() !== userId.toString()
        );
        await toUser.save();

        res.json({
            success: true,
            message: "You are no longer following this user",
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// send connection request

export const sendConnectionRequest = async (req, res) => {
    try {
        const { _id: userId } = req.user
        const { id } = req.body

        //check if user has sent more than 20 connection request in last 24 hour
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const connectionRequests = await Connection.find({ from_user_id: userId, created_at: { $gt: last24Hours } })
        if (connectionRequests.length >= 20) {
            return res.json({ success: false, message: "you have sent more than 20 connection in last 24 hours" })
        }

        // check if users are already connected
        const connection = await Connection.findOne({
            $or: [
                { from_user_id: userId, to_user_id: id },
                { from_user_id: id, to_user_id: userId },
            ]
        })

        if (!connection) {
            await Connection.create({
                from_user_id: userId,
                to_user_id: id
            })
            return res.json({ success: true, messsage: "connection req sent successfully" })
        } else if (connection && connection.status === "accepted") {
            return res.json({ success: false, message: "you are already connected with  this user" })

        }

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message })

    }

}

// get user connection

export const getUserConnections = async (req, res) => {
    try {
        const userId = req.user._id;

        // Populate and exclude password for connections, followers, and following
        const user = await User.findById(userId)
            .populate({
                path: "connections",
                select: "-password"
            })
            .populate({
                path: "followers",
                select: "-password"
            })
            .populate({
                path: "following",
                select: "-password"
            })
            .select("-password"); // also exclude for main user

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const connections = user.connections;
        const followers = user.followers;
        const following = user.following;

        const pendingConnection = (await Connection.find({ to_user_id: userId, status: "pending" })
            .populate({ path: "from_user_id", select: "-password" })) // exclude password here too
            .map(connection => connection.from_user_id);

        res.json({ success: true, connections, followers, following, pendingConnection });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};


// Accept connection request

export const acceptConnectionRequest = async (req, res) => {
    try {
        const { _id: userId } = req.user
        const { id } = req.body;

        const connection = await Connection.findOne({ from_user_id: id, to_user_id: userId })
        if (!connection) {
            return res.json({ success: false, message: "connection not found" })

        }
        const user = await User.findById(userId)
        user.connections.push(id)
        await user.save()

        const toUser = await User.findById(id)
        toUser.connections.push(userId)
        await toUser.save()

        connection.status = "accepted"
        await connection.save()

        res.json({ success: true, messsage: "connection accepted" })
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message })
    }

}

// get user profile

export const getUserProfiles = async (req, res) => {

    try {
        const { profileId } = req.body;
        const profile = await User.findById(profileId)

        if (!profile) {
            return res.json({ success: false, message: "profile not found" })
        }
        const posts = await Post.find({ user: profileId }).populate("user")
        res.json({ success: true, profile, posts })
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message })
    }
}