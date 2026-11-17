import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "@controllers";
import { checkJWT, validateFields } from "@middlewares";
import { Router } from "express";
import { check } from "express-validator";

const categories = Router();

// Get all categories - public
categories.get("/", [], getCategories);

// category in specific with ID
categories.get(
  "/:id",
  [check("id", "The ID is not a valid Mongo ID").isMongoId(), validateFields],
  getCategoryById,
);

//create category - private - with valid token
categories.post(
  "/",
  [
    checkJWT,
    check("name", "The name is mandatory").not().isEmpty(),
    validateFields,
  ],
  createCategory,
);

//update category - private - with valid token
categories.put(
  "/:id",
  [
    checkJWT,
    check("id", "The ID is not a valid Mongo ID").isMongoId(),
    check("name", "Name is required").not().isEmpty(),
    validateFields,
  ],
  updateCategory,
);

//delete category - private - with valid token
categories.delete(
  "/:id",
  [
    checkJWT,
    check("id", "The ID is not a valid Mongo ID").isMongoId(),
    validateFields,
  ],
  deleteCategory,
);

export default categories;
