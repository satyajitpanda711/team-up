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

      let dbUser = profile?.id ? await User.findOne({ githubId: profile.id.toString() }) : null;
      if (!dbUser) {
        dbUser = await User.findOne({ email: user.email });
      }

      if (dbUser) {
        dbUser.name = user.name;
        dbUser.email = user.email;
        dbUser.image = user.image;
        dbUser.githubId = profile?.id?.toString() || dbUser.githubId;
        dbUser.githubAccessToken = account?.access_token || dbUser.githubAccessToken;
        await dbUser.save();
      } else {
        await User.create({
          name: user.name,
          email: user.email,
          image: user.image,
          githubId: profile?.id?.toString(),
          githubAccessToken: account?.access_token,
        });
      }

      return true;
    },

    async jwt({ token, user }) {
      await connectDB();
      
      // On signin, use email to establish ID
      if (user) {
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) token.id = dbUser._id.toString();
      }

      // Keep token synced with DB
      if (token.id) {
        const dbUser = await User.findById(token.id);
        if (dbUser) {
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      } else if (token.email) {
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }
      return token;
    },

    async session({ session, token } : { session: any; token: any }) {
      if (token.id) {
        session.user.id = token.id as string;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
