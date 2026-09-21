import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { prisma } from "./prisma";
import { isDatabaseUnavailable } from "./database-error";

const cookieName = "boxing_session";
const lifetimeMs = 1000 * 60 * 60 * 24 * 7;

export async function getCurrentUser() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  try {
    const session = await prisma.session.findUnique({ where: { token }, include: { user: true } });
    if (!session || session.expiresAt <= new Date()) return null;
    return session.user;
  } catch (error) {
    if (isDatabaseUnavailable(error)) return null;
    throw error;
  }
}

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + lifetimeMs);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  (await cookies()).set(cookieName, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) await prisma.session.deleteMany({ where: { token } });
  jar.delete(cookieName);
}
