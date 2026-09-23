import { NextRequest, NextResponse } from 'next/server'
import { claimInvitation } from '@/app/actions/users'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
    const session = await getSession()

    if (!session?.user) {
        return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })
    }

    const { token } = await request.json()

    if (!token) {
        return NextResponse.json({ error: 'Token erforderlich' }, { status: 400 })
    }

    try {
        const result = await claimInvitation(token, session.user.id)
        return NextResponse.json(result)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}
