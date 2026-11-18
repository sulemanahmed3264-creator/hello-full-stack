const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product ka naam zaroori hai"],
      trim: true,
      minLength: [2, "Naam kam az kam 2 characters ka ho"],
      maxLength: [100, "Naam 100 characters se zyada nahi ho sakta"],
    },
    price: {
      type: Number,
      required: [true, "Price zaroori hai"],
      min: [0, "Price negative nahi ho sakti"],
    },
    category: {
      type: String,
      enum: {
        values: ["electronics", "clothing", "food", "books", "other"],
        message: "{VALUE} category allowed nahi hai",
      },
      default: "other",
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock negative nahi ho sakta"],
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxLength: [500, "Description 500 characters se zyada nahi ho sakti"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------- Virtuals ----------
productSchema.virtual("priceWithTax").get(function () {
  return Math.round(this.price * 1.17);
});

productSchema.virtual("stockStatus").get(function () {
  if (this.stock === 0) return "out of stock";
  if (this.stock <= 5) return "low stock";
  return "in stock";
});

// ---------- Instance methods ----------
productSchema.methods.isInStock = function () {
  return this.stock > 0 && this.isAvailable;
};

productSchema.methods.applyDiscount = function (percent) {
  if (percent < 0 || percent > 100) {
    throw new Error("Discount 0 se 100 ke beech hona chahiye");
  }
  return Math.round(this.price * (1 - percent / 100));
};

// ---------- Static method ----------
productSchema.statics.findByCategory = function (category) {
  return this.find({ category });
};

// ---------- Indexes ----------
productSchema.index({ category: 1, price: -1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ name: "text" });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;