import { badWords } from "./badWords.js";

export function sanitizeName(name) {
    const cleanName = name.split(' ')
              .filter(word => word.length > 0 && !badWords.has(word.toLowerCase()))
              .join(' ');
    return cleanName;
}