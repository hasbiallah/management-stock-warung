import type { OwnerAccountRepository } from "@/domain/owner-account/owner-account-repository";

export async function hasOwnerAccount(repository: OwnerAccountRepository): Promise<boolean> {
  return (await repository.count()) > 0;
}
