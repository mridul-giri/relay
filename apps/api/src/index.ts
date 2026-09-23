import express from "express";
import { eventsRouter } from "./routes/events.ts";
import { tripsRouter } from "./routes/trips.ts";
import { errorHandler } from "./middleware/error-handler.ts";

const app = express();
app.use(express.json());

app.use(tripsRouter);
app.use(eventsRouter);

app.use(errorHandler);

app.listen(3001, () => console.log("api is listening on port 3001"));
