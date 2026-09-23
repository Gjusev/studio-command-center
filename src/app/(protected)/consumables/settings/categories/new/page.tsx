import { SimpleForm } from '@/components/forms/simple-form'
import { createCategory } from '@/app/actions/categories'
import { requireStudioleiter } from '@/lib/auth/guards'

export default async function NewCategoryPage() {
    await requireStudioleiter()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Neue Kategorie</h1>
                <p className="text-muted-foreground">
                    Eine neue Kategorie erstellen
                </p>
            </div>

            <SimpleForm
                fields={[
                    { name: 'name', label: 'Name', required: true },
                    { name: 'description', label: 'Beschreibung', type: 'textarea' },
                ]}
                onSubmit={createCategory}
                submitLabel="Erstellen"
                title="Neue Kategorie"
            />
        </div>
    )
}
