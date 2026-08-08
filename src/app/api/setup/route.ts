import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { SetupAlreadyCompletedError, createOwnerAccount } from "@/application/owner-account/create-owner-account";
import { parseJsonBody } from "@/presentation/api/parse-json-body";
import { PrismaOwnerAccountRepository } from "@/infrastructure/database/prisma-owner-account-repository";
import { bcryptPasswordHasher } from "@/infrastructure/security/bcrypt-password-hasher";

const setupInput = z.object({
  email: z.string().trim().email("Masukkan alamat email yang valid."),
  password: z.string().min(8, "Password minimal 8 karakter."),
});

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, setupInput);
  if (!parsed.ok) return parsed.response;

  try {
    const repository = new PrismaOwnerAccountRepository();
    await createOwnerAccount(parsed.data, { repository, hash: bcryptPasswordHasher.hash });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (
      error instanceof SetupAlreadyCompletedError ||
      (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
    ) {
      return NextResponse.json({ error: "Setup sudah selesai." }, { status: 409 });
    }
    throw error;
  }
}
