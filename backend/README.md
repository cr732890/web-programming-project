# Virtual Lab — Backend API

Node.js + Express + SQLite backend for the Virtual Lab web app.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env and change JWT_SECRET to something random

# 3. Start the server
node server.js

# (Optional) Auto-restart on file changes
npm install -g nodemon
npm run dev
```

Server runs at: `http://localhost:3000`

---

## API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and get token |
| GET | `/api/auth/me` | Student/Admin | Get current user info |

**Register body:** `{ name, email, password, role? }`  
**Login body:** `{ email, password }`  
**Response:** `{ token, user }` — save the `token` and send as `Authorization: Bearer <token>` on all protected routes.

---

### Labs
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/labs` | Student/Admin | List all labs |
| GET | `/api/labs/:id` | Student/Admin | Get a single lab |
| POST | `/api/labs` | Admin | Create a lab |
| PUT | `/api/labs/:id` | Admin | Update a lab |
| DELETE | `/api/labs/:id` | Admin | Delete a lab |

**Create/Update body:** `{ title, description, instructions, starter_code, language }`

---

### Submissions
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/submissions` | Student | Submit code for a lab |
| GET | `/api/submissions/my` | Student | My submissions |
| GET | `/api/submissions` | Admin | All submissions (filter by `?lab_id=&user_id=`) |
| GET | `/api/submissions/:id` | Student/Admin | Single submission |
| PUT | `/api/submissions/:id/grade` | Admin | Grade a submission |

**Submit body:** `{ lab_id, code }`  
**Grade body:** `{ grade (0-100), feedback }`

---

### Admin Dashboard
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/admin/stats` | Admin | Summary stats |
| GET | `/api/admin/users` | Admin | All users |
| DELETE | `/api/admin/users/:id` | Admin | Remove a user |
| PUT | `/api/admin/users/:id/role` | Admin | Change user role |

---

## Connecting to Your Frontend

```javascript
const API = 'http://localhost:3000/api';
const token = localStorage.getItem('token');

// Example: fetch all labs
const res = await fetch(`${API}/labs`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const labs = await res.json();

// Example: submit code
await fetch(`${API}/submissions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ lab_id: 1, code: 'console.log("hello")' })
});
```
