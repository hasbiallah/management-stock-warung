import { describe, expect, it } from "vitest";

import { authenticateOwner } from "./authenticate-owner";
import type {
  OwnerAccount,
  OwnerAccountRepository,
} from "@/domain/owner-account/owner-account-repository";

const account: OwnerAccount = {
  id: "owner-1",
  email: "pemilik@warung.test",
  passwordHash: "stored-hash",
};

const repository: OwnerAccountRepository = {
  count: async () => 1,
  create: async () => account,
  findByEmail: async (email) => (email === account.email ? account : null),
};

describe("authenticateOwner", () => {
  it("returns the owner when the supplied credentials are valid", async () => {
    await expect(
      authenticateOwner(
        { email: " PEMILIK@warung.test ", password: "rahasia-kuat" },
        { repository, verify: async () => true },
      ),
    ).resolves.toEqual(account);
  });

  it("does not authenticate an unknown email or an incorrect password", async () => {
    await expect(
      authenticateOwner(
        { email: "tidak-ada@warung.test", password: "rahasia-kuat" },
        { repository, verify: async () => true },
      ),
    ).resolves.toBeNull();

    await expect(
      authenticateOwner(
        { email: account.email, password: "salah" },
        { repository, verify: async () => false },
      ),
    ).resolves.toBeNull();
  });
});
