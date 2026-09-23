import { NextRequest, NextResponse } from 'next/server'
import { validateInvitation } from '@/app/actions/users'

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
        return NextResponse.json({ error: 'Token erforderlich' }, { status: 400 })
    }

    const invitation = await validateInvitation(token)

    if (!invitation) {
        return NextResponse.json({ error: 'Einladung ist ungültig oder abgelaufen' }, { status: 404 })
    }

    return NextResponse.json({
        displayName: invitation.display_name,
        role: invitation.role,
        studioName: invitation.studio_name,
    })
}
