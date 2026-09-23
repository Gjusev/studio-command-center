import { getUserWithPermissions } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'
import { getClassTypes } from '@/app/actions/classes'
import ClassTypesPageClient from './page-client'

export default async function ClassTypesPageWrapper() {
    const user = await getUserWithPermissions()
    if (user.role !== 'studioleiter' && !user.permissions.includes('classes.manage')) {
        redirect('/classes')
    }
    const types = await getClassTypes()
    return <ClassTypesPageClient initialTypes={types} />
}
