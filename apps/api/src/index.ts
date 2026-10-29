import express from "express";
import { config } from "./config.ts";
import { apiRouter } from "./routes/index.ts";
import { errorHandler } from "./middleware/error-handler.ts";
import { endUnansweredCalls } from "./calls/end-unanswered-calls.ts";

const UNANSWERED_CHECK_MILLISECONDS = 30 * 1000;

const app = express();

app.use(express.json());
app.use(apiRouter);
app.use(errorHandler);

setInterval(() => {
  void endUnansweredCalls();
}, UNANSWERED_CHECK_MILLISECONDS);

app.listen(config.PORT, () =>
  console.log(`api is listening on port ${config.PORT}`),
);
