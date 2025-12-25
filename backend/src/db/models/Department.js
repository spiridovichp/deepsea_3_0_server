/**
 * Модель для работы с отделами
 */
const pool = require('../connection');

class Department {
  static async findNameById(id) {
    if (!id) return null;
    const res = await pool.query('SELECT name FROM department WHERE id = $1', [id]);
    return res.rows[0] ? res.rows[0].name : null;
  }

  static async list() {
    const res = await pool.query('SELECT id, name FROM department ORDER BY id ASC');
    return res.rows;
  }

  static async create(name) {
    const res = await pool.query('INSERT INTO department (name) VALUES ($1) RETURNING id, name', [name]);
    return res.rows[0];
  }

  static async update(id, fields) {
    const allowed = ['name', 'description', 'manager_id'];
    const sets = [];
    const params = [];
    let idx = 1;
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(fields, key)) {
        sets.push(`${key} = $${idx}`);
        params.push(fields[key]);
        idx++;
      }
    }
    if (sets.length === 0) {
      const res = await pool.query('SELECT id, name, description, manager_id, created_at, updated_at FROM department WHERE id = $1', [id]);
      return res.rows[0] || null;
    }
    params.push(id);
    const query = `UPDATE department SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING id, name, description, manager_id, created_at, updated_at`;
    const res = await pool.query(query, params);
    return res.rows[0] || null;
  }

  static async softDelete(id) {
    // Mark department as inactive (if table has is_active) or delete flag; fallback to deleting row if no such column
    try {
      // try is_active column
      const res = await pool.query("UPDATE department SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id", [id]);
      if (res.rowCount > 0) return true;
    } catch (e) {
      // ignore and try delete
    }
    const del = await pool.query('DELETE FROM department WHERE id = $1', [id]);
    return del.rowCount > 0;
  }
}

module.exports = Department;
