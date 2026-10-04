const express = require("express");
const Donor = require("../models/Donor");

const router = express.Router();

// Register a new donor
router.post("/", async (req, res) => {
    try {
        const donor = new Donor(req.body);

        const savedDonor = await donor.save();

        res.status(201).json({
            success: true,
            message: "Donor registered successfully",
            donor: savedDonor
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to register donor",
            error: error.message
        });
    }
});

// Get all donors
router.get("/", async (req, res) => {
    try {
        const donors = await Donor.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            donors: donors
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch donors",
            error: error.message
        });
    }
});

module.exports = router;