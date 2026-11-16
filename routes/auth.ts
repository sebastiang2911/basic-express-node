import { Router } from "express";
import { check } from "express-validator";
import { loginUser } from "@controllers";
import { validateFields } from "@middlewares";
import { googleSignIn } from "../controllers/auth.ts";

const auth = Router();

auth.post(
  "/login",
  [
    check("email", "The email is mandatory").isEmail(),
    check("password", "The password is mandatory").not().isEmpty(),
    validateFields,
  ],
  loginUser,
);

auth.post(
  "/google",
  [
    check("id_token", "Token from google is mandatory").not().isEmpty(),
    validateFields,
  ],
  googleSignIn,
);

export default auth;
