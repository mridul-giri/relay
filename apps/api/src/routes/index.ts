import { Router } from "express";
import { authRouter } from "./auth.ts";
import { callsRouter } from "./calls.ts";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/calls", callsRouter);
