import { Category, Product, Role, User } from "@models";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";

const collectionAliases: Record<string, string> = {
  user: "users",
  users: "users",
  product: "products",
  products: "products",
  category: "categories",
  categories: "categories",
  role: "roles",
  roles: "roles",
};

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findUsers = async (term: string) => {
  if (isValidObjectId(term)) {
    const user = await User.findOne({ _id: term, state: true });
    return user ? [user] : [];
  }

  const regex = new RegExp(escapeRegex(term), "i");
  return User.find({
    state: true,
    $or: [{ name: regex }, { email: regex }],
  });
};

export const find: RequestHandler = async (req, res) => {
  const collectionParam = String(req.params.collection);
  const requestedCollection = collectionParam.toLowerCase();
  const collection = collectionAliases[requestedCollection];
  const term = String(req.params.term).trim();

  if (!collection) {
    return res.status(400).json({
      message: `The collection ${collectionParam} doesn't exist`,
    });
  }

  const regex = new RegExp(escapeRegex(term), "i");
  let results;

  switch (collection) {
    case "users":
      results = await findUsers(term);
      break;

    case "products":
      results = await Product.find({ name: regex, state: true })
        .populate("user", "name")
        .populate("category", "name");
      break;

    case "categories":
      results = await Category.find({ name: regex, state: true }).populate(
        "user",
        "name",
      );
      break;

    case "roles":
      results = await Role.find({ role: regex });
      break;

    default:
      return res.status(400).json({
        message: "Not exist",
      });
  }

  return res.json({
    total: results?.length ?? 0,
    results,
  });
};
