import mongoose from "mongoose"

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => { console.log("mongodb server is connected") })
        await mongoose.connect(process.env.MONGODB_URL + "social")

    } catch (error) {
        console.log("mongoose connection failed:", error.message);

    }
}

export default connectDB