import { createAuthOptions } from "@/presentation/auth/auth-options";
import { ownerAccountDependencies } from "@/presentation/owner-account/owner-account-dependencies";

export const authOptions = createAuthOptions({
  authenticate: ownerAccountDependencies.authenticate,
});
