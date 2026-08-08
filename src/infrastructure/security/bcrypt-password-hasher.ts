import { compare, hash } from "bcryptjs";

const HASH_ROUNDS = 12;

export const bcryptPasswordHasher = {
  hash(password: string): Promise<string> {
    return hash(password, HASH_ROUNDS);
  },
  verify(password: string, passwordHash: string): Promise<boolean> {
    return compare(password, passwordHash);
  },
};
