import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const emails_permitidos = [
  "gstvomourapd@gmail.com",
  "roksagain@gmail.com",
  "amigo3@email.com",
  "amigo4@email.com",
  "amigo5@email.com",
  "amigo6@email.com",
  "amigo7@email.com",
]

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return emails_permitidos.includes(user.email ?? "")
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }