import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/auth";
import { hasOwnerAccount } from "@/application/owner-account/has-owner-account";
import { PrismaOwnerAccountRepository } from "@/infrastructure/database/prisma-owner-account-repository";

export const dynamic = "force-dynamic";

export default async function Home() {
  const repository = new PrismaOwnerAccountRepository();
  if (!(await hasOwnerAccount(repository))) {
    redirect("/setup");
  }

  const session = await getServerSession(authOptions);
  redirect(session ? "/dashboard" : "/login");
}
