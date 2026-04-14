const express = require("express");
const multer = require("multer");
const Court = require("../models/Court");
const { uploadFile } = require("../services/storage.services");
const {
  authMiddleware,
  staffMiddleware,
} = require("../middleware/authMiddleware");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const parseAmenities = (amenities) => {
  if (Array.isArray(amenities)) {
    return amenities;
  }

  if (typeof amenities === "string") {
    return amenities
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
  }

  return [];
};

// Get all courts
router.get("/", async (req, res) => {
  try {
    const courts = await Court.find({ isActive: true }).sort({ name: 1 });
    res.json(courts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get court by ID
router.get("/:id", async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) {
      return res.status(404).json({ message: "Court not found" });
    }
    res.json(court);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create court (staff only)
router.post("/", staffMiddleware, upload.array("images", 10), async (req, res) => {
  try {
    const {
      name,
      location,
      address,
      courtNumber,
      surface,
      capacity,
      amenities,
      hourlyRate,
      description,
    } = req.body;

    // Validate required fields
    if (!name || !location || !courtNumber || !surface || !hourlyRate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parsedAmenities = parseAmenities(amenities);

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(
        req.files.map((file, index) =>
          uploadFile(
            file.buffer.toString("base64"),
            `court-${name || courtNumber || "image"}-${index + 1}-${file.originalname}`,
            "/smashslot/court",
          ),
        ),
      );
    }

    const court = new Court({
      name,
      location,
      address,
      courtNumber,
      surface,
      capacity: Number(capacity) || 4,
      amenities: parsedAmenities,
      images: imageUrls,
      hourlyRate,
      description,
      isActive: true,
    });

    await court.save();
    res.status(201).json(court);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update court (staff only)
router.put("/:id", staffMiddleware, upload.array("newImages", 10), async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);

    if (!court) {
      return res.status(404).json({ message: "Court not found" });
    }

    const {
      name,
      location,
      address,
      courtNumber,
      surface,
      capacity,
      amenities,
      hourlyRate,
      description,
      removedImages,
    } = req.body;

    const removedImageList = (() => {
      if (!removedImages) return [];
      if (Array.isArray(removedImages)) return removedImages;

      try {
        const parsed = JSON.parse(removedImages);
        return Array.isArray(parsed) ? parsed : [];
      } catch (_error) {
        return removedImages
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item);
      }
    })();

    let updatedImages = (court.images || []).filter(
      (imageUrl) => !removedImageList.includes(imageUrl),
    );

    if (req.files && req.files.length > 0) {
      const uploadedImageUrls = await Promise.all(
        req.files.map((file, index) =>
          uploadFile(
            file.buffer.toString("base64"),
            `court-${name || court.name || courtNumber || court.courtNumber || "image"}-${index + 1}-${file.originalname}`,
            "/smashslot/court",
          ),
        ),
      );

      updatedImages = [...updatedImages, ...uploadedImageUrls];
    }

    const updates = {
      images: updatedImages,
    };

    if (name !== undefined) updates.name = name;
    if (location !== undefined) updates.location = location;
    if (address !== undefined) updates.address = address;
    if (courtNumber !== undefined) updates.courtNumber = courtNumber;
    if (surface !== undefined) updates.surface = surface;
    if (capacity !== undefined) updates.capacity = Number(capacity);
    if (amenities !== undefined) updates.amenities = parseAmenities(amenities);
    if (hourlyRate !== undefined) updates.hourlyRate = Number(hourlyRate);
    if (description !== undefined) updates.description = description;

    const updatedCourt = await Court.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(updatedCourt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Deactivate court (staff only)
router.delete("/:id", staffMiddleware, async (req, res) => {
  try {
    const court = await Court.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!court) {
      return res.status(404).json({ message: "Court not found" });
    }

    res.json({ message: "Court deactivated successfully", court });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
