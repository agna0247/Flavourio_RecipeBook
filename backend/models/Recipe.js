const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Recipe name is required"],
      trim: true,
      maxlength: 100
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"]
    },

    ingredients: {
      type: String,
      required: [true, "Ingredients are required"],
      trim: true
    },

    steps: {
      type: String,
      required: [true, "Preparation steps are required"],
      trim: true
    },

    cookingTime: {
      type: Number,
      required: [true, "Cooking time is required"],
      min: [1, "Cooking time must be at least 1 minute"],
      max: 1440
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", recipeSchema);