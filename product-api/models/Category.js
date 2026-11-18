const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category ka naam zaroori hai"],
      unique: true,
      trim: true,
      minLength: [2, "Naam kam az kam 2 characters ka ho"],
      maxLength: [50, "Naam 50 characters se zyada nahi ho sakta"],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [200, "Description 200 characters se zyada nahi ho sakti"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);