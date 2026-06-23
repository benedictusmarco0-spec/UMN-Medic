# Contoh Kode Environment Variables

## api/_db.js

```js
const { Pool } = require('pg');

let pool;

function requireEnv(key) {
  const value = process.env[key];
  if (!value || !String(value).trim()) {
    throw new Error(`${key} belum diatur di Vercel Environment Variables.`);
  }
  return String(value).trim();
}

function getPool() {
  const databaseUrl = requireEnv('DATABASE_URL');

  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('sslmode=disable') ? false : { rejectUnauthorized: false },
      max: Number(process.env.PG_POOL_MAX || 3),
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });
  }

  return pool;
}

module.exports = { getPool, requireEnv };
```

## api/health.js

```js
const { getPool } = require('./_db');

module.exports = async function handler(req, res) {
  try {
    const client = await getPool().connect();
    const result = await client.query('SELECT NOW() AS waktu_server');
    client.release();

    res.status(200).json({
      ok: true,
      database: true,
      waktu_server: result.rows[0].waktu_server,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      database: false,
      error: error.message,
    });
  }
};
```
