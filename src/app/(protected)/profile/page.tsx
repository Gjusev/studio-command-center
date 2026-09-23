import { requireUser } from '@/lib/auth/guards'
import { ProfileForm } from './profile-form'

export default async function ProfilePage() {
    const user = await requireUser()

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Mein Profil</h1>
                <p className="text-muted-foreground">
                    Verwalten Sie Ihre Profilinformationen
                </p>
            </div>

            <ProfileForm user={user} />
        </div>
    )
}
