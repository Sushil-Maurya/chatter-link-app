import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatar(profilePic: string | undefined, gender: string | undefined): string {
    if (profilePic) return profilePic;
    if (gender === "female") return "https://avatar.iran.liara.run/public/girl";
    return "https://avatar.iran.liara.run/public/boy";
}
