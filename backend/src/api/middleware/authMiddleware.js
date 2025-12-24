/**
 * Middleware для аутентификации и подгрузки разрешений пользователя
 */

const { verifyAccessToken } = require('../../utils/jwt');
const User = require('../../db/models/User');
const pool = require('../../db/connection');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const err = new Error('Authentication required');
      err.statusCode = 401;
      throw err;
    }

    const token = authHeader.split(' ')[1];

    // Верифицируем JWT и получаем полезную нагрузку
    const payload = verifyAccessToken(token);

    if (!payload || !payload.id) {
      const err = new Error('Invalid token payload');
      err.statusCode = 401;
      throw err;
    }

    // Подгружаем пользователя из БД (без password_hash)
    const user = await User.findById(payload.id);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 401;
      throw err;
    }

    if (!user.is_active) {
      const err = new Error('User account is deactivated');
      err.statusCode = 403;
      throw err;
    }

    // Подгружаем список кодов разрешений для пользователя
    const permsQuery = `
      SELECT DISTINCT p.code
      FROM permissions p
      JOIN role_permissions rp ON rp.permission_id = p.id
      JOIN user_roles ur ON ur.role_id = rp.role_id
      WHERE ur.user_id = $1
    `;

    const permsRes = await pool.query(permsQuery, [user.id]);
    const permissions = permsRes.rows.map(r => r.code);

    // Установим req.user
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      department_id: user.department_id,
      job_title_id: user.job_title_id,
      is_active: user.is_active,
      permissions
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authMiddleware;
