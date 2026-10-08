import { Router } from "express";
import { login, me, signup } from "../controllers/auth.ts";
import { requireMerchant } from "../middleware/require-merchant.ts";

export const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/me", requireMerchant, me);
