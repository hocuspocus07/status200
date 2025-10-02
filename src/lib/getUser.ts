import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret"

export function getUserFromToken(token?: string) {
  if (!token) return null
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string }
  } catch {
    return null
  }
}
