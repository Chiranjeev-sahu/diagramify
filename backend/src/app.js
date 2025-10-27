import cors from "cors";
import express from "express";
import corsOptions from "./config/cors.config.js";

const app = express();

/**
 * ============================================================================
 * MIDDLEWARE SETUP
 * ============================================================================
 * Middleware runs BEFORE your route handlers.
 * Think of it like security checkpoints that every request passes through.
 */

/**
 * 1. CORS Middleware
 * Allows frontend (React) to call backend (Express) from different origin
 */
app.use(cors(corsOptions));

/**
 * 2. JSON Parser Middleware
 * Parses incoming requests with JSON payloads
 * Without this, req.body would be undefined!
 *
 * Example:
 *   Frontend sends: { "email": "test@test.com" }
 *   Without this: req.body = undefined
 *   With this: req.body = { email: "test@test.com" }
 */
app.use(express.json());

/**
 * 3. URL-encoded Parser Middleware
 * Parses incoming requests with URL-encoded payloads (form submissions)
 *
 * Example form data: email=test@test.com&password=123
 * After parsing: req.body = { email: "test@test.com", password: "123" }
 */
app.use(express.urlencoded({ extended: true }));

/**
 * 4. Custom Headers Middleware
 * Add custom headers to ALL responses
 */
app.use((req, res, next) => {
  // Security headers
  res.setHeader("X-Content-Type-Options", "nosniff"); // Prevent MIME sniffing
  res.setHeader("X-Frame-Options", "DENY"); // Prevent clickjacking
  res.setHeader("X-XSS-Protection", "1; mode=block"); // XSS protection

  // Log every request (useful for debugging)
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);

  next(); // Continue to next middleware/route
});

/**
 * ============================================================================
 * UNDERSTANDING HEADERS
 * ============================================================================
 *
 * Headers are metadata about the HTTP request/response.
 * They're like the "envelope" information, not the actual "letter" content.
 *
 * REQUEST HEADERS (sent by client):
 * ----------------------------------
 * - Content-Type: What format is the data I'm sending?
 *     Example: "application/json" means "I'm sending JSON"
 *
 * - Authorization: My authentication token
 *     Example: "Bearer eyJhbGciOiJIUzI1NiIs..."
 *
 * - Accept: What format can I receive?
 *     Example: "application/json" means "Send me JSON please"
 *
 * - Origin: Where is this request coming from?
 *     Example: "http://localhost:5173"
 *
 * - Cookie: Cookies stored in browser
 *     Example: "token=abc123; sessionId=xyz789"
 *
 * - User-Agent: What browser/device?
 *     Example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
 *
 *
 * RESPONSE HEADERS (sent by server):
 * -----------------------------------
 * - Content-Type: What format is the data I'm sending back?
 *     Example: "application/json" means "I'm sending JSON"
 *
 * - Access-Control-Allow-Origin: Which origins can read this response?
 *     Example: "http://localhost:5173" (CORS header)
 *
 * - Access-Control-Allow-Credentials: Can browser send cookies?
 *     Example: "true" (CORS header)
 *
 * - Set-Cookie: Store this cookie in browser
 *     Example: "token=abc123; HttpOnly; Secure"
 *
 * - Authorization: Not typically in response, but can be used
 *
 *
 * HOW TO ACCESS HEADERS IN EXPRESS:
 * ----------------------------------
 * Read request headers:
 *   const authHeader = req.headers.authorization;
 *   const contentType = req.headers['content-type'];
 *
 * Set response headers:
 *   res.setHeader('X-Custom-Header', 'value');
 *   res.header('X-Another-Header', 'value'); // Same thing
 */

/**
 * ============================================================================
 * EXAMPLE ROUTES WITH HEADERS
 * ============================================================================
 */

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "Diagramify API is running!",
    status: "success",
    timestamp: new Date().toISOString(),
  });
});

// Example: Reading request headers
app.get("/api/headers-demo", (req, res) => {
  // Access all headers
  const headers = req.headers;

  // Access specific headers
  const contentType = req.headers["content-type"];
  const authorization = req.headers["authorization"];
  const userAgent = req.headers["user-agent"];
  const origin = req.headers["origin"];

  res.json({
    message: "Here are the headers you sent:",
    allHeaders: headers,
    specific: {
      contentType,
      authorization,
      userAgent,
      origin,
    },
  });
});

// Example: Setting custom response headers
app.get("/api/custom-headers", (req, res) => {
  // Set custom headers in response
  res.setHeader("X-Custom-Header", "Hello from backend!");
  res.setHeader("X-Request-Id", Math.random().toString(36).substring(7));
  res.setHeader("X-API-Version", "1.0.0");

  res.json({
    message: "Check the response headers in browser DevTools!",
    tip: "Open DevTools > Network tab > Click this request > Headers",
  });
});

// Example: Authentication with headers
app.get("/api/protected", (req, res) => {
  // Check Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "No authorization header provided",
      expected: "Authorization: Bearer <token>",
    });
  }

  // Authorization header format: "Bearer eyJhbGciOiJIUzI1NiIs..."
  const token = authHeader.split(" ")[1]; // Get the token part

  if (!token) {
    return res.status(401).json({
      error: "Invalid authorization format",
      expected: "Authorization: Bearer <token>",
    });
  }

  // In real app, you'd verify the token here
  // For now, just echo it back
  res.json({
    message: "Protected route accessed!",
    tokenReceived: token.substring(0, 20) + "...",
  });
});

// Example: CORS preflight (OPTIONS request)
app.options("/api/test-cors", (req, res) => {
  // The cors middleware already handles this!
  // But if you need custom logic:
  console.log("Preflight request received");
  res.sendStatus(204); // No Content
});

/**
 * ============================================================================
 * CREDENTIALS IN ACTION
 * ============================================================================
 */

// Example: Setting a cookie (requires credentials: true)
app.post("/api/set-cookie", (req, res) => {
  // Set a cookie in the response
  res.cookie("demo-cookie", "hello-from-server", {
    httpOnly: true, // Can't be accessed by JavaScript (security!)
    secure: process.env.NODE_ENV === "production", // Only HTTPS in production
    sameSite: "none", // Required for cross-origin cookies
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  res.json({
    message: "Cookie set!",
    note: "Check Application tab in DevTools to see the cookie",
    important: "Frontend must use credentials: 'include' to receive this",
  });
});

// Example: Reading a cookie (requires credentials: true)
app.get("/api/read-cookie", (req, res) => {
  // Note: You need cookie-parser middleware to read cookies easily
  // For now, cookies are in req.headers.cookie as a string

  const cookies = req.headers.cookie;

  if (!cookies) {
    return res.json({
      message: "No cookies received",
      note: "Did frontend send credentials: 'include'?",
    });
  }

  res.json({
    message: "Cookies received!",
    cookies: cookies,
    note: "Install cookie-parser middleware for easier cookie handling",
  });
});

/**
 * ============================================================================
 * ERROR HANDLING
 * ============================================================================
 */

// 404 handler - must be AFTER all routes
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.url,
    method: req.method,
  });
});

// Error handler - must be LAST
app.use((err, req, res, next) => {
  console.error("Error:", err);

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;

/**
 * ============================================================================
 * SUMMARY: KEY CONCEPTS
 * ============================================================================
 *
 * 1. CORS:
 *    - Allows cross-origin requests (frontend on 5173, backend on 5000)
 *    - Configure origin, methods, headers
 *
 * 2. credentials: true
 *    - Allows cookies and auth headers in cross-origin requests
 *    - Backend sets: cors({ credentials: true })
 *    - Frontend sets: fetch(url, { credentials: 'include' })
 *
 * 3. Headers:
 *    - Metadata about requests/responses
 *    - Read: req.headers.authorization
 *    - Set: res.setHeader('X-Custom', 'value')
 *
 * 4. Middleware Order Matters:
 *    CORS → JSON parser → Your routes → 404 → Error handler
 *
 * 5. Common Headers:
 *    - Content-Type: Data format (JSON, HTML, etc.)
 *    - Authorization: Auth token
 *    - Cookie: Browser-stored data
 *    - Origin: Where request came from
 */
