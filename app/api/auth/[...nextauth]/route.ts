import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const emails_permitidos = [
  "gstvomourapd@gmail.com",        // Gus
  "roksagain@gmail.com",     // troca pelos emails reais
]

const handler = NextAuth({
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
})

export { handler as GET, handler as POST }