/**
 * Сервис для проверки разрешений (RBAC)
 * Экспортирует hasPermission(actor, permissionCode)
 *
 * Логика:
 * - Если у actor есть поле permissions (массив) — проверяем в памяти
 * - Иначе делаем быстрый SQL-запрос к user_roles -> role_permissions -> permissions
 */

const Permission = require('../../db/models/Permission');

async function hasPermission(actor, permissionCode) {
  if (!actor || !actor.id) return false;

  if (actor.permissions && Array.isArray(actor.permissions)) {
    return actor.permissions.includes(permissionCode);
  }

  try {
    return await Permission.hasPermissionForUser(actor.id, permissionCode);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('permissionService.hasPermission error:', err.message);
    return false;
  }
}

module.exports = { hasPermission };
