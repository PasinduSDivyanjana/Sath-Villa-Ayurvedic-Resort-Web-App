const Inquiry = require("../Model/inquiryModel");

// Get all inquiries
const getAllInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find();
        return res.status(200).json({ inquiries: inquiries || [] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Add new inquiry
const addInquiry = async (req, res) => {
    const { name, description } = req.body;
    try {
        const inquiry = new Inquiry({ name, description });
        await inquiry.save();
        return res.status(201).json({ inquiry });
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                message: err.message || "Validation error",
                errors: Object.values(err.errors).map(e => e.message)
            });
        }
        return res.status(500).json({ message: "Unable to add inquiry" });
    }
};

// Get inquiry by ID (Mongo _id)
const getInquiryById = async (req, res) => {
    const id = req.params.id;
    try {
        const inquiry = await Inquiry.findById(id);
        if (!inquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }
        return res.status(200).json({ inquiry });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Update inquiry
const updateInquiry = async (req, res) => {
    const id = req.params.id;
    const { name, description } = req.body;
    try {
        const inquiry = await Inquiry.findById(id);
        if (!inquiry) {
            return res.status(404).json({ message: "Inquiry not found" });
        }

        inquiry.name = name;
        inquiry.description = description;

        await inquiry.save();
        return res.status(200).json({ inquiry });
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                message: err.message || "Validation error",
                errors: Object.values(err.errors).map(e => e.message)
            });
        }
        return res.status(500).json({ message: "Update failed" });
    }
};

// Delete inquiry
const deleteInquiry = async (req, res) => {
    const id = req.params.id;
    try {
        const inquiry = await Inquiry.findByIdAndDelete(id);
        if (!inquiry) {
            return res.status(404).json({ message: "Unable to delete inquiry" });
        }
        return res.status(200).json({ message: "Inquiry deleted successfully", inquiry });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getAllInquiries,
    addInquiry,
    getInquiryById,
    updateInquiry,
    deleteInquiry,
};
