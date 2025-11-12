import express from "express";
import { handleStripeWebhook } from "../controllers/stripeController.js";
import { handleNocoWebhook } from "../controllers/nocoController.js";

const router = express.Router();

const rawBodyParser = express.raw({ type: "application/json" });
const jsonBodyParser = express.json()

router.post("/stripe", rawBodyParser, handleStripeWebhook);
router.post("/noco", jsonBodyParser, handleNocoWebhook)

export default router;
