# BuildStoreNET (local dev)

This is a small marketplace demo (Node/Express backend + static frontend). Quick notes to run locally.

## Required env variables
- `JWT_SECRET` — secret for signing JWT (development fallback exists but set in production!) 
- `HOST` — host to bind (default `127.0.0.1`)
- `PORT` — port (default `4000`)
- `JSON_LIMIT` — max JSON body size (default `2mb`)
- Optional SMTP for password reset: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`.

## Run
1. Install dependencies for backend:

```powershell
cd backend
npm install
node server.js
```

2. Open the site in a browser:

```
http://127.0.0.1:4000
```

## Uploads
- Uploaded images are saved to `frontend/img/uploads/` and `imagePath` in DB is set to `frontend/img/uploads/<file>`.

## Notes / Next steps
- Remove `imageBase64` column from DB via migration (recommended). The app no longer persists base64 in new inserts.
- Add production-grade secrets and HTTPS when deploying.
- Consider migrating DB from ad-hoc PRAGMA checks to a proper migration system.

