import type {
  OwnerAccount,
  OwnerAccountRepository,
} from "@/domain/owner-account/owner-account-repository";

type Dependencies = {
  repository: OwnerAccountRepository;
  verify(password: string, hash: string): Promise<boolean>;
};

export async function authenticateOwner(
  input: { email: string; password: string },
  { repository, verify }: Dependencies,
): Promise<OwnerAccount | null> {
  const account = await repository.findByEmail(input.email.trim().toLowerCase());

  if (!account || !(await verify(input.password, account.passwordHash))) {
    return null;
  }

  return account;
}
