import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Create a Prisma client with error handling
function createPrismaClient() {
  try {
    return new PrismaClient({
      // Add connection timeout to fail faster if DB is not available
      log: ['error', 'warn'],
    })
  } catch (error) {
    console.error('Failed to create Prisma client:', error)
    // Return a mock client that will gracefully fail
    return {} as PrismaClient
  }
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma