import { SimpleForm } from '@/components/forms/simple-form'
import { getCategory, updateCategory } from '@/app/actions/categories'
import { requireStudioleiter } from '@/lib/auth/guards'
import { notFound } from 'next/navigation'

export default async function EditCategoryPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    await requireStudioleiter()
    const { id } = await params

    const category = await getCategory(id).catch(() => null)

    if (!category) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Kategorie bearbeiten</h1>
                <p className="text-muted-foreground">
                    {category.name} bearbeiten
                </p>
            </div>

            <SimpleForm
                fields={[
                    { name: 'name', label: 'Name', required: true },
                    { name: 'description', label: 'Beschreibung', type: 'textarea' },
                ]}
                onSubmit={updateCategory}
                id={id}
                submitLabel="Speichern"
                title="Kategorie bearbeiten"
                initialData={category}
            />
        </div>
    )
}
