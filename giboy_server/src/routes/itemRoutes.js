import express from "express";
import { upload, addItem } from "../controllers/itemController";

const router = express.Router();

router.post("/items", upload.single("image"), addItem);

export default router;
