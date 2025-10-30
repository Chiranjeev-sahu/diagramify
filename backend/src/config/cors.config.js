const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin"],
  exposedHeaders: ["X-Total-Count", "X-Auth-Token"],
  maxAge: 600,
};

export default corsOptions;
