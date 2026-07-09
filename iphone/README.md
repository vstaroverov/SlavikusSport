# Slavikus Sport для iPhone

В проект добавлена iOS-платформа Capacitor в папке `ios/`.

## Что уже готово

- Веб-приложение собирается в `www/`.
- Команда `npm run ios:sync` копирует свежую веб-версию в iOS-проект.
- iOS-проект лежит в `ios/App/App.xcodeproj`.

## Как собрать и установить на iPhone

Сборка iPhone-приложения требует macOS и Xcode.

1. Перенеси проект на Mac.
2. Установи Node.js.
3. В папке проекта выполни:

```bash
npm install
npm run ios:sync
```

4. Открой проект:

```bash
npm run ios:open
```

5. В Xcode выбери свой Apple ID в `Signing & Capabilities`.
6. Подключи iPhone кабелем.
7. Выбери iPhone как устройство запуска.
8. Нажми `Run`.

## Важно

На Windows можно подготовить iOS-проект, но нельзя собрать и подписать `.ipa`.
Для установки на iPhone нужен Mac, Xcode и подпись Apple.
