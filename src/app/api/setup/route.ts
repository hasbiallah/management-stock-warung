import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { SetupAlreadyCompletedError } from "@/application/owner-account/create-owner-account";
import { ownerAccountDependencies } from "@/presentation/owner-account/owner-account-dependencies";

const setupInput = z.object({
  email: z.string().trim().email("Masukkan alamat email yang valid."),
  password: z.string().min(8, "Password minimal 8 karakter."),
});

export async function POST(request: Request) {
  const input = setupInput.safeParse(await request.json());

  if (!input.success) {
    return NextResponse.json(
      { error: input.error.issues[0]?.message ?? "Data setup tidak valid." },
      { status: 400 },
    );
  }

  try {
    await ownerAccountDependencies.createOwnerAccount(input.data);
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
