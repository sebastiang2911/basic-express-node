import { Router } from "express";
import { check } from "express-validator";
import { loginUser } from "@controllers";
import { validateFields } from "@middlewares";

const auth = Router();

auth.post(
  "/",
  [
    check("email", "The email is mandatory").isEmail(),
    check("password", "The password is mandatory").not().isEmpty(),
    validateFields,
  ],
  loginUser,
);

export default auth;
