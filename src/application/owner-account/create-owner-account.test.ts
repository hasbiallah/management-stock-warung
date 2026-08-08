import { describe, expect, it } from "vitest";

import {
  SetupAlreadyCompletedError,
  createOwnerAccount,
} from "./create-owner-account";
import type {
  CreateOwnerAccount,
  OwnerAccount,
  OwnerAccountRepository,
} from "@/domain/owner-account/owner-account-repository";

class InMemoryOwnerAccountRepository implements OwnerAccountRepository {
  accounts: OwnerAccount[] = [];

  async count(): Promise<number> {
    return this.accounts.length;
  }

  async create(account: CreateOwnerAccount): Promise<OwnerAccount> {
    const created = { id: String(this.accounts.length + 1), ...account };
    this.accounts.push(created);
    return created;
  }

  async findByEmail(email: string): Promise<OwnerAccount | null> {
    return this.accounts.find((account) => account.email === email) ?? null;
  }
}

describe("createOwnerAccount", () => {
  it("creates the one Pemilik Warung account with a normalized email and hashed password", async () => {
    const repository = new InMemoryOwnerAccountRepository();
    const hash = async (password: string) => `hashed:${password}`;

    const owner = await createOwnerAccount(
      { email: " Pemilik@Warung.test ", password: "rahasia-kuat" },
      { repository, hash },
    );

    expect(owner).toMatchObject({
      email: "pemilik@warung.test",
      passwordHash: "hashed:rahasia-kuat",
    });
  });

  it("refuses a second setup attempt", async () => {
    const repository = new InMemoryOwnerAccountRepository();
    await repository.create({ email: "pemilik@warung.test", passwordHash: "existing" });

    await expect(
      createOwnerAccount(
        { email: "other@warung.test", password: "rahasia-kuat" },
        { repository, hash: async () => "hashed" },
      ),
    ).rejects.toBeInstanceOf(SetupAlreadyCompletedError);
  });
});
