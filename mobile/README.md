# SpendWise (mobile)

Expo / React Native client for SpendWise. Talks to the Django API in `../backend`.

## Running

```bash
npm install
npm start          # then press i / a, or scan the QR with Expo Go
npm run web        # browser
```

The API base URL resolves in this order (`src/constants/config.ts`):

1. `EXPO_PUBLIC_API_URL` if set — copy `.env.example` to `.env` to pin one.
2. Otherwise the Metro dev server's own host on port 8000, so a physical device
   on the same network reaches your local backend with no extra config.

When testing on a device, make sure the backend's `ALLOWED_HOSTS` includes that
host.

## Layout

| Path | Contents |
| --- | --- |
| `src/app` | Screens — file-based routes (expo-router) |
| `src/components` | Shared UI, grouped by feature |
| `src/hooks` | React Query wrappers, roughly one per endpoint |
| `src/services` | Axios calls, auth, and token storage |
| `src/types` | API response and form types |
| `src/utils` | Pure helpers (formatting, split math) |

Server state lives in React Query; there is no global store. Query keys follow
`[feature, kind, ...params]`, and mutations invalidate their feature's
top-level key.

## Checks

```bash
npx tsc --noEmit
npm run lint
```
