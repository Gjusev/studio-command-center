'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateUserSettings, resetUserSettings } from '@/app/actions/settings'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'
import { toast } from 'sonner'

interface SettingsFormProps {
    initialSettings: any
    studioInfo: any
    isStudioleiter?: boolean
}

export function SettingsForm({ initialSettings, studioInfo, isStudioleiter = false }: SettingsFormProps) {
    const router = useRouter()
    const { setTheme } = useTheme()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // State for form selections
    const [selectedTheme, setSelectedTheme] = useState(initialSettings.theme)
    const [selectedLanguage, setSelectedLanguage] = useState(initialSettings.language)
    const [selectedDateFormat, setSelectedDateFormat] = useState(initialSettings.defaultDateFormat)
    const [selectedTimeFormat, setSelectedTimeFormat] = useState(initialSettings.defaultTimeFormat)

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        setMessage(null)

        try {
            const result = await updateUserSettings(formData)

            if (result.success) {
                const newTheme = formData.get('theme') as 'light' | 'dark' | 'system'
                setTheme(newTheme)

                setMessage({ type: 'success', text: 'Einstellungen erfolgreich gespeichert!' })
                toast.success('Einstellungen gespeichert')
                router.refresh()
            }
        } catch (_error) {
            setMessage({ type: 'error', text: 'Fehler beim Speichern der Einstellungen.' })
            toast.error('Fehler beim Speichern')
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleReset() {
        if (!confirm('Möchten Sie wirklich alle Einstellungen zurücksetzen?')) {
            return
        }

        setIsSubmitting(true)
        setMessage(null)

        try {
            const result = await resetUserSettings()

            if (result.success) {
                setTheme('dark')
                setMessage({ type: 'success', text: 'Einstellungen zurückgesetzt!' })
                toast.success('Einstellungen zurückgesetzt')
                router.refresh()
            }
        } catch (_error) {
            setMessage({ type: 'error', text: 'Fehler beim Zurücksetzen.' })
            toast.error('Fehler beim Zurücksetzen')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            {message && (
                <div className={cn(
                    "p-4 rounded-xl border flex items-center gap-3",
                    message.type === 'success'
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-destructive/10 border-destructive/30 text-destructive"
                )}>
                    <span className="material-symbols-outlined">
                        {message.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <section className="rounded-xl border border-border overflow-hidden bg-card">
                <div className="p-6 border-b border-border">
                    <h2 className="text-foreground text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">palette</span>
                        Darstellung
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Passen Sie das Erscheinungsbild der Anwendung an
                    </p>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ThemeRadio
                            value="light"
                            label="Hell"
                            icon="light_mode"
                            selected={selectedTheme}
                            onSelect={(val) => {
                                setSelectedTheme(val)
                                setTheme(val as 'light' | 'dark' | 'system')
                            }}
                        />
                        <ThemeRadio
                            value="dark"
                            label="Dunkel"
                            icon="dark_mode"
                            selected={selectedTheme}
                            onSelect={(val) => {
                                setSelectedTheme(val)
                                setTheme(val as 'light' | 'dark' | 'system')
                            }}
                        />
                        <ThemeRadio
                            value="system"
                            label="System"
                            icon="desktop_windows"
                            selected={selectedTheme}
                            onSelect={(val) => {
                                setSelectedTheme(val)
                                setTheme(val as 'light' | 'dark' | 'system')
                            }}
                        />
                    </div>

                    <div>
                        <label className="block text-foreground text-sm font-medium mb-2">
                            Sprache
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <LanguageRadio
                                value="de"
                                label="Deutsch"
                                selected={selectedLanguage}
                                onSelect={setSelectedLanguage}
                            />
                            <LanguageRadio
                                value="en"
                                label="English"
                                selected={selectedLanguage}
                                onSelect={setSelectedLanguage}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-xl border border-border overflow-hidden bg-card">
                <div className="p-6 border-b border-border">
                    <h2 className="text-foreground text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">notifications</span>
                        Benachrichtigungen
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Wählen Sie aus, welche Benachrichtigungen Sie erhalten möchten
                    </p>
                </div>
                <div className="p-6 space-y-4">
                    <ToggleSwitch
                        name="emailNotifications"
                        label="E-Mail Benachrichtigungen"
                        description="Erhalten Sie Updates per E-Mail"
                        checked={initialSettings.emailNotifications}
                    />
                    <ToggleSwitch
                        name="pushNotifications"
                        label="Push Benachrichtigungen"
                        description="Browser Push Benachrichtigungen aktivieren"
                        checked={initialSettings.pushNotifications}
                    />
                    <ToggleSwitch
                        name="lowStockAlerts"
                        label="Niedriger Bestand Alarm"
                        description="Benachrichtigung bei niedrigem Bestand"
                        checked={initialSettings.lowStockAlerts}
                    />
                    <ToggleSwitch
                        name="maintenanceReminders"
                        label="Wartungserinnerungen"
                        description="Erinnerungen für anstehende Wartungen"
                        checked={initialSettings.maintenanceReminders}
                    />
                    <ToggleSwitch
                        name="taskReminders"
                        label="Aufgabenerinnerungen"
                        description="Erinnerungen für fällige Aufgaben"
                        checked={initialSettings.taskReminders}
                    />
                </div>
            </section>

            <section className="rounded-xl border border-border overflow-hidden bg-card">
                <div className="p-6 border-b border-border">
                    <h2 className="text-foreground text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">display_settings</span>
                        Anzeige
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Anzeigeeinstellungen und Formatierungen
                    </p>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-foreground text-sm font-medium mb-2">
                            Einträge pro Seite
                        </label>
                        <select
                            name="itemsPerPage"
                            defaultValue={initialSettings.itemsPerPage}
                            className="w-full md:w-64 bg-background border border-input text-foreground rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                        >
                            <option value="10">10 Einträge</option>
                            <option value="25">25 Einträge</option>
                            <option value="50">50 Einträge</option>
                            <option value="100">100 Einträge</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-foreground text-sm font-medium mb-2">
                            Standard Währung
                        </label>
                        <select
                            name="defaultCurrency"
                            defaultValue={initialSettings.defaultCurrency}
                            className="w-full md:w-64 bg-background border border-input text-foreground rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                        >
                            <option value="EUR">EUR (€)</option>
                            <option value="USD">USD ($)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="CHF">CHF (Fr)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-foreground text-sm font-medium mb-2">
                            Datumsformat
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            <DateFormatRadio
                                value="DD.MM.YYYY"
                                label="31.12.2024"
                                selected={selectedDateFormat}
                                onSelect={setSelectedDateFormat}
                            />
                            <DateFormatRadio
                                value="MM/DD/YYYY"
                                label="12/31/2024"
                                selected={selectedDateFormat}
                                onSelect={setSelectedDateFormat}
                            />
                            <DateFormatRadio
                                value="YYYY-MM-DD"
                                label="2024-12-31"
                                selected={selectedDateFormat}
                                onSelect={setSelectedDateFormat}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-foreground text-sm font-medium mb-2">
                            Zeitformat
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <TimeFormatRadio
                                value="24h"
                                label="24 Stunden (14:30)"
                                selected={selectedTimeFormat}
                                onSelect={setSelectedTimeFormat}
                            />
                            <TimeFormatRadio
                                value="12h"
                                label="12 Stunden (2:30 PM)"
                                selected={selectedTimeFormat}
                                onSelect={setSelectedTimeFormat}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-foreground text-sm font-medium mb-2">
                            Zeitzone
                        </label>
                        <select
                            name="timezone"
                            defaultValue={initialSettings.timezone}
                            className="w-full md:w-64 bg-background border border-input text-foreground rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                        >
                            <option value="Europe/Berlin">Europe/Berlin (GMT+1)</option>
                            <option value="Europe/London">Europe/London (GMT+0)</option>
                            <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                            <option value="Europe/Zurich">Europe/Zurich (GMT+1)</option>
                            <option value="America/New_York">America/New_York (GMT-5)</option>
                            <option value="America/Los_Angeles">America/Los_Angeles (GMT-8)</option>
                            <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                        </select>
                    </div>
                </div>
            </section>

            {studioInfo && (
                <StudioInfoSection studioInfo={studioInfo} isStudioleiter={isStudioleiter} />
            )}

            {/* Danger Zone */}
            <section className="rounded-xl border border-destructive/30 overflow-hidden bg-card">
                <div className="p-6 border-b border-destructive/20">
                    <h2 className="text-destructive text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined">warning</span>
                        Gefahrenbereich
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Irreversible Aktionen. Mit Vorsicht verwenden.
                    </p>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-foreground text-sm font-medium">Einstellungen zurücksetzen</p>
                            <p className="text-muted-foreground text-xs">Alle Einstellungen auf Standardwerte zurücksetzen</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-destructive/50 text-destructive hover:bg-destructive/10 text-sm font-medium rounded-lg transition-all disabled:opacity-50"
                        >
                            Zurücksetzen
                        </button>
                    </div>
                </div>
            </section>

            <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-lg transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <span className="material-symbols-outlined animate-spin">refresh</span>
                            Speichern...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">save</span>
                            Einstellungen speichern
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}

function ThemeRadio({ value, label, icon, selected, onSelect }: {
    value: string
    label: string
    icon: string
    selected: string
    onSelect: (value: string) => void
}) {
    return (
        <label
            className={cn(
                "relative flex cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary/50",
                selected === value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background"
            )}
            onClick={() => onSelect(value)}
        >
            <input type="radio" name="theme" value={value} checked={selected === value} className="sr-only" onChange={() => { }} />
            <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-2xl text-muted-foreground">{icon}</span>
                <span className="text-sm font-medium text-foreground">{label}</span>
            </div>
            {selected === value && (
                <div className="absolute top-2 right-2">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                </div>
            )}
        </label>
    )
}

function LanguageRadio({ value, label, selected, onSelect }: {
    value: string
    label: string
    selected: string
    onSelect: (value: string) => void
}) {
    return (
        <label
            className={cn(
                "relative flex cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary/50",
                selected === value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background"
            )}
            onClick={() => onSelect(value)}
        >
            <input type="radio" name="language" value={value} checked={selected === value} className="sr-only" onChange={() => { }} />
            <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-foreground">{value === 'de' ? 'DE' : 'EN'}</span>
                <span className="text-sm font-medium text-foreground">{label}</span>
            </div>
            {selected === value && (
                <div className="absolute top-2 right-2">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                </div>
            )}
        </label>
    )
}

function ToggleSwitch({ name, label, description, checked }: { name: string; label: string; description: string; checked: boolean }) {
    return (
        <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex-1">
                <span className="text-foreground text-sm font-medium block">{label}</span>
                <span className="text-muted-foreground text-xs">{description}</span>
            </div>
            <div className="relative">
                <input type="checkbox" name={name} value="true" defaultChecked={checked} className="sr-only peer" />
                <div className="block bg-background w-14 h-8 rounded-full border border-input group-hover:border-primary/50 transition-all peer-checked:bg-primary/20 peer-checked:border-primary/50"></div>
                <div className="absolute left-1 top-1 bg-muted-foreground w-6 h-6 rounded-full transition-all peer-checked:translate-x-6 peer-checked:bg-primary peer-checked:shadow-[0_0_8px_rgba(25,230,94,0.5)]"></div>
            </div>
        </label>
    )
}

function DateFormatRadio({ value, label, selected, onSelect }: {
    value: string
    label: string
    selected: string
    onSelect: (value: string) => void
}) {
    return (
        <label
            className={cn(
                "relative flex cursor-pointer rounded-lg border-2 p-3 transition-all hover:border-primary/50",
                selected === value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background"
            )}
            onClick={() => onSelect(value)}
        >
            <input type="radio" name="defaultDateFormat" value={value} checked={selected === value} className="sr-only" onChange={() => { }} />
            <span className="text-sm font-medium text-foreground">{label}</span>
            {selected === value && (
                <div className="absolute top-1 right-1">
                    <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                </div>
            )}
        </label>
    )
}

function TimeFormatRadio({ value, label, selected, onSelect }: {
    value: string
    label: string
    selected: string
    onSelect: (value: string) => void
}) {
    return (
        <label
            className={cn(
                "relative flex cursor-pointer rounded-lg border-2 p-3 transition-all hover:border-primary/50",
                selected === value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background"
            )}
            onClick={() => onSelect(value)}
        >
            <input type="radio" name="defaultTimeFormat" value={value} checked={selected === value} className="sr-only" onChange={() => { }} />
            <span className="text-sm font-medium text-foreground">{label}</span>
            {selected === value && (
                <div className="absolute top-1 right-1">
                    <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                </div>
            )}
        </label>
    )
}

function StudioInfoSection({ studioInfo, isStudioleiter }: { studioInfo: any; isStudioleiter: boolean }) {
    const router = useRouter()
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [name, setName] = useState(studioInfo.name || '')
    const [address, setAddress] = useState(studioInfo.address || '')
    const [phone, setPhone] = useState(studioInfo.phone || '')
    const [email, setEmail] = useState(studioInfo.email || '')

    async function handleSave() {
        setSaving(true)
        try {
            const { updateStudioInfo } = await import('@/app/actions/settings')
            await updateStudioInfo({ name, address, phone, email })
            setEditing(false)
            toast.success('Studio-Informationen gespeichert')
            router.refresh()
        } catch (error) {
            toast.error('Fehler beim Speichern')
        } finally {
            setSaving(false)
        }
    }

    return (
        <section className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-foreground text-lg font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">business</span>
                            Studio Informationen
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">
                            {isStudioleiter ? 'Bearbeiten Sie die Daten Ihres Studios' : 'Informationen zu Ihrem Studio'}
                        </p>
                    </div>
                    {isStudioleiter && !editing && (
                        <button
                            type="button"
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            Bearbeiten
                        </button>
                    )}
                </div>
            </div>
            <div className="p-6 space-y-4">
                {editing ? (
                    <>
                        <div>
                            <label className="block text-foreground text-sm font-medium mb-2">Studio Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-background border border-input text-foreground rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                                placeholder="Mein Fitness Studio"
                            />
                        </div>
                        <div>
                            <label className="block text-foreground text-sm font-medium mb-2">Adresse</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full bg-background border border-input text-foreground rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                                placeholder="Musterstraße 1, 12345 Berlin"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-foreground text-sm font-medium mb-2">Telefon</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-background border border-input text-foreground rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                                    placeholder="+49 123 456789"
                                />
                            </div>
                            <div>
                                <label className="block text-foreground text-sm font-medium mb-2">E-Mail</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-background border border-input text-foreground rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                                    placeholder="info@studio.de"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditing(false)
                                    setName(studioInfo.name || '')
                                    setAddress(studioInfo.address || '')
                                    setPhone(studioInfo.phone || '')
                                    setEmail(studioInfo.email || '')
                                }}
                                className="px-4 py-2 border border-border text-foreground hover:bg-muted text-sm font-medium rounded-lg transition-all"
                            >
                                Abbrechen
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving || !name.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-lg transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {saving ? (
                                    <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                                ) : (
                                    <span className="material-symbols-outlined text-[16px]">save</span>
                                )}
                                Speichern
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-muted-foreground">Studio Name</span>
                            <span className="text-foreground font-medium">{studioInfo.name}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-muted-foreground">Adresse</span>
                            <span className="text-foreground font-medium">{studioInfo.address || 'Nicht angegeben'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-muted-foreground">Telefon</span>
                            <span className="text-foreground font-medium">{studioInfo.phone || 'Nicht angegeben'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-muted-foreground">E-Mail</span>
                            <span className="text-foreground font-medium">{studioInfo.email || 'Nicht angegeben'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-muted-foreground">Mitglied seit</span>
                            <span className="text-foreground font-medium">
                                {new Date(studioInfo.created_at).toLocaleDateString('de-DE')}
                            </span>
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}
