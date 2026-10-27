const express = require("express");
const Recipe = require("../models/Recipe");

const router = express.Router();

// CREATE: Add recipe
router.post("/", async (req, res) => {
  try {
    const { name, category, ingredients, steps, cookingTime } = req.body;

    if (
      typeof name !== "string" || !name.trim() ||
      typeof category !== "string" ||
      !["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"].includes(category) ||
      typeof ingredients !== "string" || !ingredients.trim() ||
      typeof steps !== "string" || !steps.trim() ||
      cookingTime === "" ||
      cookingTime === null ||
      cookingTime === undefined ||
      !Number.isInteger(Number(cookingTime)) ||
      Number(cookingTime) < 1 ||
      Number(cookingTime) > 1440
    ) {
      return res.status(400).json({
        message: "Enter valid values in every field."
      });
    }

    const recipe = await Recipe.create({
      name: name.trim(),
      category,
      ingredients: ingredients.trim(),
      steps: steps.trim(),
      cookingTime: Number(cookingTime)
    });

    res.status(201).json({
      message: "Recipe added successfully!",
      recipe
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ: Get all recipes
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recipes." });
  }
});

// READ: Get one recipe by ID
router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found." });
    }

    res.json(recipe);
  } catch (error) {
    res.status(400).json({ message: "Invalid recipe ID." });
  }
});

// UPDATE: Edit recipe
router.put("/:id", async (req, res) => {
  try {
    const { name, category, ingredients, steps, cookingTime } = req.body;

    if (
      typeof name !== "string" || !name.trim() ||
      typeof category !== "string" ||
      !["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"].includes(category) ||
      typeof ingredients !== "string" || !ingredients.trim() ||
      typeof steps !== "string" || !steps.trim() ||
      cookingTime === "" ||
      cookingTime === null ||
      cookingTime === undefined ||
      !Number.isInteger(Number(cookingTime)) ||
      Number(cookingTime) < 1 ||
      Number(cookingTime) > 1440
    ) {
      return res.status(400).json({
        message: "Enter valid values in every field."
      });
    }

    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        category,
        ingredients: ingredients.trim(),
        steps: steps.trim(),
        cookingTime: Number(cookingTime)
      },
      { new: true, runValidators: true }
    );

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found." });
    }

    res.json({
      message: "Recipe updated successfully!",
      recipe
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE: Remove recipe
router.delete("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found." });
    }

    res.json({ message: "Recipe deleted successfully!" });
  } catch (error) {
    res.status(400).json({ message: "Invalid recipe ID." });
  }
});

module.exports = router;