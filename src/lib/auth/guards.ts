import { getSession } from "@/lib/auth"
import { query } from "@/lib/db"
import { redirect } from "next/navigation"
import type { UserRole, Permission } from "@/lib/auth/types"

export type { UserRole, Permission }

export const PERMISSION_LABELS: Record<Permission, string> = {
  "consumables.create": "Inventar erstellen",
  "consumables.edit": "Inventar bearbeiten",
  "consumables.delete": "Inventar löschen",
  "machines.create": "Maschinen erstellen",
  "machines.edit": "Maschinen bearbeiten",
  "machines.delete": "Maschinen löschen",
  "tasks.assign": "Aufgaben zuweisen",
  "tasks.manage_templates": "Aufgabenvorlagen verwalten",
  "employees.view": "Team einsehen",
  "classes.manage": "Kurse verwalten",
  "contracts.manage": "Mitglieder verwalten",
  "finances.view": "Finanzen einsehen",
  "reports.view": "Berichte einsehen",
  "settings.manage": "Einstellungen verwalten",
}

export const PERMISSION_GROUPS: { label: string; permissions: Permission[] }[] = [
  { label: "Inventar", permissions: ["consumables.create", "consumables.edit", "consumables.delete"] },
  { label: "Maschinen", permissions: ["machines.create", "machines.edit", "machines.delete"] },
  { label: "Aufgaben", permissions: ["tasks.assign", "tasks.manage_templates"] },
  { label: "Team", permissions: ["employees.view"] },
  { label: "Kurse", permissions: ["classes.manage"] },
  { label: "Mitglieder", permissions: ["contracts.manage"] },
  { label: "Finanzen", permissions: ["finances.view"] },
  { label: "Berichte", permissions: ["reports.view"] },
  { label: "Einstellungen", permissions: ["settings.manage"] },
]

export interface AuthUser {
  id: string
  studioId: string
  email: string
  displayName: string
  role: UserRole
  isActive: boolean
}

/**
 * Sincroniza automáticamente el usuario desde Better Auth a la base de datos local
 */
async function syncUserToDatabase(authUser: {
  id: string
  email: string
  name: string | null
}): Promise<AuthUser> {
  const email = authUser.email || "unknown@example.com"
  const displayName = authUser.name || "Usuario"

  try {
    // Verificar si ya existe un studio, si no, crear uno por defecto
    const studios = await query<{ id: string }>(
      `SELECT id FROM studio_manager.studios ORDER BY created_at ASC LIMIT 1`
    )

    let studioId: string

    if (studios.length === 0) {
      const newStudios = await query<{ id: string }>(
        `INSERT INTO studio_manager.studios (name, address) VALUES ($1, $2) RETURNING id`,
        ["Studio Principal", "Dirección por defecto"]
      )
      studioId = newStudios[0].id
    } else {
      studioId = studios[0].id
    }

    // Si es el primer usuario, hacerlo studioleiter
    const existingUsers = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM studio_manager.users`
    )
    const isFirstUser = existingUsers[0].count === "0"
    const role = isFirstUser ? "studioleiter" : "mitarbeiter"

    // Crear el usuario en la base de datos studio_manager
    await query(
      `INSERT INTO studio_manager.users (id, studio_id, display_name, role, is_active)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (id) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         is_active = true`,
      [authUser.id, studioId, displayName, role]
    )

    // Crear registro en employees si no existe
    await query(
      `INSERT INTO studio_manager.employees (studio_id, user_id, display_name, role, is_active)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (user_id) DO NOTHING`,
      [studioId, authUser.id, displayName, role]
    )

    return {
      id: authUser.id,
      studioId,
      email,
      displayName,
      role,
      isActive: true,
    }
  } catch (error) {
    console.error("Error syncing user:", error)
    throw new Error("Failed to sync user to database")
  }
}

/**
 * Obtiene el usuario autenticado actual, lanza error si no está autenticado
 */
export async function requireUser(): Promise<AuthUser> {
  const session = await getSession()

  if (!session?.user) {
    redirect("/signin")
  }

  // Obtener datos del usuario desde nuestra base de datos
  const dbUsers = await query<AuthUser>(
    `SELECT
      u.id,
      u.studio_id as "studioId",
      au.email,
      u.display_name as "displayName",
      u.role,
      u.is_active as "isActive"
    FROM studio_manager.users u
    JOIN studio_manager."user" au ON au.id = u.id
    WHERE u.id = $1 AND u.is_active = true`,
    [session.user.id]
  )

  // Si no existe en la base de datos, sincronizarlo automáticamente
  if (dbUsers.length === 0) {
    return await syncUserToDatabase(session.user)
  }

  return dbUsers[0]
}

/**
 * Verifica si el usuario tiene el rol requerido
 */
export async function requireRole(requiredRole: UserRole): Promise<AuthUser> {
  const user = await requireUser()

  if (user.role !== requiredRole) {
    throw new Error(`Access denied. Required role: ${requiredRole}`)
  }

  return user
}

/**
 * Verifica si el usuario es Studioleiter
 */
export async function requireStudioleiter(): Promise<AuthUser> {
  return await requireRole("studioleiter")
}

/**
 * Verifica que un usuario pertenezca a un estudio específico
 */
export async function requireStudioScope(studioId?: string): Promise<string> {
  const user = await requireUser()

  if (studioId && user.studioId !== studioId) {
    throw new Error("Access denied. Studio scope violation.")
  }

  return user.studioId
}

/**
 * Obtiene studio_id para el usuario actual
 */
export async function getStudioId(): Promise<string> {
  return await requireStudioScope()
}

/**
 * Obtiene el usuario sin redirect (para API Routes)
 */
export async function getUser(): Promise<AuthUser | null> {
  try {
    const session = await getSession()

    if (!session?.user) {
      return null
    }

    const dbUsers = await query<AuthUser>(
      `SELECT
        u.id,
        u.studio_id as "studioId",
        au.email,
        u.display_name as "displayName",
        u.role,
        u.is_active as "isActive"
      FROM studio_manager.users u
      JOIN studio_manager."user" au ON au.id = u.id
      WHERE u.id = $1 AND u.is_active = true`,
      [session.user.id]
    )

    return dbUsers.length > 0 ? dbUsers[0] : null
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

/**
 * Obtiene los permisos de un usuario
 */
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  const results = await query<{ permission: Permission }>(
    `SELECT permission FROM employee_permissions WHERE user_id = $1`,
    [userId]
  )
  return results.map(r => r.permission)
}

/**
 * Verifica si el usuario tiene un permiso específico.
 * Studioleiter tiene todos los permisos automáticamente.
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  const user = await requireUser()
  if (user.role === 'studioleiter') return true
  const permissions = await getUserPermissions(user.id)
  return permissions.includes(permission)
}

/**
 * Obtiene los permisos del usuario actual y su información completa
 */
export async function getUserWithPermissions(): Promise<AuthUser & { permissions: Permission[] }> {
  const user = await requireUser()
  const permissions = user.role === 'studioleiter'
    ? Object.keys(PERMISSION_LABELS) as Permission[]
    : await getUserPermissions(user.id)
  return { ...user, permissions }
}
