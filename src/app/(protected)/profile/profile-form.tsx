'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { updateUserProfile } from '@/app/actions/users'
import { changePassword } from '@/app/actions/profile'
import { toast } from 'sonner'

interface ProfileFormProps {
    user: {
        id: string
        displayName: string
        email: string
        role: 'studioleiter' | 'mitarbeiter'
        isActive: boolean
    }
}

export function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setErrors({})

        const formData = new FormData(e.currentTarget)
        const data = {
            displayName: formData.get('displayName') as string,
        }

        try {
            await updateUserProfile(data)
            toast.success('Profil aktualisiert')
            router.refresh()
        } catch (error: any) {
            setErrors({ form: error.message || 'Fehler beim Speichern' })
            toast.error('Fehler beim Speichern')
        } finally {
            setIsSubmitting(false)
        }
    }

    const getRoleBadge = () => {
        switch (user.role) {
            case 'studioleiter':
                return <Badge className="bg-primary text-primary-foreground">Studio Lead</Badge>
            case 'mitarbeiter':
                return <Badge variant="outline">Mitarbeiter</Badge>
            default:
                return <Badge>{user.role}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profil bearbeiten</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {errors.form && (
                            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
                                {errors.form}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={user.email} disabled className="bg-muted" />
                                <p className="text-xs text-muted-foreground">Die E-Mail-Adresse kann nicht geändert werden</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="displayName">Anzeigename *</Label>
                                <Input id="displayName" name="displayName" defaultValue={user.displayName} required />
                            </div>

                            <div className="space-y-2">
                                <Label>Rolle</Label>
                                <div className="flex items-center gap-2">{getRoleBadge()}</div>
                                <p className="text-xs text-muted-foreground">Ihre Rolle wird vom Studioleiter verwaltet</p>
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Wird gespeichert...' : 'Speichern'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">lock</span>
                        Passwort ändern
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChangePasswordForm />
                </CardContent>
            </Card>
        </div>
    )
}

function ChangePasswordForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast.error('Passwörter stimmen nicht überein')
            return
        }
        if (newPassword.length < 8) {
            toast.error('Passwort muss mindestens 8 Zeichen haben')
            return
        }
        setIsSubmitting(true)
        try {
            const result = await changePassword(currentPassword, newPassword)
            if (result.success) {
                toast.success('Passwort erfolgreich geändert')
                setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
            } else {
                toast.error(result.error || 'Fehler beim Ändern des Passworts')
            }
        } catch {
            toast.error('Fehler beim Ändern des Passworts')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Aktuelles Passwort *</Label>
                <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label>Neues Passwort *</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} />
            </div>
            <div className="space-y-2">
                <Label>Neues Passwort bestätigen *</Label>
                <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={8} />
            </div>
            <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Wird geändert...' : 'Passwort ändern'}
                </Button>
            </div>
        </form>
    )
}
