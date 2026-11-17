import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "@controllers";
import { checkJWT, validateFields } from "@middlewares";
import { Router } from "express";
import { check } from "express-validator";
import { existProductById, existCategoryById } from "@helpers";

const products = Router();

products.get("/", getProducts);

products.get(
  "/:id",
  [check("id", "The ID is not a valid Mongo ID").isMongoId(), validateFields],
  getProductById,
);

products.post(
  "/",
  [
    checkJWT,
    check("name", "Name is mandatory").not().isEmpty(),
    check("category", "Is not a Mongo ID").isMongoId(),
    check("category").custom(existCategoryById),
    validateFields,
  ],
  createProduct,
);

products.put(
  "/:id",
  [checkJWT, check("id").custom(existProductById), validateFields],
  updateProduct,
);

products.delete(
  "/:id",
  [
    checkJWT,
    check("id", "The ID is not a valid Mongo ID").isMongoId(),
    check("id").custom(existProductById),
    validateFields,
  ],
  deleteProduct,
);

export default products;
