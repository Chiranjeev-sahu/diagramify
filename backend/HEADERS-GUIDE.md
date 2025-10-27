# Headers & Credentials - Complete Visual Guide

## 🎯 What You'll Learn
- What headers are and why they matter
- How credentials work in cross-origin requests
- When to use `credentials: true`
- Common header patterns in MERN apps

---

## 📦 What Are Headers?

Think of an HTTP request like sending a package:

```
┌─────────────────────────────────────┐
│  HEADERS (The Envelope/Label)       │  ← Metadata about the package
├─────────────────────────────────────┤
│  From: http://localhost:5173        │
│  To: http://localhost:5000          │
│  Content-Type: application/json     │
│  Authorization: Bearer token123     │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  BODY (The Package Contents)        │  ← Actual data
├─────────────────────────────────────┤
│  {                                  │
│    "email": "user@example.com",     │
│    "password": "secret123"          │
│  }                                  │
└─────────────────────────────────────┘
```

**Headers = Metadata** (information ABOUT the data)  
**Body = Actual Data** (the content you're sending)

---

## 🔑 Common Headers Explained

### Request Headers (Frontend → Backend)

| Header | Purpose | Example |
|--------|---------|---------|
| `Content-Type` | Format of data I'm sending | `application/json` |
| `Authorization` | My authentication token | `Bearer eyJhbGci...` |
| `Accept` | Format I want to receive | `application/json` |
| `Origin` | Where I'm calling from | `http://localhost:5173` |
| `Cookie` | Stored cookies | `token=abc123` |
| `User-Agent` | My browser info | `Mozilla/5.0...` |

### Response Headers (Backend → Frontend)

| Header | Purpose | Example |
|--------|---------|---------|
| `Content-Type` | Format of data I'm sending back | `application/json` |
| `Access-Control-Allow-Origin` | Who can read this response | `http://localhost:5173` |
| `Access-Control-Allow-Credentials` | Can send cookies? | `true` |
| `Set-Cookie` | Store this cookie | `token=xyz; HttpOnly` |
| `X-Custom-Header` | Your custom data | Any value |

---

## 🌐 CORS: The Problem

### Why Does CORS Exist?

**Scenario:**
```
You visit: evil-site.com
That site's JavaScript tries to: 
  fetch('https://your-bank.com/api/transfer-money')
```

**Without CORS:** Evil site could steal your data!  
**With CORS:** Browser blocks it by default.

### Same-Origin vs Cross-Origin

```
✅ SAME ORIGIN (No CORS needed):
   http://localhost:5173/page1
   http://localhost:5173/page2
   (Same protocol, domain, port)

❌ CROSS ORIGIN (CORS needed):
   Frontend: http://localhost:5173
   Backend:  http://localhost:5000
   (Different ports = different origins!)
```

---

## 🔄 How CORS Works: Step-by-Step

### Simple Request Flow

```
┌──────────────┐                           ┌──────────────┐
│   Frontend   │                           │   Backend    │
│ (Port 5173)  │                           │ (Port 5000)  │
└──────────────┘                           └──────────────┘
       │                                           │
       │  1. fetch('http://localhost:5000/api')   │
       │─────────────────────────────────────────>│
       │     Headers:                              │
       │       Origin: http://localhost:5173       │
       │                                           │
       │                                           │
       │                        2. CORS middleware │
       │                           checks origin   │
       │                           ✅ Allowed!     │
       │                                           │
       │  3. Response                              │
       │<─────────────────────────────────────────│
       │     Headers:                              │
       │       Access-Control-Allow-Origin:        │
       │         http://localhost:5173             │
       │                                           │
       │  4. Browser: "Backend says OK,            │
       │              I'll show the response!"     │
       │                                           │
```

### Preflight Request Flow (Complex Requests)

**Triggers preflight when:**
- Using methods: PUT, DELETE, PATCH
- Custom headers like `Authorization`
- Content-Type other than simple types

```
┌──────────────┐                           ┌──────────────┐
│   Frontend   │                           │   Backend    │
└──────────────┘                           └──────────────┘
       │                                           │
       │ User calls:                               │
       │ fetch(url, {                              │
       │   method: 'DELETE',                       │
       │   headers: { 'Authorization': 'Bearer..' }│
       │ })                                        │
       │                                           │
       │  STEP 1: Browser sends OPTIONS (preflight)│
       │─────────────────────────────────────────>│
       │   OPTIONS /api/diagrams/123               │
       │   Origin: http://localhost:5173           │
       │   Access-Control-Request-Method: DELETE   │
       │   Access-Control-Request-Headers: Auth..  │
       │                                           │
       │                          CORS middleware: │
       │                          "Is DELETE OK?"  │
       │                          ✅ Yes!          │
       │                                           │
       │  STEP 2: Backend responds to preflight    │
       │<─────────────────────────────────────────│
       │   Access-Control-Allow-Origin: ...5173    │
       │   Access-Control-Allow-Methods: DELETE    │
       │   Access-Control-Allow-Headers: Auth..    │
       │   Access-Control-Allow-Credentials: true  │
       │                                           │
       │  Browser: "Great! Now send real request"  │
       │                                           │
       │  STEP 3: Browser sends actual DELETE      │
       │─────────────────────────────────────────>│
       │   DELETE /api/diagrams/123                │
       │   Authorization: Bearer token123          │
       │                                           │
       │  STEP 4: Backend processes & responds     │
       │<─────────────────────────────────────────│
       │   { "success": true }                     │
       │                                           │
```

---

## 🍪 Credentials: The Cookie Problem

### What Are Credentials?

Credentials include:
1. **Cookies** (session cookies, JWT in cookies)
2. **HTTP Authentication** (Basic Auth, Bearer tokens)
3. **Client SSL certificates**

### The Default Behavior

```javascript
// WITHOUT credentials

Frontend:
  fetch('http://localhost:5000/api/user')
  // Browser DOES NOT send cookies automatically

Backend:
  app.get('/api/user', (req, res) => {
    console.log(req.cookies);  // undefined
  });
```

### With Credentials Enabled

```javascript
// WITH credentials

Frontend:
  fetch('http://localhost:5000/api/user', {
    credentials: 'include'  // ← Tell browser to send cookies
  })

Backend:
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true  // ← Allow receiving credentials
  }));

  app.get('/api/user', (req, res) => {
    console.log(req.cookies);  // { token: 'abc123' }
  });
```

---

## 🔐 credentials: true - Complete Example

### Scenario: Login with JWT in Cookie

#### Step 1: User Logs In

```javascript
// Frontend Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    credentials: 'include',  // ← IMPORTANT!
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  // Cookie is automatically saved by browser!
};
```

```javascript
// Backend Login Route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Verify user (check database, compare password)
  const user = await verifyUser(email, password);
  
  // Create JWT token
  const token = jwt.sign({ userId: user._id }, 'secret');
  
  // Send token as HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,   // JavaScript can't access (prevents XSS)
    secure: true,     // Only HTTPS (in production)
    sameSite: 'none', // Allow cross-origin cookies
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
  });
  
  res.json({ success: true, user });
});
```

#### Step 2: Authenticated Request

```javascript
// Frontend Fetches User Data
const getDiagrams = async () => {
  const response = await fetch('http://localhost:5000/api/diagrams', {
    credentials: 'include'  // ← Automatically sends cookie!
  });
  
  return response.json();
};
```

```javascript
// Backend Protected Route
app.get('/api/diagrams', authenticateMiddleware, async (req, res) => {
  // authenticateMiddleware reads cookie and verifies JWT
  const diagrams = await Diagram.find({ userId: req.user._id });
  res.json(diagrams);
});
```

---

## 📊 credentials: true vs false

| Aspect | credentials: false | credentials: true |
|--------|-------------------|-------------------|
| **Cookies sent?** | ❌ No | ✅ Yes |
| **Frontend setup** | Nothing needed | `credentials: 'include'` |
| **Backend setup** | `credentials: false` or omit | `credentials: true` |
| **Can use `origin: '*'`?** | ✅ Yes | ❌ No (must specify exact origins) |
| **Security** | Lower (stateless) | Higher (with cookies) |
| **Use case** | Public APIs | Authenticated apps |

---

## 🎨 Complete MERN Example

### Backend Setup

```javascript
// app.js
import cors from 'cors';
import express from 'express';

const app = express();

// CORS Configuration
app.use(cors({
  origin: 'http://localhost:5173',  // Frontend URL
  credentials: true,                 // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Login route - sets cookie
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Verify user...
  const token = 'generated-jwt-token';
  
  res.cookie('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  
  res.json({ success: true });
});

// Protected route - reads cookie
app.get('/api/protected', (req, res) => {
  const token = req.cookies.authToken;
  
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  // Verify token...
  res.json({ data: 'Secret data!' });
});
```

### Frontend Setup

```javascript
// services/api.js
const API_URL = 'http://localhost:5000/api';

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',  // ← Must include!
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  return response.json();
};

export const getProtectedData = async () => {
  const response = await fetch(`${API_URL}/protected`, {
    credentials: 'include'  // ← Must include!
  });
  
  return response.json();
};
```

---

## 🐛 Common Errors & Solutions

### Error 1: "No 'Access-Control-Allow-Origin' header"

```
❌ Error:
Access to fetch at 'http://localhost:5000' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
```javascript
// Add CORS middleware
app.use(cors({
  origin: 'http://localhost:5173'
}));
```

---

### Error 2: "Credentials flag is true, but Access-Control-Allow-Origin is '*'"

```
❌ Error:
The value of the 'Access-Control-Allow-Credentials' header in the 
response is '' which must be 'true' when the request's credentials 
mode is 'include'. The credentials mode of requests initiated by 
the XMLHttpRequest is controlled by the withCredentials attribute.
```

**Problem:** Can't use wildcard origin with credentials

**Wrong:**
```javascript
app.use(cors({
  origin: '*',          // ❌ Can't use with credentials
  credentials: true
}));
```

**Correct:**
```javascript
app.use(cors({
  origin: 'http://localhost:5173',  // ✅ Specific origin
  credentials: true
}));
```

---

### Error 3: "Authorization header is not allowed"

```
❌ Error:
Request header field authorization is not allowed by 
Access-Control-Allow-Headers in preflight response
```

**Solution:**
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']  // ← Add this
}));
```

---

### Error 4: Cookies Not Being Sent

**Checklist:**
- ✅ Backend: `credentials: true` in CORS
- ✅ Frontend: `credentials: 'include'` in fetch
- ✅ Cookie has `sameSite: 'none'` (for cross-origin)
- ✅ Cookie has `secure: true` if using HTTPS
- ✅ Origin is exact match (not wildcard)

---

## 📝 Quick Reference

### Backend CORS Setup
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Frontend Fetch with Credentials
```javascript
fetch('http://localhost:5000/api/endpoint', {
  method: 'POST',
  credentials: 'include',  // ← Key part
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'  // Optional
  },
  body: JSON.stringify(data)
});
```

### Reading Headers in Express
```javascript
// Request headers
const authHeader = req.headers.authorization;
const contentType = req.headers['content-type'];
const origin = req.headers.origin;

// All headers
const allHeaders = req.headers;
```

### Setting Response Headers
```javascript
// Single header
res.setHeader('X-Custom-Header', 'value');

// Multiple headers
res.set({
  'X-Header-1': 'value1',
  'X-Header-2': 'value2'
});
```

---

## 🎯 Key Takeaways

1. **Headers = Metadata** about the request/response, not the actual data
2. **CORS** protects users from malicious cross-origin requests
3. **credentials: true** allows cookies/auth headers in cross-origin requests
4. **Both sides must agree**: Backend allows, frontend includes
5. **Can't use wildcard origin** (`*`) with credentials
6. **Middleware order matters**: CORS before routes

---

## 🚀 Next Steps

1. Set up CORS in your app.js
2. Test with/without credentials
3. Try setting cookies from backend
4. Read cookies in protected routes
5. Add Authorization header for JWT tokens

Remember: `credentials: true` is only needed if you're using cookies or HTTP authentication across origins!