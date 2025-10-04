import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import { verifyMessage } from 'ethers/lib/utils'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: 'ethereum',
      name: 'Ethereum',
      credentials: {
        message: {
          label: 'Message',
          type: 'text',
          placeholder: '0x0',
        },
        signature: {
          label: 'Signature',
          type: 'text',
          placeholder: '0x0',
        },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.message || !credentials?.signature) {
            return null
          }

          const message = credentials.message
          const signature = credentials.signature

          // Extract address from message
          const addressMatch = message.match(/Address: (0x[a-fA-F0-9]{40})/)
          if (!addressMatch) {
            return null
          }

          const address = addressMatch[1]

          // Verify the signature
          const recoveredAddress = verifyMessage(message, signature)
          
          if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            return null
          }

          // Find or create user
          let user = await prisma.user.findUnique({
            where: { walletAddress: address.toLowerCase() }
          })

          if (!user) {
            user = await prisma.user.create({
              data: {
                walletAddress: address.toLowerCase(),
                name: `${address.slice(0, 6)}...${address.slice(-4)}`,
              }
            })
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            walletAddress: user.walletAddress,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.walletAddress = (user as any).walletAddress
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        ;(session.user as any).walletAddress = token.walletAddress
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}

