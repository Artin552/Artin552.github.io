# Тесты BuildStoreNET

Все тесты находятся в папке `/tests`. Запускайте их из корня проекта.

## Доступные тесты

### 1. smoke_test_search.js
**Основной тест унификации поиска**

Проверяет:
- Наличие файла `search.js`
- Подключение search.js в `index.html` и `listings.html`
- API возвращает корректные результаты поиска
- Фильтрация по категориям работает
- Пагинация работает
- Все страницы загружаются без ошибок

```bash
node tests/smoke_test_search.js
```

### 2. smoke_test.js
**Базовый тест flow: регистрация → вход → создание объявления**

Проверяет:
- Регистрация работает
- Вход в систему работает
- Создание объявления работает

```bash
node tests/smoke_test.js
```

### 3. test_api.js
**Тестирование API endpoints**

Проверяет:
- GET `/api/listings` - возвращает объявления
- GET `/api/listings?q=...` - поиск работает
- GET `/api/listings?category=...` - фильтр по категориям работает

```bash
node tests/test_api.js
```

### 4. test_listings.js
**Тесты CRUD операций с объявлениями**

Проверяет:
- Создание объявления (CREATE)
- Получение своих объявлений (READ)
- Обновление объявления (UPDATE)
- Удаление объявления (DELETE)

```bash
node tests/test_listings.js
```

### 5. add_test_data.js
**Добавить тестовые данные в БД**

Добавляет 5 тестовых объявлений в БД:
- Цемент М400
- Краска акриловая 5л
- Дрель электрическая
- Гвозди оцинкованные
- Шпатель малярный

```bash
node tests/add_test_data.js
```

### 6. check_db.js
**Проверить содержимое БД**

Выводит список первых 10 объявлений в БД.

```bash
node tests/check_db.js
```

## Полный flow тестирования

```bash
# 1. Убедиться что сервер запущен
node backend/server.js

# В отдельном терминале:

# 2. Добавить тестовые данные
node tests/add_test_data.js

# 3. Запустить все тесты
node tests/smoke_test_search.js
node tests/test_api.js
node tests/smoke_test.js
node tests/test_listings.js
```

## Файлы, используемые тестами

- `/backend/db.js` - подключение к БД
- `/frontend/js/search.js` - модуль поиска
- `/index.html` - главная страница
- `/frontend/listings.html` - страница объявлений
- `/frontend/add.html` - страница добавления объявления

## Требования

- Node.js 12+
- Backend сервер должен быть запущен на http://127.0.0.1:4000
- SQLite БД должна быть инициализирована
