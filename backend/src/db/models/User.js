/**
 * Модель пользователя
 */

const pool = require('../connection');

class User {
  /**
   * Найти пользователя по username
   */
  static async findByUsername(username) {
    const query = `
      SELECT 
        id, 
        username, 
        email, 
        phone,
        password_hash, 
        first_name, 
        last_name, 
        middle_name,
        department_id,
        job_title_id,
        is_active, 
        is_verified,
        last_login,
        created_at,
        updated_at
      FROM users 
      WHERE username = $1
    `;
    
    const result = await pool.query(query, [username]);
    return result.rows[0] || null;
  }

  /**
   * Найти пользователя по ID
   */
  static async findById(id) {
    const query = `
      SELECT 
        id, 
        username, 
        email, 
        phone,
        first_name, 
        last_name, 
        middle_name,
        department_id,
        job_title_id,
        is_active, 
        is_verified,
        last_login,
        created_at,
        updated_at
      FROM users 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Обновить время последнего входа
   */
  static async updateLastLogin(userId) {
    const query = `
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP 
      WHERE id = $1
    `;
    
    await pool.query(query, [userId]);
  }

  /**
   * Найти пользователя по email
   */
  static async findByEmail(email) {
    const query = `
      SELECT 
        id, 
        username, 
        email, 
        phone,
        password_hash, 
        first_name, 
        last_name, 
        middle_name,
        department_id,
        job_title_id,
        is_active, 
        is_verified,
        last_login,
        created_at,
        updated_at
      FROM users 
      WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Найти пользователя по phone
   */
  static async findByPhone(phone) {
    const query = `
      SELECT 
        id, 
        username, 
        email, 
        phone,
        password_hash, 
        first_name, 
        last_name, 
        middle_name,
        department_id,
        job_title_id,
        is_active, 
        is_verified,
        last_login,
        created_at,
        updated_at
      FROM users 
      WHERE phone = $1
    `;
    
    const result = await pool.query(query, [phone]);
    return result.rows[0] || null;
  }

  /**
   * Создать нового пользователя
   */
  static async create(userData) {
    const {
      username,
      email,
      phone,
      password_hash,
      first_name,
      last_name,
      middle_name,
      department_id,
      job_title_id,
      is_active = true,
      is_verified = false
    } = userData;

    const query = `
      INSERT INTO users (
        username, 
        email, 
        phone, 
        password_hash, 
        first_name, 
        last_name, 
        middle_name,
        department_id,
        job_title_id,
        is_active, 
        is_verified
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING 
        id, 
        username, 
        email, 
        phone,
        first_name, 
        last_name, 
        middle_name,
        department_id,
        job_title_id,
        is_active, 
        is_verified,
        created_at,
        updated_at
    `;
    
    const result = await pool.query(query, [
      username,
      email,
      phone,
      password_hash,
      first_name || null,
      last_name || null,
      middle_name || null,
      department_id || null,
      job_title_id || null,
      is_active,
      is_verified
    ]);
    
    return result.rows[0];
  }
}

module.exports = User;

