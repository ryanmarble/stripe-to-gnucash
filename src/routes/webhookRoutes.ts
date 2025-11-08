import express from "express";
import { handleStripeWebhook } from "../controllers/stripeController.js";

const router = express.Router();

const rawBodyParser = express.raw({ type: "application/json" });

router.post("/stripe", rawBodyParser, handleStripeWebhook);

export default router;
