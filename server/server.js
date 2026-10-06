const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const donorRoutes = require("./routes/donorRoutes");


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/donors", donorRoutes);


mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });

app.get("/", (req, res) => {
    res.send("BloodConnect Backend is running!");
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`BloodConnect server running on http://localhost:${PORT}`);
});