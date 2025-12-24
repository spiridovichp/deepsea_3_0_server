# Swagger/OpenAPI Документация

## Описание

Данная директория содержит OpenAPI 3.0 спецификацию для API DeepSea 3.0 в форматах YAML и JSON.

## Файлы

- `swagger.yaml` - OpenAPI спецификация в формате YAML (рекомендуется)
- `swagger.json` - OpenAPI спецификация в формате JSON
- `api_documentation.md` - Исходная документация в формате Markdown

## Использование

### Swagger UI

1. Откройте [Swagger Editor](https://editor.swagger.io/)
2. Загрузите файл `swagger.yaml` или `swagger.json`
3. Просматривайте и тестируйте API

### Локальный Swagger UI

```bash
# Установите swagger-ui
npm install -g swagger-ui-serve

# Запустите сервер
swagger-ui-serve swagger.yaml
```

Или используйте Docker:

```bash
docker run -p 8080:8080 -e SWAGGER_JSON=/swagger.yaml -v $(pwd):/swagger swaggerapi/swagger-ui
```

### Postman

1. Откройте Postman
2. File → Import
3. Выберите файл `swagger.json`
4. Все эндпоинты будут импортированы как коллекция

### Insomnia

1. Откройте Insomnia
2. Create → Import From → File
3. Выберите файл `swagger.yaml` или `swagger.json`

## Статистика

- **Всего эндпоинтов:** 81 путь
- **Всего операций:** 122 метода
- **Версия OpenAPI:** 3.0.3
- **Версия API:** 3.0.0

## Структура

API организован по следующим разделам:

1. **Аутентификация и авторизация** (`/api/auth/*`)
2. **Управление пользователями** (`/api/users/*`)
3. **Управление ролями и разрешениями** (`/api/roles/*`, `/api/permissions/*`)
4. **Управление проектами** (`/api/projects/*`)
5. **Управление задачами** (`/api/issues/*`)
6. **Управление документами** (`/api/documents/*`)
7. **Управление вопросами от заказчика** (`/api/customer-questions/*`)
8. **Управление материалами** (`/api/materials/*`)
9. **Управление оборудованием** (`/api/equipment/*`)
10. **Управление спецификациями и ведомостями** (`/api/specifications/*`, `/api/statements/*`)
11. **Управление файлами** (`/api/storage/*`)
12. **Коммуникации** (`/api/messages/*`, `/api/notifications/*`)
13. **Wiki** (`/api/wiki/*`)
14. **Справочники** (`/api/specializations/*`)

## Аутентификация

Большинство эндпоинтов требуют аутентификации через Bearer Token (JWT).

Исключения:
- `POST /api/auth/login` - вход в систему
- `POST /api/auth/refresh` - обновление токена

Для использования защищенных эндпоинтов:
1. Выполните `POST /api/auth/login` для получения токена
2. Используйте токен в заголовке: `Authorization: Bearer <token>`

## Обновление документации

При изменении `api_documentation.md` запустите скрипт для обновления Swagger спецификации:

```bash
python3 generate_swagger.py
```

## Примечания

- Все даты и даты-время используют формат ISO 8601
- Пагинация использует параметры `page` и `limit`
- Коды ошибок соответствуют стандартам HTTP
- Формат ответов с ошибками: `{"error": {"code": "...", "message": "...", "details": {...}}}`

