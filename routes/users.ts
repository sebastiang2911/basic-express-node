import { Router } from "express";
import { check } from "express-validator";
import {
  getUsers,
  postUser,
  putUser,
  patchUsers,
  deleteUsers,
} from "@controllers";
import {
  checkJWT,
  haveRole,
  // isAdminRole,
  validateFields,
} from "@middlewares";
import {
  isValidRole,
  isEmailExist,
  isExistUserById,
} from "@helpers";

const users = Router();

users.get("/", getUsers);
users.post(
  "/",
  [
    check("email", "The email is invalid").isEmail(),
    check("name", "The name is mandatory").not().isEmpty(),
    check("password")
      .notEmpty()
      .withMessage("The password is mandatory")
      .isLength({ min: 6 })
      .withMessage("The password must contain at least 6 characters"),
    // check("role", "This role is not valid").isIn(["ADMIN_ROLE", "USER_ROLE"]),
    check("role").custom(isValidRole),
    check("email").custom(isEmailExist),
    validateFields,
  ],
  postUser,
);

users.put(
  "/:id",
  [
    check("id", "Its not valid ID").isMongoId().bail().custom(isExistUserById),
    check("role").custom(isValidRole),
    validateFields,
  ],
  putUser,
);
users.patch(
  "/:id",
  [
    check("id", "Its not valid ID").isMongoId().bail().custom(isExistUserById),
    check("role").optional().custom(isValidRole),
    validateFields,
  ],
  patchUsers,
);
users.delete(
  "/:id",
  [
    checkJWT,
    // isAdminRole,
    haveRole("ADMIN_ROLE"),
    check("id", "Its not valid ID").isMongoId().bail().custom(isExistUserById),
    validateFields,
  ],
  deleteUsers,
);

export default users;
