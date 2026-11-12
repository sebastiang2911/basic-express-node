import { Router } from "express";
import { check } from "express-validator";
import {
  getUsers,
  postUser,
  putUser,
  patchUsers,
  deleteUsers,
} from "../controllers/users.ts";
import { validateFields } from "../middlewares/validatate-fields.ts";
import {
  isValidRole,
  isEmailExist,
  isExistUserById,
} from "../helpers/dbValidators.ts";

const router = Router();

router.get("/", getUsers);
router.post(
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

router.put(
  "/:id",
  [
    check("id", "Its not valid ID").isMongoId().bail().custom(isExistUserById),
    check("role").custom(isValidRole),
    validateFields,
  ],
  putUser,
);
router.patch(
  "/:id",
  [
    check("id", "Its not valid ID").isMongoId().bail().custom(isExistUserById),
    check("role").optional().custom(isValidRole),
    validateFields,
  ],
  patchUsers,
);
router.delete(
  "/:id",
  [
    check("id", "Its not valid ID").isMongoId().bail().custom(isExistUserById),
    validateFields,
  ],
  deleteUsers,
);

export default router;
