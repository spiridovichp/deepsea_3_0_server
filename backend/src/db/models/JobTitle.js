/**
 * Модель для работы с наименованиями должностей
 */
const pool = require('../connection');

class JobTitle {
  static async findNameById(id) {
    if (!id) return null;
    const res = await pool.query('SELECT name FROM job_title WHERE id = $1', [id]);
    return res.rows[0] ? res.rows[0].name : null;
  }

  static async list() {
    const res = await pool.query('SELECT id, name FROM job_title ORDER BY id ASC');
    return res.rows;
  }

  static async findById(id) {
    if (!id) return null;
    const res = await pool.query('SELECT id, name, description, created_at, updated_at FROM job_title WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  static async create(fields) {
    const { name, description } = fields || {};
    const res = await pool.query('INSERT INTO job_title (name, description) VALUES ($1, $2) RETURNING id, name, description, created_at', [name, description]);
    return res.rows[0];
  }

  static async update(id, fields) {
    const allowed = ['name', 'description'];
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
      const res = await pool.query('SELECT id, name, description, created_at, updated_at FROM job_title WHERE id = $1', [id]);
      return res.rows[0] || null;
    }
    params.push(id);
    const query = `UPDATE job_title SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING id, name, description, created_at, updated_at`;
    const res = await pool.query(query, params);
    return res.rows[0] || null;
  }

  static async softDelete(id) {
    try {
      const res = await pool.query("UPDATE job_title SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id", [id]);
      if (res.rowCount > 0) return true;
    } catch (e) {
      // ignore and try delete
    }
    const del = await pool.query('DELETE FROM job_title WHERE id = $1', [id]);
    return del.rowCount > 0;
  }
}

module.exports = JobTitle;
