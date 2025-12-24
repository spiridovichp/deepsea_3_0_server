/**
 * Сервис для работы с пользователями
 */

const User = require('../../db/models/User');
const pool = require('../../db/connection');
const { hashPassword } = require('../../utils/password');

class UsersService {
  /**
   * Создать нового пользователя
   */
  static async createUser(userData, actor) {
    const {
      username,
      email,
      phone,
      password,
      first_name,
      last_name,
      middle_name,
      department_id,
      job_title_id,
      is_active,
      is_verified
    } = userData;

    // Проверка прав: требуется разрешение 'users.create'
    const requiredPermission = 'users.create';

    // Если нет информации о вызывающем пользователе — нельзя создавать
    if (!actor || !actor.id) {
      const err = new Error('Authentication required');
      err.statusCode = 401;
      throw err;
    }

    // Если у объекта actor есть явный список permissions — используем его
    if (actor.permissions && Array.isArray(actor.permissions)) {
      if (!actor.permissions.includes(requiredPermission)) {
        const err = new Error('Forbidden: missing permission users.create');
        err.statusCode = 403;
        throw err;
      }
    } else {
      // Иначе проверим через таблицы RBAC: user_roles -> role_permissions -> permissions
      const permQuery = `
        SELECT 1 FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = $1 AND p.code = $2
        LIMIT 1
      `;

      const permRes = await pool.query(permQuery, [actor.id, requiredPermission]);
      if (permRes.rowCount === 0) {
        const err = new Error('Forbidden: missing permission users.create');
        err.statusCode = 403;
        throw err;
      }


    }

    // Проверить уникальность username
    const existingUserByUsername = await User.findByUsername(username);
    if (existingUserByUsername) {
      const error = new Error('Username already exists');
      error.statusCode = 409;
      throw error;
    }

    // Проверить уникальность email
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      const error = new Error('Email already exists');
      error.statusCode = 409;
      throw error;
    }

    // Проверить уникальность phone
    const existingUserByPhone = await User.findByPhone(phone);
    if (existingUserByPhone) {
      const error = new Error('Phone already exists');
      error.statusCode = 409;
      throw error;
    }

    // Хешировать пароль
    const password_hash = await hashPassword(password);

    // Создать пользователя
    const newUser = await User.create({
      username,
      email,
      phone,
      password_hash,
      first_name,
      last_name,
      middle_name,
      department_id,
      job_title_id,
      is_active: is_active !== undefined ? is_active : true,
      is_verified: is_verified !== undefined ? is_verified : false
    });

    // Вернуть данные пользователя без пароля
    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      middle_name: newUser.middle_name,
      department_id: newUser.department_id,
      job_title_id: newUser.job_title_id,
      is_active: newUser.is_active,
      is_verified: newUser.is_verified,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at
    };
  }

  /**
   * Получить одного пользователя по id
   */
  static async getUserById(id, actor) {
    const requiredPermission = 'users.view';

    if (!actor || !actor.id) {
      const err = new Error('Authentication required');
      err.statusCode = 401;
      throw err;
    }

    if (actor.permissions && Array.isArray(actor.permissions)) {
      if (!actor.permissions.includes(requiredPermission)) {
        const err = new Error('Forbidden: missing permission users.view');
        err.statusCode = 403;
        throw err;
      }
    } else {
      const permQuery = `
        SELECT 1 FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = $1 AND p.code = $2
        LIMIT 1
      `;
      const permRes = await pool.query(permQuery, [actor.id, requiredPermission]);
      if (permRes.rowCount === 0) {
        const err = new Error('Forbidden: missing permission users.view');
        err.statusCode = 403;
        throw err;
      }
    }

    if (!id || Number.isNaN(id) || id <= 0) {
      const err = new Error('Invalid user id');
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findById(id);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      first_name: user.first_name,
      last_name: user.last_name,
      middle_name: user.middle_name,
      department_id: user.department_id,
      job_title_id: user.job_title_id,
      is_active: user.is_active,
      is_verified: user.is_verified,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }

  /**
   * Получить список пользователей с поддержкой пагинации и поиска
   * query: { page, limit, search }
   */
  static async listUsers(query = {}, actor) {
    const requiredPermission = 'users.view';

    // Проверка аутентификации/разрешения
    if (!actor || !actor.id) {
      const err = new Error('Authentication required');
      err.statusCode = 401;
      throw err;
    }

    if (actor.permissions && Array.isArray(actor.permissions)) {
      if (!actor.permissions.includes(requiredPermission)) {
        const err = new Error('Forbidden: missing permission users.view');
        err.statusCode = 403;
        throw err;
      }
    } else {
      const permQuery = `
        SELECT 1 FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = $1 AND p.code = $2
        LIMIT 1
      `;
      const permRes = await pool.query(permQuery, [actor.id, requiredPermission]);
      if (permRes.rowCount === 0) {
        const err = new Error('Forbidden: missing permission users.view');
        err.statusCode = 403;
        throw err;
      }
    }

    // Pagination
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 25, 1), 200);
    const offset = (page - 1) * limit;

    // Search (username/email/phone)
    const search = query.search ? `%${query.search.trim()}%` : null;

    let where = '';
    const params = [];
    if (search) {
      params.push(search, search, search);
      where = `WHERE username ILIKE $${params.length - 2} OR email ILIKE $${params.length - 1} OR phone ILIKE $${params.length}`;
    }

    // Total count
    const countQuery = `SELECT COUNT(*) AS total FROM users ${where}`;
    const countRes = await pool.query(countQuery, params.slice(0, params.length));
    const total = parseInt(countRes.rows[0].total, 10) || 0;

    // Data query
    params.push(limit, offset);
    const dataQuery = `
      SELECT id, username, email, phone, first_name, last_name, middle_name, department_id, job_title_id, is_active, is_verified, created_at, updated_at
      FROM users
      ${where}
      ORDER BY id ASC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const dataRes = await pool.query(dataQuery, params);

    return {
      data: dataRes.rows,
      meta: {
        page,
        limit,
        total
      }
    };
  }
}

module.exports = UsersService;

