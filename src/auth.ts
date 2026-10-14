import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import bcrypt from 'bcryptjs';
import clientPromise, { getMongoDatabase } from '@/lib/mongodb';
import { findUserByEmail } from '@/lib/users';

const googleClientId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? '';
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? '';

type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  phone?: string;
  company?: string;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    newUser: '/dashboard',
  },
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Record<string, unknown> | undefined) {
        const email = String(credentials?.email ?? '').trim().toLowerCase();
        const password = String(credentials?.password ?? '');

        if (!email || !password) {
          return null;
        }

        const user = await findUserByEmail(email);

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role ?? 'user',
          phone: user.phone ?? '',
          company: user.company ?? '',
        } satisfies AuthUser;
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== 'google') {
        return true;
      }

      return profile?.email_verified === true && typeof profile.email === 'string';
    },
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as AuthUser;
        token.id = authUser.id;
        token.name = authUser.name;
        token.email = authUser.email;
        token.picture = authUser.image;
        token.role = authUser.role ?? 'user';
        token.company = authUser.company ?? '';
        token.phone = authUser.phone ?? '';

        if (authUser.email) {
          const databaseUser = await findUserByEmail(authUser.email);
          token.role = databaseUser?.role ?? token.role;
          token.company = databaseUser?.company ?? token.company;
          token.phone = databaseUser?.phone ?? token.phone;
        }
      }

      return token;
    },
    async session({ session, token }) {
      const sessionUser = session.user as typeof session.user & {
        id?: string;
        role?: string;
        company?: string;
        phone?: string;
      };

      if (sessionUser) {
        sessionUser.id = token.id as string;
        sessionUser.image = token.picture as string | null;
        sessionUser.role = token.role as string;
        sessionUser.company = token.company as string;
        sessionUser.phone = token.phone as string;
      }

      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return;
      }

      const updates: Record<string, string | Date> = {
        lastLogin: new Date(),
      };

      if (account?.provider === 'google') {
        updates.googleId = account.providerAccountId;
        updates.provider = 'google';
        if (typeof profile?.name === 'string') {
          updates.name = profile.name;
        }
        if (typeof profile?.picture === 'string') {
          updates.picture = profile.picture;
        }
      }

      const database = await getMongoDatabase();
      await database.collection('users').updateOne(
        { email: user.email.trim().toLowerCase() },
        { $set: updates },
      );
    },
  },
  trustHost: true,
});
