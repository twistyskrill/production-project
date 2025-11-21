# Быстрое исправление ошибки "Unexpected token '<'"

## Проблема

Браузер пытается выполнить HTML как JavaScript, потому что:

1. Браузер кэшировал старый HTML с путями к файлам с contenthash
2. Dev server возвращает HTML вместо JS файла

## Решение (3 шага)

### 1. Остановите dev server

В терминале нажмите `Ctrl+C`

### 2. Очистите кэш браузера полностью

**Важно:** Нужно очистить кэш полностью, не просто обновить страницу!

**Chrome/Edge:**

- Нажмите `Ctrl+Shift+Delete`
- Выберите "За все время" (All time)
- Отметьте "Кэшированные изображения и файлы"
- Нажмите "Очистить данные"
- **Или** откройте в режиме инкогнито: `Ctrl+Shift+N`

**Firefox:**

- Нажмите `Ctrl+Shift+Delete`
- Выберите "Все" (Everything)
- Отметьте "Кэш"
- Нажмите "Очистить сейчас"
- **Или** откройте в режиме инкогнито: `Ctrl+Shift+P`

### 3. Перезапустите dev server

```powershell
npm start
```

### 4. Откройте приложение

- Если браузер не открылся автоматически, перейдите на `http://localhost:3000`
- **Рекомендуется:** откройте в режиме инкогнито, чтобы гарантировать отсутствие кэша

## Проверка

После выполнения этих шагов:

1. Откройте DevTools (F12) → вкладка **Network**
2. Обновите страницу (F5)
3. Проверьте, что загружается файл `main.js` (без хэша!)
4. Статус должен быть **200 OK**
5. В консоли не должно быть ошибок

## Если не помогло

Попробуйте полностью очистить кэш проекта:

```powershell
# Остановите все процессы node
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Очистите все кэши
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# Перезапустите
npm start
```

Затем откройте в режиме инкогнито.
