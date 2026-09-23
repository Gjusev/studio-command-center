import "server-only"
import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { admin, organization } from "better-auth/plugins"
import { headers as nextHeaders } from "next/headers"
import { Pool } from "pg"
import { query } from "@/lib/db"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not defined")
}

const authPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 10000,
})

authPool.on('connect', (client) => {
  client.query('SET search_path TO studio_manager, public')
})

export const auth = betterAuth({
  appName: "Studio Command Center",
  database: authPool,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: false,
      membershipLimit: 50,
    }),
    admin(),
    nextCookies(),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "mitarbeiter",
        input: false,
      },
      studioId: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
})

export type AuthUser = typeof auth.$Infer.Session["user"]
export type AuthSession = typeof auth.$Infer.Session

export async function getSession() {
  const hdrs = await nextHeaders()
  return await auth.api.getSession({ headers: hdrs })
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user ?? null
}

export async function ensureUserInStudio(
  authUser: { id: string; email: string; name: string | null | undefined },
  role: "studioleiter" | "mitarbeiter" = "mitarbeiter"
) {
  const existing = await query(
    `SELECT id, studio_id FROM studio_manager.users WHERE id = $1`,
    [authUser.id]
  )

  if (existing.length > 0) {
    return existing[0]
  }

  const studios = await query<{ id: string }>(
    `SELECT id FROM studio_manager.studios ORDER BY created_at ASC LIMIT 1`
  )

  let studioId: string
  if (studios.length === 0) {
    const newStudio = await query<{ id: string }>(
      `INSERT INTO studio_manager.studios (name, address) VALUES ($1, $2) RETURNING id`,
      ["Studio Principal", "Dirección por defecto"]
    )
    studioId = newStudio[0].id
  } else {
    studioId = studios[0].id
  }

  const isFirstUser =
    (
      await query<{ count: string }>(
        `SELECT COUNT(*) as count FROM studio_manager.users`
      )
    )[0]?.count === "0"

  const userRole = isFirstUser ? "studioleiter" : role

  await query(
    `INSERT INTO studio_manager.users (id, studio_id, display_name, role, is_active)
     VALUES ($1, $2, $3, $4, $5, true)
     ON CONFLICT (id) DO NOTHING`,
    [authUser.id, studioId, authUser.email, authUser.name || "Usuario", userRole]
  )

  return { id: authUser.id, studio_id: studioId }
}
