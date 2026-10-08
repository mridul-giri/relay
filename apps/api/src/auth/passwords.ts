import bcrypt from "bcrypt";

export async function hashPassword(password: string): Promise<string> {
  const hash = await bcrypt.hash(password, 10);
  return hash;
}

export async function passwordMatches(
  password: string,
  hash: string,
): Promise<boolean> {
  const matches = await bcrypt.compare(password, hash);
  return matches;
}
