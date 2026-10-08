import express from "express";
import { config } from "@repo/config";
import { connectRedis } from "@repo/redis";
import { apiRouter } from "./routes/index.ts";
import { errorHandler } from "./middleware/error-handler.ts";

const app = express();

app.use(express.json());
app.use(apiRouter);

await connectRedis();

app.use(errorHandler);

app.listen(config.PORT, () =>
  console.log(`api is listening on port ${config.PORT}`),
);
