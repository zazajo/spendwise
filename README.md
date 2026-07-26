# SpendWise

## Authentication

The API uses JSON Web Tokens (via `djangorestframework-simplejwt`) instead of
DRF's plain token auth. Every protected endpoint expects:

```
Authorization: Bearer <access_token>
```

### Register

`POST /api/register/`

```json
{ "username": "jane", "email": "jane@example.com", "password": "...", "password2": "..." }
```

Returns the new user plus a token pair, so the app can go straight to the
home screen without a separate login call:

```json
{
  "user": { "id": 1, "username": "jane", "email": "jane@example.com" },
  "access": "<access_token>",
  "refresh": "<refresh_token>",
  "message": "User created successfully"
}
```

### Login

`POST /api/token/`

```json
{ "username": "jane", "password": "..." }
```

Returns the token pair plus the full user profile (same shape as
`GET /api/users/me/`), again to save a round trip on app startup:

```json
{
  "access": "<access_token>",
  "refresh": "<refresh_token>",
  "user": { "id": 1, "username": "jane", "profile": { ... }, "preferences": { ... } }
}
```

### Refresh

`POST /api/token/refresh/`

```json
{ "refresh": "<refresh_token>" }
```

Returns a new `access` token **and** a new `refresh` token — refresh tokens
rotate on every use, and the one just used is immediately blacklisted. A
stolen refresh token is only good for one refresh before it's dead.

### Logout

`POST /api/token/logout/` (requires a valid access token)

```json
{ "refresh": "<refresh_token>" }
```

Blacklists the given refresh token so it can no longer be exchanged for a
new access token. The access token itself isn't checked against the
blacklist, so it stays valid until it naturally expires — this is why the
access token lifetime is kept short (30 minutes).

### Token lifetimes

| Token | Lifetime |
|---|---|
| Access | 30 minutes |
| Refresh | 30 days (rotated + blacklisted on each refresh) |

Configured in `backend/spendwise/settings.py` under `SIMPLE_JWT`.

