const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const inquirySchema = new Schema({
    inquiry_id: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: false,
        validate: {
            validator: function(v) {
                return !v || /^[a-zA-Z\s]+$/.test(v); // Only letters and spaces allowed
            },
            message: 'Name can only contain letters and spaces'
        }
    },
    description: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
});

inquirySchema.pre('save', async function(next) {
    if (!this.inquiry_id) {
        const lastInquiry = await this.constructor.findOne({}, {}, { sort: { 'inquiry_id': -1 } });
        
        if (lastInquiry && lastInquiry.inquiry_id) {
            const lastNumber = parseInt(lastInquiry.inquiry_id.slice(3));
            this.inquiry_id = `INQ${String(lastNumber + 1).padStart(3, '0')}`;
        } else {
            this.inquiry_id = 'INQ001';
        }
    }
    next();
});

module.exports = mongoose.model("inquiryModel", inquirySchema);
