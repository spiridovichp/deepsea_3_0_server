/**
 * Контроллер аутентификации
 */

const AuthService = require('../services/authService');
const AuthError = require('../../errors/AuthError');

class AuthController {
  /**
   * Вход в систему
   */
  static async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent') || '';

      const result = await AuthService.login(username, password, ipAddress, userAgent);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;

