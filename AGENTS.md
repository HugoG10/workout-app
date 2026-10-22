# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

## Cursor Cloud

- Install dependencies with `npm ci`. Node.js 22 from the base image is enough. There is no backend, database, or secret.
- Exercise the product in the browser. `npx expo start --host lan --port 8081` serves the web app at http://127.0.0.1:8081. iOS and Android simulators are not available in this environment.
- Accounts stay on the device through SecureStore and AsyncStorage. Create an account in the browser, then start a workout from the Workout tab.
- `npm run lint` lints the project. `npx tsc --noEmit` typechecks it. There is no automated test script.
