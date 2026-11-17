import { Category, Product } from "@models";
import { RequestHandler } from "express";

const productPopulate = [
  { path: "user", select: "name email" },
  { path: "category", select: "name" },
];

export const getProducts: RequestHandler = async (req, res) => {
  const from = Number(req.query.from ?? 0);
  const limit = Number(req.query.limit ?? 5);
  const filter = { state: true };

  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter).populate(productPopulate).skip(from).limit(limit),
  ]);

  return res.json({ total, products });
};

export const getProductById: RequestHandler = async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    state: true,
  }).populate(productPopulate);

  if (!product) {
    return res.status(404).json({
      message: `No active product exists with ID ${req.params.id}`,
    });
  }

  return res.json({ product });
};

export const createProduct: RequestHandler = async (req, res) => {
  const { state, user, ...body } = req.body;

  const productoDB = await Product.findOne({ name: body.nombre });

  if (productoDB) {
    return res.status(400).json({
      message: `The product ${name} already exists`,
    });
  }

  const data = {
    ...body,
    name: body.name.toUpperCase(),
    user: req.user?._id,
  };

  const newProduct = new Product(data);

  await newProduct.save();
  return res.status(201).json(newProduct);
};

export const updateProduct: RequestHandler = async (req, res) => {
  const { state: _state, user: _user, ...changes } = req.body;

  if (typeof changes.name === "string") {
    changes.name = changes.name.trim().toUpperCase();
  }

  if (changes.category) {
    const category = await Category.findOne({
      _id: changes.category,
      state: true,
    });

    if (!category) {
      return res.status(400).json({ message: "The category does not exist" });
    }
  }

  changes.user = req.user?._id;

  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, state: true },
    changes,
    { new: true, runValidators: true },
  ).populate(productPopulate);

  if (!product) {
    return res.status(404).json({
      message: `No active product exists with ID ${req.params.id}`,
    });
  }

  return res.json({ product });
};

export const deleteProduct: RequestHandler = async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, state: true },
    { state: false },
    { new: true },
  ).populate(productPopulate);

  if (!product) {
    return res.status(404).json({
      message: `No active product exists with ID ${req.params.id}`,
    });
  }

  return res.json({ product });
};
