const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

if (!process.env.DATABASE_URL) {
    throw new Error("Missing required environment variable: DATABASE_URL");
}

const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DB_CONNECTION_LIMIT || 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

function toPostgresPlaceholders(sql) {
    let index = 0;
    return sql.replace(/\?/g, () => `$${++index}`).replace(/CURDATE\(\)/gi, "CURRENT_DATE");
}

// Compatibility wrapper: existing route code can continue using pool.query()
// while the underlying database is PostgreSQL.
const pool = {
    query: async (sql, params = []) => {
        const result = await pgPool.query(toPostgresPlaceholders(sql), params);
        const isReadQuery = /^\s*(SELECT|WITH|SHOW|EXPLAIN)\b/i.test(sql);

        if (isReadQuery) return [result.rows, result.fields];

        return [{
            affectedRows: result.rowCount,
            insertId: result.rows[0]?.id,
        }, result.fields];
    },
};

async function checkDatabaseConnection() {
    await pgPool.query("SELECT 1");
    console.log("Connected to Supabase PostgreSQL database");
}

module.exports = { pool, checkDatabaseConnection, pgPool };
