import { getUserWithPermissions } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'
import { getClassTypes } from '@/app/actions/classes'
import { getEmployees } from '@/app/actions/employees'
import { getLocations } from '@/app/actions/locations'
import NewClassPageClient from './page-client'

export default async function NewClassPageWrapper() {
    const user = await getUserWithPermissions()
    if (user.role !== 'studioleiter' && !user.permissions.includes('classes.manage')) {
        redirect('/classes')
    }
    const [classTypes, employees, locations] = await Promise.all([
        getClassTypes(),
        getEmployees(),
        getLocations(),
    ])

    return (
        <NewClassPageClient
            classTypes={classTypes.map(ct => ({ id: ct.id, name: ct.name, durationMinutes: ct.durationMinutes, maxCapacity: ct.maxCapacity }))}
            employees={employees.map(e => ({ id: e.id, displayName: e.displayName || 'Unbekannt' }))}
            locations={locations.map(l => ({ id: l.id, name: l.name }))}
        />
    )
}
