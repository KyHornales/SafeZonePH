# Quick Start: Updating API Service for Vercel Deployment

## Change Required in src/services/api.ts

**Replace this line (Line 1):**
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
```

**With this:**
```typescript
import { API_BASE_URL } from '../config/api.config';
```

**And remove line 2** (the empty line after it).

---

## Why This Change?

The new `api.config.ts` file automatically detects your environment:

- **Local development**: Uses `http://127.0.0.1:8000`
- **Production (Vercel)**: Uses relative URLs (`/api/...`)
- **Custom override**: Respects `REACT_APP_API_URL` if set

This means your app will work both locally AND on Vercel without any code changes!

---

## Alternative: Manual Update

If you prefer not to use the config file, replace line 1 of `src/services/api.ts` with:

```typescript
const getApiBaseUrl = (): string => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (process.env.NODE_ENV === 'production') {
    return '';
  }
  return 'http://127.0.0.1:8000';
};

const API_BASE_URL = getApiBaseUrl();
```
