import { Router } from "express";
import {
  loadFiles,
  showImageByCloudinary,
  // updateFiles,
  updateImageCloudinary,
} from "@controllers";
import { check } from "express-validator";
import { validateFields, validateFile } from "@middlewares";
import { collectionAllowed } from "@helpers";

const router = Router();

router.post("/", validateFile, loadFiles);

router.put(
  "/:collection/:id",
  [
    validateFile,
    check("id", "Is not Mongo ID").isMongoId(),
    check("collection").custom((c) =>
      collectionAllowed(c, ["users", "products"]),
    ),
    validateFields,
  ],
  // updateFiles,
  updateImageCloudinary,
);

router.get(
  "/:collection/:id",
  [
    check("id", "Is not Mongo ID").isMongoId(),
    check("collection").custom((c) =>
      collectionAllowed(c, ["users", "products"]),
    ),
    validateFields,
  ],
  showImageByCloudinary,
);

export default router;
