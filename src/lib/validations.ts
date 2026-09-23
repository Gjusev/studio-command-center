import { z } from 'zod'

// Helper: optional string that accepts null, undefined, and empty string
const optionalString = z.string().nullable().optional().transform(v => v || undefined)

// Consumable validations
export const consumableSchema = z.object({
    name: z.string().min(1, 'Name ist erforderlich'),
    categoryId: optionalString,
    locationId: optionalString,
    supplierId: optionalString,
    unit: z.string().min(1, 'Einheit ist erforderlich'),
    stockCurrent: z.number().min(0, 'Bestand muss positiv sein'),
    stockMin: z.number().min(0, 'Mindestbestand muss positiv sein'),
    unitCost: z.number().nullable().optional(),
    expiresOn: optionalString,
    notes: optionalString,
})

export const movementSchema = z.object({
    consumableId: z.string().min(1, 'Verbrauchsmaterial ist erforderlich'),
    type: z.enum(['IN', 'OUT', 'ADJUST', 'WASTE']),
    quantity: z.number().min(0, 'Menge muss positiv sein'),
    reason: optionalString,
})

// Machine validations
export const machineSchema = z.object({
    name: z.string().min(1, 'Name ist erforderlich'),
    categoryId: optionalString,
    locationId: optionalString,
    brand: optionalString,
    model: optionalString,
    serialNo: optionalString,
    purchasedOn: optionalString,
    purchaseCost: z.number().nullable().optional(),
    status: z.enum(['IN_SERVICE', 'OUT_OF_SERVICE', 'MAINTENANCE']),
    lastServiceOn: optionalString,
    nextServiceOn: optionalString,
    notes: optionalString,
    photoUrl: optionalString,
})

export const machineEventSchema = z.object({
    machineId: z.string().min(1, 'Maschine ist erforderlich'),
    type: z.enum(['MAINTENANCE', 'INCIDENT', 'INSPECTION']),
    status: z.enum(['OPEN', 'CLOSED']).default('OPEN'),
    description: z.string().min(1, 'Beschreibung ist erforderlich'),
    cost: z.number().nullable().optional(),
    downtimeMinutes: z.number().nullable().optional(),
})

// Task validations
export const taskTemplateSchema = z.object({
    title: z.string().min(1, 'Titel ist erforderlich'),
    description: optionalString,
    frequency: optionalString,
    points: z.number().min(1, 'Punkte müssen positiv sein').default(1),
})

export const taskAssignmentSchema = z.object({
    taskTemplateId: z.string().min(1, 'Task Template ist erforderlich'),
    assignedToUserId: z.string().min(1, 'Mitarbeiter ist erforderlich'),
    dueDate: optionalString,
})

export const taskCompletionSchema = z.object({
    assignmentId: optionalString,
    taskTemplateId: z.string().min(1, 'Task Template ist erforderlich'),
    notes: optionalString,
})

// Category validations
export const categorySchema = z.object({
    name: z.string().min(1, 'Name ist erforderlich'),
    description: optionalString,
})

// Location validations
export const locationSchema = z.object({
    name: z.string().min(1, 'Name ist erforderlich'),
    description: optionalString,
})

// Supplier validations
export const supplierSchema = z.object({
    name: z.string().min(1, 'Name ist erforderlich'),
    contactPerson: optionalString,
    email: z.string().email('Ungültige E-Mail-Adresse').nullable().optional().or(z.literal('')),
    phone: optionalString,
    address: optionalString,
    notes: optionalString,
})

// Employee validations
export const employeeSchema = z.object({
    userId: optionalString,
    displayName: z.string().min(1, 'Name ist erforderlich'),
    role: z.enum(['studioleiter', 'mitarbeiter']),
})
