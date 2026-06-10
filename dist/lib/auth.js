"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authOptions = void 0;
const github_1 = __importDefault(require("next-auth/providers/github"));
const db_1 = require("@/lib/db");
const User_1 = __importDefault(require("@/models/User"));
exports.authOptions = {
    providers: [
        (0, github_1.default)({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
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
        async signIn({ user, account, profile }) {
            await (0, db_1.connectDB)();
            let dbUser = (profile === null || profile === void 0 ? void 0 : profile.id) ? await User_1.default.findOne({ githubId: profile.id }) : null;
            if (!dbUser) {
                dbUser = await User_1.default.findOne({ email: user.email });
            }
            if (dbUser) {
                dbUser.name = user.name;
                dbUser.email = user.email;
                dbUser.image = user.image;
                dbUser.githubId = (profile === null || profile === void 0 ? void 0 : profile.id) || dbUser.githubId;
                dbUser.githubAccessToken = (account === null || account === void 0 ? void 0 : account.access_token) || dbUser.githubAccessToken;
                await dbUser.save();
            }
            else {
                await User_1.default.create({
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    githubId: profile === null || profile === void 0 ? void 0 : profile.id,
                    githubAccessToken: account === null || account === void 0 ? void 0 : account.access_token,
                });
            }
            return true;
        },
        async jwt({ token, user }) {
            await (0, db_1.connectDB)();
            // On signin, use email to establish ID
            if (user) {
                const dbUser = await User_1.default.findOne({ email: user.email });
                if (dbUser)
                    token.id = dbUser._id.toString();
            }
            // Keep token synced with DB
            if (token.id) {
                const dbUser = await User_1.default.findById(token.id);
                if (dbUser) {
                    token.email = dbUser.email;
                    token.name = dbUser.name;
                    token.picture = dbUser.image;
                }
            }
            else if (token.email) {
                const dbUser = await User_1.default.findOne({ email: token.email });
                if (dbUser) {
                    token.id = dbUser._id.toString();
                    token.email = dbUser.email;
                    token.name = dbUser.name;
                    token.picture = dbUser.image;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token.id) {
                session.user.id = token.id;
                session.user.email = token.email;
                session.user.name = token.name;
                session.user.image = token.picture;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
