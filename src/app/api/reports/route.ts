import { NextRequest, NextResponse } from 'next/server'
import {
    exportInventory, exportMembers, exportMachines,
    exportPayments, exportExpenses, exportTasks, exportEmployeePerformance,
} from '@/app/actions/export'

const EXPORT_TYPES: Record<string, (format: 'pdf' | 'excel') => Promise<{ buffer: string; filename: string; mimeType: string }>> = {
    inventory: exportInventory,
    members: exportMembers,
    machines: exportMachines,
    payments: exportPayments,
    expenses: exportExpenses,
    tasks: exportTasks,
    employees: exportEmployeePerformance,
}

export async function GET(request: NextRequest) {
    const sp = request.nextUrl.searchParams
    const type = sp.get('type')
    const format = (sp.get('format') || 'pdf') as 'pdf' | 'excel'

    if (!type || !EXPORT_TYPES[type]) {
        return NextResponse.json({ error: `Invalid type. Use: ${Object.keys(EXPORT_TYPES).join(', ')}` }, { status: 400 })
    }

    try {
        const result = await EXPORT_TYPES[type](format)
        const buffer = Buffer.from(result.buffer, 'base64')

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': result.mimeType,
                'Content-Disposition': `attachment; filename="${result.filename}"`,
                'Content-Length': buffer.length.toString(),
            },
        })
    } catch (error: any) {
        console.error('Export failed:', error)
        return NextResponse.json({ error: 'Export failed', details: error.message }, { status: 500 })
    }
}
