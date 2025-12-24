/**
 * Idempotent seed script to create a system admin user and assign all permissions.
 * Usage:
 *   ADMIN_PASSWORD="yourPass" node create_admin.js
 * or
 *   node create_admin.js yourPass
 *
 * NOTE: For security, avoid committing plain passwords. Prefer setting ADMIN_PASSWORD in your environment
 * before running this script. The script will hash the password with bcrypt and will not store the plain text.
 */

const pool = require('../connection');
const bcrypt = require('bcrypt');

async function run() {
  const args = process.argv.slice(2);
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || args[0];
  const roleName = process.env.ADMIN_ROLE || 'admin';

  if (!password) {
    console.error('ERROR: ADMIN_PASSWORD must be provided via env ADMIN_PASSWORD or as a command line argument.');
    process.exit(1);
  }

  const saltRounds = 10;
  const password_hash = await bcrypt.hash(password, saltRounds);

  try {
    await pool.query('BEGIN');

    // 1) Create user if not exists
    const userRes = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    let userId;
    if (userRes.rowCount > 0) {
      userId = userRes.rows[0].id;
      console.log(`User '${username}' already exists (id=${userId}). Updating password and ensuring active.`);
      await pool.query('UPDATE users SET password_hash = $1, is_active = true WHERE id = $2', [password_hash, userId]);
    } else {
      const insertUser = `
        INSERT INTO users (username, email, phone, password_hash, is_active, is_verified)
        VALUES ($1, $2, $3, $4, true, true)
        RETURNING id
      `;
      const ures = await pool.query(insertUser, [username, `${username}@example.local`, null, password_hash]);
      userId = ures.rows[0].id;
      console.log(`Created user '${username}' (id=${userId}).`);
    }

    // 2) Create role if not exists
    const roleRes = await pool.query('SELECT id FROM roles WHERE name = $1', [roleName]);
    let roleId;
    if (roleRes.rowCount > 0) {
      roleId = roleRes.rows[0].id;
      console.log(`Role '${roleName}' already exists (id=${roleId}).`);
    } else {
      const rres = await pool.query('INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING id', [roleName, 'System administrator role with all permissions']);
      roleId = rres.rows[0].id;
      console.log(`Created role '${roleName}' (id=${roleId}).`);
    }

    // 3) Assign all permissions to the role (idempotent)
    const permsRes = await pool.query('SELECT id FROM permissions');
    if (permsRes.rowCount === 0) {
      console.warn('No permissions found in table `permissions`. Make sure permissions are seeded first.');
    } else {
      for (const row of permsRes.rows) {
        const permId = row.id;
        await pool.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [roleId, permId]
        );
      }
      console.log(`Assigned ${permsRes.rowCount} permissions to role '${roleName}'.`);
    }

    // 4) Assign role to user (idempotent)
    await pool.query(
      `INSERT INTO user_roles (user_id, role_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [userId, roleId]
    );
    console.log(`Assigned role '${roleName}' to user '${username}'.`);

    await pool.query('COMMIT');
    console.log('Admin seed completed successfully.');
    process.exit(0);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Seed failed:', err.message || err);
    process.exit(2);
  }
}

if (require.main === module) {
  run();
}

module.exports = { run };
