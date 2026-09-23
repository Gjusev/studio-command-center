import { SimpleForm } from '@/components/forms/simple-form'
import { getSupplier, updateSupplier } from '@/app/actions/suppliers'
import { requireStudioleiter } from '@/lib/auth/guards'
import { notFound } from 'next/navigation'

export default async function EditSupplierPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    await requireStudioleiter()
    const { id } = await params

    const supplier = await getSupplier(id).catch(() => null)

    if (!supplier) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Lieferant bearbeiten</h1>
                <p className="text-muted-foreground">
                    {supplier.name} bearbeiten
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
                onSubmit={updateSupplier}
                id={id}
                submitLabel="Speichern"
                title="Lieferant bearbeiten"
                initialData={supplier}
            />
        </div>
    )
}
