import NextAuth from 'next-auth';
import { FirestoreAdapter } from "@auth/firebase-adapter"
import { cert } from 'firebase-admin/app';
import CredentialsProvider from 'next-auth/providers/credentials';
import Google from "next-auth/providers/google"

const { privateKey } = process.env.AUTH_FIREBASE_PRIVATE_KEY ? JSON.parse(process.env.AUTH_FIREBASE_PRIVATE_KEY): "";

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
  adapter: FirestoreAdapter({
    credential: cert({
      projectId: process.env.AUTH_FIREBASE_PROJECT_ID,
      clientEmail: process.env.AUTH_FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey
    }),
  }),
};

export default NextAuth(authOptions);