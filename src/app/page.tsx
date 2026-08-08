import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/auth";
import { ownerAccountDependencies } from "@/presentation/owner-account/owner-account-dependencies";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!(await ownerAccountDependencies.hasOwnerAccount())) {
    redirect("/setup");
  }

  const session = await getServerSession(authOptions);
  redirect(session ? "/dashboard" : "/login");
}
