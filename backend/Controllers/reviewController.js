const Review = require("../Model/reviewModel");

// Get all reviews
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find();
        return res.status(200).json({ reviews: reviews || [] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Add new review
const addReview = async (req, res) => {
    const { name, description, stars } = req.body;
    try {
        const review = new Review({ name, description, stars });
        await review.save();
        return res.status(201).json({ review });
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                message: err.message || "Validation error",
                errors: Object.values(err.errors).map(e => e.message)
            });
        }
        return res.status(500).json({ message: "Unable to add review" });
    }
};

// Get review by ID (Mongo _id)
const getReviewById = async (req, res) => {
    const id = req.params.id;
    try {
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        return res.status(200).json({ review });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Update review
const updateReview = async (req, res) => {
    const id = req.params.id;
    const { name, description, stars } = req.body;
    try {
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        review.name = name;
        review.description = description;
        review.stars = stars;

        await review.save();
        return res.status(200).json({ review });
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

// Delete review
const deleteReview = async (req, res) => {
    const id = req.params.id;
    try {
        const review = await Review.findByIdAndDelete(id);
        if (!review) {
            return res.status(404).json({ message: "Unable to delete review" });
        }
        return res.status(200).json({ message: "Review deleted successfully", review });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getAllReviews,
    addReview,
    getReviewById,
    updateReview,
    deleteReview,
};
