import express from "express";
import { handleStripeWebhook } from "../controllers/stripeController.js";
import { handleNocoWebhook } from "../controllers/nocoController.js";
import { handleUploadWebhook } from "../controllers/uploadController.js";
import multipartBodyParser from "../middleware/multipartParser.js";
import {
  payrollSplitShape,
  savePayrollTransaction,
} from "../utils/savePayrollTransaction.js";

const router = express.Router();

const rawBodyParser = express.raw({ type: "application/json" });
const jsonBodyParser = express.json();

router.post("/stripe", rawBodyParser, handleStripeWebhook);
router.post("/noco", jsonBodyParser, handleNocoWebhook);
router.post("/transaction/payroll", multipartBodyParser.single("file"), (req, res) => {
  const status = handleUploadWebhook<typeof payrollSplitShape>(
    req,
    res,
    payrollSplitShape,
    savePayrollTransaction,
  );
});

export default router;
