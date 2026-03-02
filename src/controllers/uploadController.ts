import type express from "express";
import fs from "fs";
import csv from "csv-parser";
import * as z from "zod";

export async function handleUploadWebhook<T extends z.ZodObject>(
  req: express.Request,
  res: express.Response,
  shape: T,
  cb: (results: z.infer<T>[]) => Promise<void>,
) {
  if (!req.file) return res.status(400).send("No file uploaded");

  const results: z.infer<T>[] = [];

  fs.createReadStream(req.file.path)
    .pipe(csv({ separator: ";" }))
    .on("data", (data) => {
      const { success, data: parsedData } = shape.safeParse(data);
      if (success) results.push(parsedData);
    })
    .on("end", async () => {
      fs.unlinkSync(req.file!.path);
      try {
        await cb(results);
        res.status(200).send();
      } catch (e) {
        console.error(e);
        res.status(400).send();
      }
    })
    .on("error", (e) => {
      console.error(e);
      res.status(500).send();
    });
}
