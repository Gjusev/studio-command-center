import { getCategories, getLocations, getSuppliers } from '@/app/actions'
import { getUserWithPermissions } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Package, MapPin, Truck, Plus, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

async function deleteItem(type: string, id: string) {
    'use server'
    const { deleteCategory } = await import('@/app/actions/categories')
    const { deleteLocation } = await import('@/app/actions/locations')
    const { deleteSupplier } = await import('@/app/actions/suppliers')

    if (type === 'category') await deleteCategory(id)
    if (type === 'location') await deleteLocation(id)
    if (type === 'supplier') await deleteSupplier(id)

    revalidatePath('/consumables/settings')
}

export default async function ConsumablesSettingsPage() {
    const user = await getUserWithPermissions()
    const canEdit = user.role === 'studioleiter' || user.permissions.includes('consumables.edit')
    const canDelete = user.role === 'studioleiter' || user.permissions.includes('consumables.delete')
    if (!canEdit && !canDelete) {
        redirect('/consumables')
    }

    const [categories, locations, suppliers] = await Promise.all([
        getCategories(),
        getLocations(),
        getSuppliers(),
    ])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Verbrauchsmaterialien Einstellungen</h1>
                <p className="text-muted-foreground">
                    Kategorien, Standorte und Lieferanten verwalten
                </p>
            </div>

            {/* Kategorien */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Kategorien
                        </CardTitle>
                        {canEdit && (
                            <Button size="sm" asChild>
                                <Link href="/consumables/settings/categories/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Neue Kategorie
                                </Link>
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Beschreibung</TableHead>
                                    <TableHead className="w-[100px]">Aktionen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                                            Keine Kategorien gefunden
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categories.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell>{category.description || '-'}</TableCell>
                                            <TableCell>
                                                {canEdit && (
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="ghost" asChild>
                                                            <Link href={`/consumables/settings/categories/${category.id}/edit`}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <form action={deleteItem.bind(null, 'category', category.id)}>
                                                            <Button size="sm" variant="ghost" type="submit">
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </form>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Standorte */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Standorte
                        </CardTitle>
                        {canEdit && (
                            <Button size="sm" asChild>
                                <Link href="/consumables/settings/locations/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Neuer Standort
                                </Link>
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Beschreibung</TableHead>
                                    <TableHead className="w-[100px]">Aktionen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {locations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                                            Keine Standorte gefunden
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    locations.map((location) => (
                                        <TableRow key={location.id}>
                                            <TableCell className="font-medium">{location.name}</TableCell>
                                            <TableCell>{location.description || '-'}</TableCell>
                                            <TableCell>
                                                {canEdit && (
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="ghost" asChild>
                                                            <Link href={`/consumables/settings/locations/${location.id}/edit`}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <form action={deleteItem.bind(null, 'location', location.id)}>
                                                            <Button size="sm" variant="ghost" type="submit">
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </form>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Lieferanten */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Lieferanten
                        </CardTitle>
                        {canEdit && (
                            <Button size="sm" asChild>
                                <Link href="/consumables/settings/suppliers/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Neuer Lieferant
                                </Link>
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Kontakt</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="w-[100px]">Aktionen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {suppliers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            Keine Lieferanten gefunden
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    suppliers.map((supplier) => (
                                        <TableRow key={supplier.id}>
                                            <TableCell className="font-medium">{supplier.name}</TableCell>
                                            <TableCell>{supplier.contactPerson || '-'}</TableCell>
                                            <TableCell>{supplier.email || '-'}</TableCell>
                                            <TableCell>
                                                {canEdit && (
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="ghost" asChild>
                                                            <Link href={`/consumables/settings/suppliers/${supplier.id}/edit`}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <form action={deleteItem.bind(null, 'supplier', supplier.id)}>
                                                            <Button size="sm" variant="ghost" type="submit">
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </form>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
