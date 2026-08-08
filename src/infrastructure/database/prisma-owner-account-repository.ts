import type {
  CreateOwnerAccount,
  OwnerAccount,
  OwnerAccountRepository,
} from "@/domain/owner-account/owner-account-repository";

import { prisma } from "./prisma-client";

export class PrismaOwnerAccountRepository implements OwnerAccountRepository {
  async count(): Promise<number> {
    return prisma.ownerAccount.count();
  }

  async create(account: CreateOwnerAccount): Promise<OwnerAccount> {
    return prisma.ownerAccount.create({
      data: {
        ...account,
      },
    });
  }

  async findByEmail(email: string): Promise<OwnerAccount | null> {
    return prisma.ownerAccount.findUnique({ where: { email } });
  }
}
