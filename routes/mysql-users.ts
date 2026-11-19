import { Router } from "express";
import { body, param } from "express-validator";
import {
  createMySqlUser,
  deleteMySqlUser,
  getMySqlUserById,
  getMySqlUsers,
  updateMySqlUser,
} from "@controllers";
import { validateFields } from "@middlewares";

const mysqlUsers = Router();
const validId = param("id").isUUID().withMessage("Invalid user ID");
const validBody = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  validateFields,
];

mysqlUsers.get("/", getMySqlUsers);
mysqlUsers.get("/:id", [validId, validateFields], getMySqlUserById);
mysqlUsers.post("/", validBody, createMySqlUser);
mysqlUsers.put("/:id", [validId, ...validBody], updateMySqlUser);
mysqlUsers.delete("/:id", [validId, validateFields], deleteMySqlUser);

export default mysqlUsers;
