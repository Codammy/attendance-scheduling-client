# AGENTS.md

## What this is

Expo (SDK 57 / React Native 0.86) mobile client for BLE-based classroom attendance. Plain JavaScript (`.js`/`.jsx`) — there is **no TypeScript, no ESLint/Prettier, no tests, no CI**. Do not invent `lint`/`test`/`typecheck` commands; they don't exist. Verification = start the app and exercise the screen.

- Package manager: **npm** (`package-lock.json`; not yarn/pnpm).
- Backend lives in a sibling repo: `/home/codam/school/attendance-schedulingservice` (Spring Boot, `http://<host>:8080/api`).
- Routing: expo-router file-based routes under `app/`; entry is `expo-router/entry` (see `package.json` `main`).

## Commands

```sh
npm start          # Metro dev server
npm run android    # expo run:android — builds the native dev client, then starts Metro
npm run ios        # expo run:ios
npm run web
```

- **Expo Go does not work** — `react-native-ble-plx` is a native module and `expo-dev-client` is installed. Use `npm run android`/`ios` to get a dev client.
- After changing anything native (config plugins, permissions, `app.json` `android`/`ios` blocks), regenerate the native project first: `npx expo prebuild -p android --clean` (it will **not** auto-sync when `android/` already exists), then `npm run android`.

## Generated / ignored paths

- `android/` and `/ios` are **gitignored prebuild output**. Never hand-edit them; config changes belong in `app.json` plugins/fields, then regenerate with `npx expo prebuild` or `expo run:*`.
- `dist/`, `.expo/` are build artifacts. `.env` is gitignored (copy from `.env.example`).

## Environment

- `EXPO_PUBLIC_API_URL` is **inlined into the bundle at Metro start** (see `constants/Api.js`) — restart Metro after editing `.env`; there's no runtime config.
- Default is `http://localhost:8080/api`, which only works when the backend is reachable at localhost: use `10.0.2.2` on the Android emulator and your machine's LAN IP on a real device. The EAS `development` profile in `eas.json` carries the same variable (placeholder value).

## Architecture (things filenames don't tell you)

- **Root wiring** (`app/_layout.jsx`): `SafeAreaProvider > AuthProvider > useProtectedRoute`. Auth state comes only from `hooks/useAuth` / `context/AuthContext`.
- **Role routing**: route groups are `(auth)`, `(student)`, `(lecturer)`, `(admin)`. After login/restore the app does `router.replace('/' + user.role.toLowerCase())` → `/student | /lecturer | /admin`.
- **`hooks/useProtectedRoute.js` guards authentication only, NOT role** — a logged-in student can navigate to `/admin` routes; authorization is enforced by the backend, not the client. Don't assume or add half-working client-side role checks without noting this.
- **Session restore** requires *both* token and user in SecureStore (`api/tokenStorage.js`); there is no "get current user" endpoint, so the user object must be persisted at login or the user is treated as logged out.
- **API layer** (`api/client.js`): a single fetch wrapper that unwraps the backend `AppResponse { data, error, message, success }` envelope and returns `payload.data`. Failures throw `ApiError` whose `.message` is the backend's `message`. A 401 triggers a registered handler → logout. The Bearer token is module-level (`setAuthToken`) — screens never pass tokens; new endpoints just call `apiClient.get/post/...` from a file in `api/`.
- **List screens**: shared search/pagination/infinite-scroll logic is `hooks/usePaginatedList`. Its `fetchFn` argument **must be a stable module-level function** (an inline arrow re-triggers the load effect).
- **BLE**: all `react-native-ble-plx` usage is confined to `ble/` — screens use the `ble/useBleScanner` hook, never raw native calls.
  - Students cannot read the admin-only `/ble-device` registry; `ble/matchRegisteredDevice.js` matches scan results against the student's own attendance sessions (`scheduledWith.deviceID`). Keep this workaround if you touch device matching.
  - BLE sign-in is **Android-only by design** (iOS shows an explanatory screen) — don't "fix" it into an iOS flow.
- **Screens in a role group**: each `app/(role)/_layout.jsx` declares `<Stack.Screen name="..." options={{title}}>` entries — a new screen must be registered there to appear in the stack with a header/title.
