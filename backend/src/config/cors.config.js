const corsOptions = {
  origin: function (origin, callback) {
    // List of allowed origins
    const allowedOrigins = [
      "http://localhost:5173", // Vite dev server (React)
      "http://localhost:3000", // Create React App (if using CRA)
      "http://127.0.0.1:5173", // Alternative localhost format
      // Add your production frontend URL here later:
      // 'https://yourapp.com',
      // 'https://www.yourapp.com'
    ];

    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true); // Allow this origin
    } else {
      callback(new Error("Not allowed by CORS")); // Block this origin
    }
  },

  /**
   * credentials: Allow cookies and authentication headers
   *
   * Set to TRUE if you're using:
   * - Cookies for sessions
   * - JWT tokens in cookies
   * - HTTP authentication
   *
   * When true:
   * - Backend allows credentials in requests
   * - Frontend MUST set credentials: 'include' in fetch/axios
   *
   * When false:
   * - No cookies or auth headers sent
   * - Suitable for public APIs
   */
  credentials: true,

  /**
   * methods: Which HTTP methods are allowed
   *
   * Common methods:
   * - GET: Read data
   * - POST: Create data
   * - PUT: Update entire resource
   * - PATCH: Update partial resource
   * - DELETE: Remove data
   * - OPTIONS: Preflight check (browser does this automatically)
   */
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  /**
   * allowedHeaders: Which request headers are allowed
   *
   * Common headers:
   * - Content-Type: What format is the data (JSON, form data, etc.)
   * - Authorization: JWT token or API key
   * - Custom headers your app uses
   */
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],

  /**
   * exposedHeaders: Which response headers the frontend can access
   *
   * By default, browsers only expose safe headers like Content-Type.
   * If your backend sends custom headers, list them here so frontend can read them.
   *
   * Example: If you send a custom 'X-Total-Count' header for pagination,
   * the frontend can't read it unless you expose it here.
   */
  exposedHeaders: ["X-Total-Count", "X-Auth-Token"],

  /**
   * maxAge: How long (in seconds) the browser should cache the preflight response
   *
   * Preflight = OPTIONS request the browser makes before actual request
   *
   * 600 seconds = 10 minutes
   * This reduces the number of OPTIONS requests
   */
  maxAge: 600,

  /**
   * preflightContinue: Whether to pass preflight response to next handler
   *
   * false (default): CORS handles OPTIONS requests automatically
   * true: You handle OPTIONS requests manually (rare)
   */
  preflightContinue: false,

  /**
   * optionsSuccessStatus: Status code for successful OPTIONS requests
   *
   * 204 = No Content (recommended for OPTIONS)
   * 200 = OK (legacy browsers)
   */
  optionsSuccessStatus: 204,
};

export default corsOptions;

/**
 * ============================================================================
 * HOW CORS WORKS - Step by Step
 * ============================================================================
 *
 * 1. SIMPLE REQUEST (GET, POST with simple headers)
 *
 *    Frontend (localhost:5173):
 *      fetch('http://localhost:5000/api/diagrams')
 *
 *    Browser:
 *      "This is cross-origin! Let me check if it's allowed..."
 *      Sends request with header: Origin: http://localhost:5173
 *
 *    Backend (localhost:5000):
 *      CORS middleware checks: Is localhost:5173 in allowedOrigins?
 *      Yes! Responds with: Access-Control-Allow-Origin: http://localhost:5173
 *
 *    Browser:
 *      "Backend says it's okay! I'll let the frontend see the response."
 *
 *
 * 2. PREFLIGHT REQUEST (PUT, DELETE, custom headers)
 *
 *    Frontend:
 *      fetch('http://localhost:5000/api/diagrams/123', {
 *        method: 'DELETE',
 *        headers: { 'Authorization': 'Bearer token' }
 *      })
 *
 *    Browser:
 *      "This is complex! I need to ask permission first..."
 *
 *      Step 1: Sends OPTIONS request (preflight)
 *        OPTIONS /api/diagrams/123
 *        Origin: http://localhost:5173
 *        Access-Control-Request-Method: DELETE
 *        Access-Control-Request-Headers: Authorization
 *
 *    Backend:
 *      CORS middleware checks permissions and responds:
 *        Access-Control-Allow-Origin: http://localhost:5173
 *        Access-Control-Allow-Methods: DELETE
 *        Access-Control-Allow-Headers: Authorization
 *        Access-Control-Allow-Credentials: true
 *
 *    Browser:
 *      "Great! Backend approves. Now I'll send the real request."
 *
 *      Step 2: Sends actual DELETE request
 *        DELETE /api/diagrams/123
 *        Authorization: Bearer token
 *
 *
 * ============================================================================
 * CREDENTIALS: TRUE - What It Means
 * ============================================================================
 *
 * WITHOUT credentials:true
 *
 *    Frontend:
 *      fetch('http://localhost:5000/api/diagrams')
 *      // Browser does NOT send cookies or auth headers automatically
 *
 *    Backend:
 *      req.cookies.token  // undefined (no cookies received)
 *
 *
 * WITH credentials:true
 *
 *    Frontend:
 *      fetch('http://localhost:5000/api/diagrams', {
 *        credentials: 'include'  // Must specify this!
 *      })
 *      // Browser SENDS cookies, auth headers automatically
 *
 *    Backend:
 *      cors({ credentials: true })  // Must allow this!
 *      req.cookies.token  // "eyJhbGciOiJIUzI1NiIs..." (cookie received!)
 *
 *
 * ============================================================================
 * COMMON CORS ERRORS & SOLUTIONS
 * ============================================================================
 *
 * Error 1: "No 'Access-Control-Allow-Origin' header is present"
 *   Problem: CORS not configured or wrong origin
 *   Solution: Add cors middleware with correct origin
 *
 * Error 2: "The 'Access-Control-Allow-Origin' header contains multiple values"
 *   Problem: CORS configured multiple times
 *   Solution: Only use app.use(cors()) ONCE
 *
 * Error 3: "Credential is not supported if the CORS header 'Access-Control-Allow-Origin' is '*'"
 *   Problem: credentials:true with origin:'*' (allow all)
 *   Solution: Specify exact origins, don't use wildcard with credentials
 *
 * Error 4: "Method DELETE is not allowed by Access-Control-Allow-Methods"
 *   Problem: DELETE not in allowed methods
 *   Solution: Add 'DELETE' to methods array
 *
 * Error 5: "Request header field Authorization is not allowed"
 *   Problem: Authorization not in allowedHeaders
 *   Solution: Add 'Authorization' to allowedHeaders array
 *
 *
 * ============================================================================
 * PRODUCTION VS DEVELOPMENT
 * ============================================================================
 *
 * Development:
 *   - Allow localhost origins
 *   - credentials: true (for testing auth)
 *   - Relaxed security
 *
 * Production:
 *   - Only allow your actual domain
 *   - credentials: true (if using cookies/auth)
 *   - Strict origin checking
 *   - Use environment variables for origins
 *
 * Example:
 *   const allowedOrigins = process.env.NODE_ENV === 'production'
 *     ? ['https://yourapp.com']
 *     : ['http://localhost:5173', 'http://localhost:3000'];
 */
