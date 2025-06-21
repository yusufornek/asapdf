import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { sql } from "./db"

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = "7d"

export interface User {
  id: string
  email: string
  name: string
  plan: "free" | "pro" | "enterprise"
  filesProcessedToday: number
  eduVerified: boolean
  stripeCustomerId?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function generateToken(userId: string): Promise<string> {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}

export async function createUser(email: string, password: string, name: string): Promise<User> {
  const passwordHash = await hashPassword(password)

  const [user] = await sql`
    INSERT INTO users (email, password_hash, name)
    VALUES (${email}, ${passwordHash}, ${name})
    RETURNING id, email, name, plan, files_processed_today, edu_verified, stripe_customer_id
  `

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    filesProcessedToday: user.files_processed_today,
    eduVerified: user.edu_verified,
    stripeCustomerId: user.stripe_customer_id,
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const [user] = await sql`
    SELECT id, email, password_hash, name, plan, files_processed_today, edu_verified, stripe_customer_id
    FROM users 
    WHERE email = ${email}
  `

  if (!user) return null

  const isValid = await verifyPassword(password, user.password_hash)
  if (!isValid) return null

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    filesProcessedToday: user.files_processed_today,
    eduVerified: user.edu_verified,
    stripeCustomerId: user.stripe_customer_id,
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const [user] = await sql`
    SELECT id, email, name, plan, files_processed_today, edu_verified, stripe_customer_id
    FROM users 
    WHERE id = ${id}
  `

  if (!user) return null

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    filesProcessedToday: user.files_processed_today,
    eduVerified: user.edu_verified,
    stripeCustomerId: user.stripe_customer_id,
  }
}

export async function updateUserPlan(userId: string, plan: string): Promise<void> {
  await sql`
    UPDATE users 
    SET plan = ${plan}, updated_at = NOW()
    WHERE id = ${userId}
  `
}

export async function incrementFileCount(userId: string): Promise<void> {
  await sql`
    UPDATE users 
    SET files_processed_today = files_processed_today + 1,
        updated_at = NOW()
    WHERE id = ${userId}
  `
}

export async function resetDailyFileCount(): Promise<void> {
  await sql`
    UPDATE users 
    SET files_processed_today = 0,
        last_reset_date = CURRENT_DATE
    WHERE last_reset_date < CURRENT_DATE
  `
}
