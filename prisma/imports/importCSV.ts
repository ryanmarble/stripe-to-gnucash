import prisma from "../../src/services/database";
import csv from "csv-parser";
import fs from "fs";

interface ImportDataShape {
	budget_guid: string;
	account_guid: string;
	period_num: number;
	amount_num: number;
	amount_denom: number;
}

const results: ImportDataShape[] = [];

fs.createReadStream("prisma/raw/budget_import_data.csv")
	.pipe(csv())
	.on("data", (data: ImportDataShape) => results.push(data))
	.on("end", async () => {
		await prisma.budgetAmounts.createMany({
			data: results,
		});
	});
