import type { NextFunction, Request, Response } from "express";
import { prisma } from "@repo/db";
import type { AuthResult, Merchant } from "@repo/types";
import { cleanLogin, cleanSignup } from "../auth/validate.ts";
import { hashPassword, passwordMatches } from "../auth/passwords.ts";
import { signMerchantToken } from "../auth/tokens.ts";

function toMerchant(row: {
  id: string;
  name: string;
  email: string;
}): Merchant {
  const merchant = { id: row.id, name: row.name, email: row.email };
  return merchant;
}

export async function signup(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = cleanSignup(req.body);

    const existing = await prisma.merchant.findUnique({
      where: { email: input.email },
    });
    if (existing) {
      res.status(409).json({ error: "email is already registered" });
      return;
    }

    const passwordHash = await hashPassword(input.password);
    const row = await prisma.merchant.create({
      data: { name: input.name, email: input.email, passwordHash },
    });

    const token = signMerchantToken(row.id);
    const result: AuthResult = { merchant: toMerchant(row), token };
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = cleanLogin(req.body);

    const row = await prisma.merchant.findUnique({
      where: { email: input.email },
    });
    if (!row) {
      res.status(401).json({ error: "wrong email or password" });
      return;
    }

    const matches = await passwordMatches(input.password, row.passwordHash);
    if (!matches) {
      res.status(401).json({ error: "wrong email or password" });
      return;
    }

    const token = signMerchantToken(row.id);
    const result: AuthResult = { merchant: toMerchant(row), token };
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const merchantId = res.locals.merchantId as string;

    const row = await prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!row) {
      res.status(401).json({ error: "not signed in" });
      return;
    }

    res.json({ merchant: toMerchant(row) });
  } catch (err) {
    next(err);
  }
}
