import { Router } from "express";
import { tripsRouter } from "./trips.ts";
import { eventsRouter } from "./events.ts";
import { callsRouter } from "./calls.ts";

export const apiRouter = Router();

apiRouter.use("/trips", tripsRouter);
apiRouter.use("/events", eventsRouter);
apiRouter.use("/call-attempts", callsRouter);
