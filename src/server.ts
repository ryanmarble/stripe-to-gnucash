import dotenv from "dotenv";
import getStripeClient from "./services/stripe.js";

dotenv.config();
getStripeClient(); // Initialize Stripe client

import express, { Application, Request, Response } from "express";
import webhookRoutes from "./routes/webhookRoutes.js";

const app: Application = express();
const PORT = process.env.PORT || 3000;
const API_BASE = "/api";

app.use(`${API_BASE}`, webhookRoutes);
app.get("/", (req: Request, res: Response) => {
	res.status(403);
});

const startServer = async () => {
	try {
		app.listen(PORT, () => {
			console.log(`Server is running at http://localhost:${PORT}`);
			console.log(
				`API Webhook Endpoint: POST http://localhost:${PORT}${API_BASE}/stripe`
			);
		});
	} catch (error) {
		console.error("Failed to start server: ", error);
		process.exit(1);
	}
};

startServer();
