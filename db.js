const mongoose = require("mongoose");

async function connrctDB() {
    try{
        await mongoose.connect("mongodb://127.0.0.1:27017/chat_app");
        console.log("MongoDB connected successfully");
    }catch (error){
        console.error("MongoDB connection faile:", error.message);
        process.exit(1);
    }
}
module.exports = connrctDB;