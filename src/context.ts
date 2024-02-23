import { PrismaClient } from '@prisma/client';

export type ContextValue = {
  prisma: PrismaClient,
};

const prisma = new PrismaClient();

export function createContext(): ContextValue {
  return { prisma };
}
