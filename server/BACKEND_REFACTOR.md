# Backend Refactor Notes

## What Changed

- Preserved all existing public mounts: `/auth`, `/api`, `/upload`, `/youtube`, and `/ping`.
- Added production configuration modules in `config/` for environment, CORS, and logging.
- Added repositories for database access:
  - `repositories/user.repository.js`
  - `repositories/template.repository.js`
  - `repositories/youtube.repository.js`
- Added middleware for:
  - JWT authentication and RBAC
  - Zod request validation
  - Helmet security headers
  - CORS allow-listing
  - rate limiting
  - NoSQL injection mitigation
  - basic XSS sanitization
  - centralized error handling
  - Pino request logging
- Added Zod validators in `validators/` while keeping the legacy `validations/auth.validation.js` adapter.
- Kept legacy response contracts intact where the frontend depends on them:
  - login and email login still return `{ user, token }`
  - cart and favorites still return `{ cart }` and `{ favorites }`
  - templates still return `{ success, data }`
  - upload still returns `{ success, message, fileUrl }`
  - YouTube endpoints keep their existing envelopes

## Error Compatibility

Errors now include the target production fields:

```json
{
  "success": false,
  "message": "Error message",
  "errorCode": "SOME_CODE"
}
```

For compatibility, the response also keeps the existing nested shape:

```json
{
  "error": {
    "message": "Error message",
    "errorCode": "SOME_CODE",
    "statusCode": 400
  }
}
```

## Environment Variables

Required:

- `MONGO_URI`
- `JWT_SECRET`

Recommended:

- `NODE_ENV=production`
- `JWT_EXPIRES_IN=7d`
- `FRONTEND_URL=https://your-frontend.example`
- `API_RATE_LIMIT_WINDOW_MS=900000`
- `API_RATE_LIMIT_MAX=500`
- `AUTH_RATE_LIMIT_WINDOW_MS=900000`
- `AUTH_RATE_LIMIT_MAX=50`
- `MINIO_ENDPOINT=localhost`
- `MINIO_PORT=9000`
- `MINIO_USE_SSL=false`
- `MINIO_BUCKET=mybucket`
- `MINIO_PUBLIC_URL=http://127.0.0.1:9000`
- `UPLOAD_MAX_BYTES=104857600`
- `LOG_LEVEL=info`

## Migration Checklist

1. Confirm production `FRONTEND_URL` contains every allowed frontend origin, comma-separated.
2. Confirm `JWT_SECRET` is strong and consistent across all API instances.
3. Run `npm install` in `server/` to install the new hardening dependencies.
4. Start the API with `npm start`.
5. Smoke test:
   - `GET /ping`
   - `POST /auth/login`
   - `GET /api/templates`
   - authenticated cart/favorites toggle
   - upload and list files if MinIO is running
   - YouTube admin status if configured
6. Review `npm audit` output before production rollout. This refactor does not run `npm audit fix` automatically because dependency major upgrades may be breaking.

## Notes

- The backend now creates MongoDB indexes for common template, user, and YouTube log queries.
- Passwords are excluded from default user queries with `select: false`; login explicitly opts in to password loading for bcrypt comparison.
- Signup now returns top-level `user` and `token`, matching the current client service expectation, while also including `data` for internal standardization.
