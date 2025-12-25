/**
 * Idempotent seed script to ensure required permission records exist in the permissions table.
 * Run with: node src/db/seeds/seed_permissions.js (from backend/)
 */
const pool = require('../connection');

const PERMISSIONS = [
  { code: 'users.view', name: 'View users', description: 'Allows viewing users' },
  { code: 'users.create', name: 'Create users', description: 'Allows creating users' },
  { code: 'users.update', name: 'Update users', description: 'Allows updating users' },
  { code: 'users.delete', name: 'Delete users', description: 'Allows deleting (soft-delete) users' },
  { code: 'departments.view', name: 'View departments', description: 'Allows viewing departments' },
  { code: 'departments.create', name: 'Create departments', description: 'Allows creating departments' },
  { code: 'departments.update', name: 'Update departments', description: 'Allows updating departments' },
  { code: 'departments.delete', name: 'Delete departments', description: 'Allows deleting departments' }
];

async function upsertPermissions() {
  try {
    for (const p of PERMISSIONS) {
      // Check exists by code
      const res = await pool.query('SELECT id FROM permissions WHERE code = $1 LIMIT 1', [p.code]);
      if (res.rowCount > 0) {
        console.log(`Permission exists: ${p.code}`);
        continue;
      }

      // Try insert. Use minimal columns to be safe across schemas.
      const insertQuery = `INSERT INTO permissions (name, code, description) VALUES ($1, $2, $3) RETURNING id`;
      try {
        const ins = await pool.query(insertQuery, [p.name, p.code, p.description || null]);
        console.log(`Inserted permission ${p.code} (id=${ins.rows[0].id})`);
      } catch (e) {
        console.warn(`Failed to insert permission ${p.code}:`, e.message);
      }
    }
  } catch (err) {
    console.error('Seed permissions failed:', err.message);
  } finally {
    // close pool
    try { await pool.end(); } catch (e) { /* ignore */ }
  }
}

if (require.main === module) {
  upsertPermissions().then(() => console.log('Permissions seed completed')).catch(() => process.exit(1));
}

module.exports = { PERMISSIONS };
