import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  const joinedClasses = clsx(inputs);
  const mergedClasses = twMerge(joinedClasses);
  return mergedClasses;
}
