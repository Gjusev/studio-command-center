'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEmployee } from '@/app/actions/employees'
import { cn } from '@/lib/utils'

export function NewEmployeeForm() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        setMessage(null)

        try {
            const result = await createEmployee(Object.fromEntries(formData))

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: result.message || 'Mitarbeiter erfolgreich erstellt!'
                })

                // Redirect after short delay
                setTimeout(() => {
                    router.push('/employees')
                }, 1500)
            }
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'Fehler beim Erstellen des Mitarbeiters.'
            })
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
                        <span className="material-symbols-outlined text-primary">person_add</span>
                        Mitarbeiter Details
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Geben Sie die Informationen für den neuen Mitarbeiter ein
                    </p>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-foreground text-sm font-medium mb-2">
                            Name <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="text"
                            name="displayName"
                            required
                            className="w-full bg-background border border-input text-foreground rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                            placeholder="z.B. Max Mustermann"
                        />
                    </div>

                    <div>
                        <label className="block text-foreground text-sm font-medium mb-2">
                            E-Mail-Adresse (Optional)
                            <span className="material-symbols-outlined text-xs ml-1 text-muted-foreground align-middle cursor-help" title="Wenn eine E-Mail angegeben wird, erhält der Mitarbeiter Zugang zum System">
                                info
                            </span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            className="w-full bg-background border border-input text-foreground rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                            placeholder="z.B. max.mustermann@studio.de"
                        />
                        <p className="text-sm text-muted-foreground mt-1.5">
                            💡 Mit E-Mail wird ein Konto erstellt und der Mitarbeiter zum Studio-Team hinzugefügt
                        </p>
                    </div>

                    <div>
                        <label className="block text-foreground text-sm font-medium mb-2">
                            Rolle <span className="text-destructive">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <RoleRadio
                                value="mitarbeiter"
                                label="Mitarbeiter"
                                description="Standardzugriff"
                                icon="badge"
                            />
                            <RoleRadio
                                value="studioleiter"
                                label="Studioleiter"
                                description="Voller Zugriff"
                                icon="shield_person"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-lg transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <span className="material-symbols-outlined animate-spin">refresh</span>
                            Erstellen...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">person_add</span>
                            Mitarbeiter erstellen
                        </>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground hover:bg-muted text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="material-symbols-outlined">cancel</span>
                    Abbrechen
                </button>
            </div>
        </form>
    )
}

function RoleRadio({ value, label, description, icon }: {
    value: string
    label: string
    description: string
    icon: string
}) {
    const [selected, setSelected] = useState('mitarbeiter')

    return (
        <label
            className={cn(
                "relative flex cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary/50",
                selected === value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background"
            )}
            onClick={() => setSelected(value)}
        >
            <input
                type="radio"
                name="role"
                value={value}
                defaultChecked={value === 'mitarbeiter'}
                className="sr-only"
            />
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-muted-foreground">{icon}</span>
                <div>
                    <span className="text-sm font-medium text-foreground block">{label}</span>
                    <span className="text-xs text-muted-foreground">{description}</span>
                </div>
            </div>
            {selected === value && (
                <div className="absolute top-2 right-2">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                </div>
            )}
        </label>
    )
}
