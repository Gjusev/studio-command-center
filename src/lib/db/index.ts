import postgres from 'postgres'

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined')
}

// Connection Pool Setup
const sql = postgres(process.env.DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
})

/**
 * Führt eine SQL Query mit prepared statement aus
 * Setzt search_path zu studio_manager vor jeder query
 */
export async function query<T = any>(
    queryText: string,
    params: any[] = []
): Promise<T[]> {
    const connection = await sql.reserve()

    try {
        // Set search_path para studio_manager
        await connection.unsafe(`SET search_path TO studio_manager, public`)
        const result = await connection.unsafe(queryText, params)
        return result as unknown as T[]
    } catch (error) {
        console.error('Database query error:', error)
        throw error
    } finally {
        connection.release()
    }
}

/**
 * Führt mehrere Queries in einer Transaktion aus
 */
export async function withTransaction<T>(
    callback: (tx: any) => Promise<T>
): Promise<T> {
    return await sql.begin(async (tx) => {
        // Set search_path al inicio de la transacción
        await tx.unsafe(`SET search_path TO studio_manager, public`)
        return await callback(tx)
    }) as Promise<T>
}

/**
 * Raw SQL für komplexere Queries
 */
export { sql }

export default sql
