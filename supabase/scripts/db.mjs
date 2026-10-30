import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

import { dbConfig } from './db-config.mjs';

const MIGRATIONS_DIR = path.join(import.meta.dirname, '..', 'migrations');

async function main() {
  const command = process.argv[2] ?? 'status';
  const client = new pg.Client(dbConfig());
  await client.connect();
  try {
    await client.query(`
      create schema if not exists ops;
      create table if not exists ops.applied_migrations (
        name text primary key,
        applied_at timestamptz not null default now()
      );
    `);
    const applied = new Set(
      (await client.query('select name from ops.applied_migrations')).rows.map((r) => r.name),
    );
    const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();
    const pending = files.filter((f) => !applied.has(f));

    if (command === 'status') {
      for (const f of files) console.log(`${applied.has(f) ? 'applied' : 'pending'}  ${f}`);
      return;
    }
    if (command !== 'migrate') throw new Error(`Unknown command "${command}"`);

    if (pending.length === 0) console.log('Nothing to apply.');
    for (const f of pending) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8');
      await client.query('begin');
      try {
        await client.query(sql);
        await client.query('insert into ops.applied_migrations (name) values ($1)', [f]);
        await client.query('commit');
        console.log(`applied  ${f}`);
      } catch (err) {
        await client.query('rollback');
        throw new Error(`${f} failed: ${err.message}`);
      }
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
