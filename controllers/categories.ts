import { Category } from "@models";
import { RequestHandler } from "express";

export const getCategories: RequestHandler = async (req, res) => {
  const from = Number(req.query.from ?? 0);
  const limit = Number(req.query.limit ?? 5);
  const filter = { state: true };

  const [total, categories] = await Promise.all([
    Category.countDocuments(filter),
    Category.find(filter)
      .populate("user", "name email")
      .skip(from)
      .limit(limit),
  ]);

  res.json({
    total,
    categories,
  });
};

export const getCategoryById: RequestHandler = async (req, res) => {
  const { id } = req.params;

  const category = await Category.findOne({
    _id: id,
    state: true,
  }).populate("user", "name email");

  if (!category) {
    return res.status(200).json({
      message: `No existen registros de ${id}`,
    });
  }

  res.json({
    category,
  });
};

export const createCategory: RequestHandler = async (req, res) => {
  const name = req.body.name.toUpperCase();

  const category = await Category.findOne({ name });

  if (category) {
    return res.status(400).json({
      message: `The Category: ${name} already exist`,
    });
  }

  const data = {
    name,
    user: req?.user?._id,
  };

  const newCategory = new Category(data);
  await newCategory.save();

  return res.status(201).json(newCategory);
};

export const updateCategory: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const name = req.body.name.toUpperCase();
  const state = req.body.state;

  const category = await Category.findById(id);

  if (!category) {
    return res.status(200).json({
      message: `No existen registros de ${id}`,
    });
  }

  category.name = name;

  const newCategory = await Category.findByIdAndUpdate(
    id,
    { name, state: state || category.state },
    { new: true, runValidators: true },
  ).populate("user", "name email");

  res.json({
    message: "PUT Category",
    newCategory,
  });
};

export const deleteCategory: RequestHandler = async (req, res) => {
  const { id } = req.params;

  const category = await Category.findByIdAndUpdate(id, { state: false });
  const userAuthenticated = req.user;

  res.json({
    message: "DELETE API - Controller",
    category,
    userAuthenticated,
  });

  res.json({
    message: "DELETE Category",
    id,
  });
};
