import { Router } from "express";
import {
  getUsers,
  postUsers,
  putUsers,
  patchUsers,
  deleteUsers,
} from "../controllers/users.ts";

const router = Router();

router.get("/", getUsers);
router.post("/", postUsers);
router.put(["/", "/:id"], putUsers);
router.patch("/", patchUsers);
router.delete("/", deleteUsers);

export default router;
