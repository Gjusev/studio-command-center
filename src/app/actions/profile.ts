'use server'

import { auth } from '@/lib/auth'
import { headers as nextHeaders } from 'next/headers'

export async function changePassword(currentPassword: string, newPassword: string) {
    try {
        const hdrs = await nextHeaders()
        const session = await auth.api.getSession({ headers: hdrs })
        if (!session?.user) {
            return { success: false, error: 'Nicht angemeldet' }
        }

        await auth.api.changePassword({
            headers: hdrs,
            body: {
                currentPassword,
                newPassword,
            },
        })

        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || 'Fehler beim Ändern des Passworts' }
    }
}
