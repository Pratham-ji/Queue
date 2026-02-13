import { PrismaClient } from "@prisma/client";

// Create a single instance of Prisma Client to use everywhere
export const prisma = new PrismaClient();
