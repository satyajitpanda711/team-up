import GitHubProvider from "next-auth/providers/github";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account, profile } : { user: any; account: any; profile?: any }) {
      await connectDB();

      await User.findOneAndUpdate(
        { email: user.email },
        {
          name: user.name,
          email: user.email,
          image: user.image,
          githubId: profile?.id,
          githubAccessToken: account?.access_token,
        },
        { upsert: true, new: true }
      );

      return true;
    },

    async jwt({ token }) {
      await connectDB();
      const dbUser = await User.findOne({ email: token.email });
      if (dbUser) {
        token.id = dbUser._id.toString();
      }
      return token;
    },

    async session({ session, token } : { session: any; token: any }) {
      session.user.id = token.id as string;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
