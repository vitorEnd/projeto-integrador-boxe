import { Prisma } from "@prisma/client";

export function isDatabaseUnavailable(error: unknown) {
  return error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientKnownRequestError && ["P1000", "P1001", "P1002", "P1003", "P2021"].includes(error.code);
}

export const databaseMessage = "O banco MySQL não está pronto. No Windows, execute npm run setup:windows no terminal e tente novamente.";
