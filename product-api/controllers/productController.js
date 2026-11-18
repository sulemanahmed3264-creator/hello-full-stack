const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");

// Validation error ko saaf 400 jawab me badalne ka helper
const sendValidationError = (res, error) => {
  const messages = Object.values(error.errors).map((e) => e.message);
  return res.status(400).json({
    success: false,
    message: "Validation fail ho gayi",
    errors: messages,
  });
};

// categoryId sahi hai aur Category maujood hai? (theek ho to null, warna message)
const checkCategoryId = async (categoryId) => {
  if (!mongoose.isValidObjectId(categoryId)) return "Category ID ghalat hai";
  const exists = await Category.exists({ _id: categoryId });
  if (!exists) return "Category nahi mili";
  return null;
};

// GET /api/products   (?name=lap  ?category=electronics  ?sort=price  ?sort=-price)
const getProducts = async (req, res, next) => {
  try {
    const { name, category, sort } = req.query;

    const filter = {};
    if (name) {
      const safeName = String(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.name = { $regex: safeName, $options: "i" };
    }
    if (category) {
      filter.category = String(category);
    }

    let sortBy = "-createdAt";
    if (sort === "price") sortBy = "price";
    if (sort === "-price") sortBy = "-price";

    const foundProducts = await Product.find(filter)
      .select("name price category categoryId stock sku")
      .populate("categoryId", "name")
      .sort(sortBy)
      .lean();

    res.status(200).json({
      success: true,
      count: foundProducts.length,
      data: foundProducts,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Product ID ghalat hai" });
    }

    const product = await Product.findById(id).populate("categoryId", "name description");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product nahi mila" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const { name, price, category, categoryId, stock, sku, description, isAvailable } = req.body;

    if (categoryId !== undefined && categoryId !== null) {
      const problem = await checkCategoryId(categoryId);
      if (problem) {
        return res.status(400).json({ success: false, message: problem });
      }
    }

    const product = await Product.create({
      name,
      price,
      category,
      categoryId,
      stock,
      sku,
      description,
      isAvailable,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendValidationError(res, error);
    }
    next(error);
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Product ID ghalat hai" });
    }

    // Sirf allowed fields, aur sirf wahi jo user ne bheji hon
    const allowedFields = [
      "name",
      "price",
      "category",
      "categoryId",
      "stock",
      "sku",
      "description",
      "isAvailable",
    ];
    const updates = {};
    const body = req.body || {};
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Update ke liye kam az kam ek field bhejo",
      });
    }

    if (updates.categoryId !== undefined && updates.categoryId !== null) {
      const problem = await checkCategoryId(updates.categoryId);
      if (problem) {
        return res.status(400).json({ success: false, message: problem });
      }
    }

    const result = await Product.updateOne(
      { _id: id },
      { $set: updates },
      { runValidators: true }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Product nahi mila" });
    }

    const updatedProduct = await Product.findById(id).populate("categoryId", "name description");
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendValidationError(res, error);
    }
    next(error);
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Product ID ghalat hai" });
    }

    const result = await Product.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Product nahi mila" });
    }

    res.status(200).json({ success: true, message: "Product delete ho gaya" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};