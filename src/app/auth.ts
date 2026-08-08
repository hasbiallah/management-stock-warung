import { authenticateOwner } from "@/application/owner-account/authenticate-owner";
import { PrismaOwnerAccountRepository } from "@/infrastructure/database/prisma-owner-account-repository";
import { bcryptPasswordHasher } from "@/infrastructure/security/bcrypt-password-hasher";
import { createAuthOptions } from "@/presentation/auth/auth-options";

const repository = new PrismaOwnerAccountRepository();

export const authOptions = createAuthOptions({
  authenticate: (input) =>
    authenticateOwner(input, {
      repository,
      verify: bcryptPasswordHasher.verify,
    }),
});
