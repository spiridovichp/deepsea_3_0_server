/**
 * Сервис аутентификации
 */

const User = require('../../db/models/User');
const Session = require('../../db/models/Session');
const { comparePassword } = require('../../utils/password');
const { generateAccessToken, generateRefreshToken, getTokenExpiration } = require('../../utils/jwt');
const AuthError = require('../../errors/AuthError');

class AuthService {
  /**
   * Вход в систему
   */
  static async login(username, password, ipAddress, userAgent) {
    // Найти пользователя
    const user = await User.findByUsername(username);
    
    if (!user) {
      throw new AuthError('Invalid credentials', 401);
    }

    // Проверить активность пользователя
    if (!user.is_active) {
      throw new AuthError('User account is deactivated', 403);
    }

    // Проверить пароль
    const isPasswordValid = await comparePassword(password, user.password_hash);
    
    if (!isPasswordValid) {
      throw new AuthError('Invalid credentials', 401);
    }

    // Обновить время последнего входа
    await User.updateLastLogin(user.id);

    // Генерация токенов
    const tokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken();
    const expiresAt = getTokenExpiration();

    // Создать сессию
    await Session.create({
      user_id: user.id,
      token: accessToken,
      refresh_token: refreshToken,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAt
    });

    // Подготовить данные пользователя для ответа
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    };

    return {
      token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt.toISOString(),
      user: userData
    };
  }
}

module.exports = AuthService;

