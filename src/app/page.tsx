import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { hasOwnerAccount } from "@/application/owner-account/has-owner-account";
import { PrismaOwnerAccountRepository } from "@/infrastructure/database/prisma-owner-account-repository";
import { authOptions } from "@/app/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!(await hasOwnerAccount(new PrismaOwnerAccountRepository()))) {
    redirect("/setup");
  }

  const session = await getServerSession(authOptions);
  redirect(session ? "/dashboard" : "/login");
}
