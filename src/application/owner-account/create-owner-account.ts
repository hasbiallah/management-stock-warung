import type {
  OwnerAccount,
  OwnerAccountRepository,
} from "@/domain/owner-account/owner-account-repository";

export class SetupAlreadyCompletedError extends Error {
  constructor() {
    super("Akun Pemilik Warung sudah dibuat.");
  }
}

type Dependencies = {
  repository: OwnerAccountRepository;
  hash(password: string): Promise<string>;
};

export async function createOwnerAccount(
  input: { email: string; password: string },
  { repository, hash }: Dependencies,
): Promise<OwnerAccount> {
  if ((await repository.count()) > 0) {
    throw new SetupAlreadyCompletedError();
  }

  return repository.create({
    email: input.email.trim().toLowerCase(),
    passwordHash: await hash(input.password),
  });
}
