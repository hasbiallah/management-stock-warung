import { createAuthOptions } from "@/presentation/auth/auth-options";
import { authenticateOwner } from "@/application/owner-account/authenticate-owner";
import { PrismaOwnerAccountRepository } from "@/infrastructure/database/prisma-owner-account-repository";
import { bcryptPasswordHasher } from "@/infrastructure/security/bcrypt-password-hasher";

export const authOptions = createAuthOptions({
  authenticate: (input) => {
    const repository = new PrismaOwnerAccountRepository();
    return authenticateOwner(input, { repository, verify: bcryptPasswordHasher.verify });
  },
});
