import { authenticateOwner } from "@/application/owner-account/authenticate-owner";
import { hasOwnerAccount } from "@/application/owner-account/has-owner-account";
import { createOwnerAccount } from "@/application/owner-account/create-owner-account";
import { PrismaOwnerAccountRepository } from "@/infrastructure/database/prisma-owner-account-repository";
import { bcryptPasswordHasher } from "@/infrastructure/security/bcrypt-password-hasher";

const repository = new PrismaOwnerAccountRepository();

export const ownerAccountDependencies = {
  hasOwnerAccount: () => hasOwnerAccount(repository),
  createOwnerAccount: (input: Parameters<typeof createOwnerAccount>[0]) =>
    createOwnerAccount(input, { repository, hash: bcryptPasswordHasher.hash }),
  authenticate: (input: Parameters<typeof authenticateOwner>[0]) =>
    authenticateOwner(input, { repository, verify: bcryptPasswordHasher.verify }),
};
