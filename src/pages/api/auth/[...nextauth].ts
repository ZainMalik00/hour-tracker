import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import Google from "next-auth/providers/google"

export const authOptions = {
  providers: [
    Google({
        clientId: process.env.AUTH_GOOGLE_ID ?? '',
        clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
      }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      credentials: { 
        email: { label: 'Email Address', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (credentials?.password !== 'password') {
          return null;
        }
        return {
          id: 'test',
          name: 'Test User',
          email: String(credentials?.email),
        };
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
  },
};

export default NextAuth(authOptions);