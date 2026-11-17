import { Router } from "express";
import { find } from "@controllers";

const router = Router();

router.get("/:collection/:term", [], find);

export default router;
