import GithubProvider from "next-auth/providers/github";

const INTERNAL_USERS = ["nociza"];

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }: any) {
      console.log(user, account, profile, email, credentials);
      if (INTERNAL_USERS.includes(profile.login)) {
        return true;
      } else {
        return false;
      }
    },
  },
};
