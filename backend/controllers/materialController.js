const fs = require("fs");
const path = require("path");
const Material = require("../models/Material");
const Batch = require("../models/Batch");
const Student = require("../models/Student");

// @desc    Upload study material for a batch
// @route   POST /api/materials
// @access  Private/Faculty
exports.uploadMaterial = async (req, res) => {
  try {
    const { title, description, batchId } = req.body;

    if (!title || !batchId || !req.file)
      return res
        .status(400)
        .json({ message: "Please provide title, batchId, and a file" });

    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    if (batch.facultyId.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ message: "Access denied: this batch is not assigned to you" });

    const material = await Material.create({
      title,
      description,
      fileUrl: `/uploads/${req.file.filename}`,
      batchId,
      facultyId: req.user._id,
    });

    res
      .status(201)
      .json({ message: "Material uploaded successfully", material });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get materials for the logged-in student's batches
// @route   GET /api/materials/my-materials
// @access  Private/Student
exports.getMyMaterials = async (req, res) => {
  try {
    const assignments = await Student.find({ userId: req.user._id });
    if (!assignments.length) return res.status(200).json([]);

    const batchIds = assignments.map((a) => a.batchId);
    const materials = await Material.find({ batchId: { $in: batchIds } })
      .populate("facultyId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(materials);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get materials for a specific batch
// @route   GET /api/materials/batch/:batchId
// @access  Private
exports.getBatchMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ batchId: req.params.batchId })
      .populate("facultyId", "email")
      .sort({ createdAt: -1 });

    res.status(200).json(materials);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a material
// @route   DELETE /api/materials/:id
// @access  Private/Faculty
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material)
      return res.status(404).json({ message: "Material not found" });

    if (material.facultyId.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ message: "Access denied: you did not upload this material" });

    const filePath = path.join(__dirname, "..", material.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await material.deleteOne();
    res.status(200).json({ message: "Material deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
