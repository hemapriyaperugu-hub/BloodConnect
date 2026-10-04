
const express = require("express");
const Donor = require("../models/donor");

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

    }
    catch (error) {

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

        const donors =
            await Donor.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            donors: donors
        });

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch donors",
            error: error.message
        });

    }

});


// Update donor availability
router.put("/:id", async (req, res) => {

    try {

        const donorId = req.params.id;

        const { availability } = req.body;


        // Check valid availability
        if (
            availability !== "Available" &&
            availability !== "Unavailable"
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid availability value"
            });

        }


        const updatedDonor =
            await Donor.findByIdAndUpdate(
                donorId,
                {
                    availability: availability
                },
                {
                    new: true
                }
            );


        if (!updatedDonor) {

            return res.status(404).json({
                success: false,
                message: "Donor not found"
            });

        }


        res.json({

            success: true,

            message: "Availability updated successfully",

            donor: updatedDonor

        });

    }
    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Failed to update availability",

            error: error.message

        });

    }

});


module.exports = router;
