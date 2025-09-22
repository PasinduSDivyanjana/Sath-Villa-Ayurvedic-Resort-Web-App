const express = require("express");
const router = express.Router();

const InquiryController = require("../Controllers/inquiryController");

router.get("/", InquiryController.getAllInquiries);
router.post("/", InquiryController.addInquiry);
router.get("/:id", InquiryController.getInquiryById);
router.put("/:id", InquiryController.updateInquiry);
router.delete("/:id", InquiryController.deleteInquiry);

module.exports = router;
