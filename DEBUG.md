# Инструкция по отладке приложения

## Проверка работоспособности

### 1. Откройте консоль браузера

- Нажмите `F12` или `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
- Перейдите на вкладку **Console**

### 2. Проверьте наличие ошибок

Ищите ошибки красного цвета. Типичные проблемы:

#### Ошибки JavaScript

- `Cannot read properties of undefined` - проблема с импортами или данными
- `Module not found` - отсутствует файл или неправильный путь импорта
- `TypeError` - проблема с типами или undefined значениями

#### Ошибки сети (Network)

- Перейдите на вкладку **Network**
- Проверьте, загружаются ли файлы `.js` и `.css`
- Если видите 404 ошибки - проблема с webpack конфигурацией

### 3. Проверьте React DevTools

- Установите расширение [React Developer Tools](https://react.dev/learn/react-developer-tools)
- Проверьте, что компоненты рендерятся в дереве компонентов

### 4. Проверьте Redux DevTools

- Установите расширение [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- Проверьте состояние Redux store
- Убедитесь, что `user._inited` установлен в `true`

## Типичные проблемы и решения

### Белый экран

1. **Проверьте консоль браузера на ошибки**

   ```javascript
   // Должны увидеть что-то вроде:
   // "ErrorBoundary caught an error: ..."
   ```

2. **Проверьте, что все файлы загружаются**

   - Откройте Network tab
   - Обновите страницу (F5)
   - Проверьте, что `main.js` загружается успешно (статус 200)

3. **Проверьте localStorage**

   ```javascript
   // В консоли браузера выполните:
   console.log(localStorage.getItem("user"));
   ```

4. **Проверьте Redux состояние**
   ```javascript
   // Если установлен Redux DevTools, проверьте:
   // state.user._inited должно быть true
   ```

### Ошибки импорта

Если видите ошибки типа `Cannot find module`:

1. Проверьте, что файл существует
2. Проверьте правильность путей импорта
3. Перезапустите dev server

### Проблемы с CSS

Если стили не применяются:

1. Проверьте, что CSS модули загружаются
2. Проверьте консоль на ошибки компиляции SCSS
3. Убедитесь, что `app/styles/index.scss` импортирован

## Команды для проверки

### Проверка сборки

```bash
npm run build
```

### Проверка типов

```bash
npx tsc --noEmit
```

### Проверка линтера

```bash
npm run lint
```

## Что должно работать

После запуска `npm start`:

1. ✅ Браузер открывается автоматически на `http://localhost:3000`
2. ✅ Видна страница Terminal с:
   - Navbar (верхняя панель)
   - Sidebar (боковая панель)
   - Market Watch Board
   - Order Placement Form
   - Positions Panel
3. ✅ Можно перейти на страницу Analytics (`/analytics`)
4. ✅ Можно перейти на страницу Settings (`/settings`)

## Если ничего не помогает

1. Очистите кэш и пересоберите:

   ```bash
   Remove-Item -Recurse -Force .cache -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
   npm start
   ```

2. Переустановите зависимости:

   ```bash
   Remove-Item -Recurse -Force node_modules
   npm install
   npm start
   ```

3. Проверьте версии Node.js и npm:
   ```bash
   node --version  # Должно быть v20.x.x
   npm --version
   ```
