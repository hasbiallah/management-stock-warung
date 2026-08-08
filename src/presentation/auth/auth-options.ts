import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import type { OwnerAccount } from "@/domain/owner-account/owner-account-repository";

type Dependencies = {
  authenticate(input: { email: string; password: string }): Promise<OwnerAccount | null>;
};

export function createAuthOptions({ authenticate }: Dependencies): NextAuthOptions {
  return {
    providers: [
      CredentialsProvider({
        name: "Pemilik Warung",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials.password) {
            return null;
          }

          const owner = await authenticate(credentials);

          return owner ? { id: owner.id, email: owner.email } : null;
        },
      }),
    ],
    session: {
      strategy: "jwt",
      maxAge: 60 * 60 * 24 * 30,
    },
    pages: {
      signIn: "/login",
    },
  };
}
