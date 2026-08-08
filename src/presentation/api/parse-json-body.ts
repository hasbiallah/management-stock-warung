import { NextResponse } from "next/server";
import type { ZodIssue, ZodSchema } from "zod";

type ParseResult<T> = { ok: true; data: T } | { ok: false; response: NextResponse };

export async function parseJsonBody<T>(request: Request, schema: ZodSchema<T>): Promise<ParseResult<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { ok: false, response: NextResponse.json({ error: "Body tidak valid." }, { status: 400 }) };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, response: validationErrorResponse(parsed.error.issues) };
  }
  return { ok: true, data: parsed.data };
}

export function validationErrorResponse(issues: ZodIssue[]): NextResponse {
  return NextResponse.json(
    { error: issues[0]?.message ?? "Data tidak valid." },
    { status: 400 },
  );
}
