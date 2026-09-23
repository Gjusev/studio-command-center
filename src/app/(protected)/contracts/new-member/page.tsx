'use client'

import { useState } from 'react'
import { createMember } from '@/app/actions/contracts'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function NewMemberPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        try {
            const result = await createMember({
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email') || undefined,
                phone: formData.get('phone') || undefined,
                dateOfBirth: formData.get('dateOfBirth') || undefined,
                address: formData.get('address') || undefined,
                notes: formData.get('notes') || undefined,
                emergencyContactName: formData.get('emergencyContactName') || undefined,
                emergencyContactPhone: formData.get('emergencyContactPhone') || undefined,
            })
            if (result.success) {
                toast.success('Mitglied erfolgreich erstellt')
                router.push('/contracts?tab=members')
            }
        } catch (error: any) {
            toast.error(error.message || 'Fehler beim Erstellen')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Neues Mitglied</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Vorname *</Label>
                                <Input id="firstName" name="firstName" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Nachname *</Label>
                                <Input id="lastName" name="lastName" required />
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-Mail <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                                <Input id="email" name="email" type="email" placeholder="name@studio.de" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefon <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                                <Input id="phone" name="phone" placeholder="+49 123 456789" />
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth">Geburtsdatum <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                                <Input id="dateOfBirth" name="dateOfBirth" type="date" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Adresse <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                                <Input id="address" name="address" placeholder="Straße, PLZ Stadt" />
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="emergencyContactName">Notfallkontakt Name <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                                <Input id="emergencyContactName" name="emergencyContactName" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emergencyContactPhone">Notfallkontakt Telefon <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                                <Input id="emergencyContactPhone" name="emergencyContactPhone" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notizen <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                            <Textarea id="notes" name="notes" rows={3} placeholder="Besondere Hinweise..." />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => router.back()}>Abbrechen</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Wird erstellt...' : 'Mitglied erstellen'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
