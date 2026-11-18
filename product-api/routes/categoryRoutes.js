const express = require("express");
const router = express.Router();
const apiKeyAuth = require("../middleware/auth");
const {
  createCategory,
  getCategories,
  getCategoryById,
} = require("../controllers/categoryController");

// GET khula hai, POST sirf API key walon ke liye
router.route("/").get(getCategories).post(apiKeyAuth, createCategory);

router.route("/:id").get(getCategoryById);

module.exports = router;