import jwt from 'jsonwebtoken'
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
    try {

        // getToken from the header
        const token = req.headers.authorization?.split(" ")[1]

        if (!token) {
            return res.status(401).json({ success: false, message: "no token provided" })

        }

        // 2.verify token
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        } catch (err) {
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }

        // 3. find the user in DB
        const user = await User.findById(decodedToken.id).select("-password")
        if (!user) return res.json({ success: false, message: "user not found" })

        // 4.attach user to request and continue
        req.user = user
        next()

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: error.message })
    }

}