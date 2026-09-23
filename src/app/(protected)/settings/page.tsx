import { getUserWithPermissions } from '@/lib/auth/guards'
import { getUserSettings, getStudioInfo } from '@/app/actions/settings'
import { SettingsForm } from './settings-form'

export default async function SettingsPage() {
    const user = await getUserWithPermissions()
    const isStudioleiter = user.role === 'studioleiter'

    const [settings, studioInfo] = await Promise.all([
        getUserSettings(),
        getStudioInfo(),
    ])

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-wrap justify-between gap-3">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1">
                        <span className="material-symbols-outlined text-sm">settings</span>
                        <span>System</span>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                        <span className="text-foreground">Einstellungen</span>
                    </div>
                    <h1 className="text-foreground text-4xl font-black leading-tight tracking-tight">
                        Einstellungen
                    </h1>
                    <p className="text-muted-foreground text-base max-w-2xl">
                        Verwalten Sie Ihre bevorzugten Einstellungen für die Anwendung
                    </p>
                </div>
            </div>

            <SettingsForm
                initialSettings={settings}
                studioInfo={studioInfo}
                isStudioleiter={isStudioleiter}
            />
        </div>
    )
}
