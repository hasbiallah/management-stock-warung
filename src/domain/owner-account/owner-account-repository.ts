export type OwnerAccount = {
  id: string;
  email: string;
  passwordHash: string;
};

export type CreateOwnerAccount = Omit<OwnerAccount, "id">;

export interface OwnerAccountRepository {
  count(): Promise<number>;
  create(account: CreateOwnerAccount): Promise<OwnerAccount>;
  findByEmail(email: string): Promise<OwnerAccount | null>;
}
