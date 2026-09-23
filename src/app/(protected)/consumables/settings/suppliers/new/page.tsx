import { SimpleForm } from '@/components/forms/simple-form'
import { createSupplier } from '@/app/actions/suppliers'
import { requireStudioleiter } from '@/lib/auth/guards'

export default async function NewSupplierPage() {
    await requireStudioleiter()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Neuer Lieferant</h1>
                <p className="text-muted-foreground">
                    Einen neuen Lieferanten erstellen
                </p>
            </div>

            <SimpleForm
                fields={[
                    { name: 'name', label: 'Name', required: true },
                    { name: 'contactPerson', label: 'Kontaktperson' },
                    { name: 'email', label: 'Email', type: 'email' },
                    { name: 'phone', label: 'Telefon' },
                    { name: 'address', label: 'Adresse', type: 'textarea' },
                    { name: 'notes', label: 'Notizen', type: 'textarea' },
                ]}
                onSubmit={createSupplier}
                submitLabel="Erstellen"
                title="Neuer Lieferant"
            />
        </div>
    )
}
