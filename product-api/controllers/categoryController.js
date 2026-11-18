const mongoose = require("mongoose");
const Category = require("../models/Category");

// POST /api/categories
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const category = await Category.create({ name, description });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation fail ho gayi",
        errors: messages,
      });
    }
    next(error);
  }
};

// GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort("name").lean();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/categories/:id
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Category ID ghalat hai" });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category nahi mili" });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCategory, getCategories, getCategoryById };