import fs from "fs";
import imagekit from "../config/imagekit.js";
import Message from "../models/messageModal.js";
import { getIO } from "../socket/socket.js";

// create an empty object to store ss event connections
const connections = {};

// controller function for the sse endpoint
export const sseController = (req, res) => {
    const { userId } = req.params;
    console.log("new client connected: ", userId);

    // set sse headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    // add the clients response object to the connections object
    connections[userId] = res;

    // sent an initial event to the client
    res.write("log: Connected to sse stream\n\n");

    // Handle client disconnection
    req.on("close", () => {
        // Remove the clients response object from the connections array
        delete connections[userId];
        console.log("client disconnected");
    });
};

// send Message
// send Message
export const sendMessage = async (req, res) => {
    try {
        const userId = req.user._id;
        const { to_user_id, text } = req.body;
        const image = req.file;

        let mediaUrl = "";
        let messageType = image ? "image" : "text";

        if (messageType === "image") {
            const bufferImg = fs.readFileSync(image.path);
            const response = await imagekit.upload({
                file: bufferImg,
                fileName: image.originalname,
            });
            mediaUrl = response.url;
        }

        const message = await Message.create({
            from_user_id: userId,
            to_user_id,
            text,
            messageType,
            mediaUrl
        });

        // Populate the message with user data
        const messageWithUserData = await Message.findById(message._id)
            .populate("from_user_id", "fullname username profileimagelink")
            .populate("to_user_id", "fullname username profileimagelink");

        // Send real-time update via Socket.io - FIXED
        const io = getIO();

        // Emit to recipient
        io.to(to_user_id.toString()).emit('receive_message', messageWithUserData);

        // Emit to sender
        io.to(userId.toString()).emit('receive_message', messageWithUserData);

        // Also emit for recent messages update
        io.to(to_user_id.toString()).emit('recent_messages_updated');
        io.to(userId.toString()).emit('recent_messages_updated');

        res.json({ success: true, message: messageWithUserData });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
// get chat messages
export const getChatMessages = async (req, res) => {
    try {
        const userId = req.user._id;
        const { to_user_id } = req.body;

        const messages = await Message.find({
            $or: [
                { from_user_id: userId, to_user_id },
                { from_user_id: to_user_id, to_user_id: userId }
            ]
        })
            .populate("from_user_id", "fullname username profileimagelink")
            .populate("to_user_id", "fullname username profileimagelink")
            .sort({ createdAt: -1 });

        // mark message as seen
        await Message.updateMany({
            from_user_id: to_user_id,
            to_user_id: userId,
            seen: false
        }, { seen: true });

        // Emit seen status via Socket.io
        const io = getIO();
        io.to(to_user_id.toString()).emit('messages_seen', {
            from_user_id: userId,
            to_user_id: to_user_id
        });

        res.json({ success: true, messages });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getUserRecentMessages = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get unique conversations
        const messages = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { from_user_id: userId },
                        { to_user_id: userId }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$from_user_id", userId] },
                            "$to_user_id",
                            "$from_user_id"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$to_user_id", userId] },
                                        { $eq: ["$seen", false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $lookup: {
                    from: "users",
                    localField: "lastMessage.from_user_id",
                    foreignField: "_id",
                    as: "lastMessage.from_user"
                }
            },
            {
                $unwind: "$lastMessage.from_user"
            }
        ]).exec();

        res.json({ success: true, conversations: messages });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};