const corsOptions = {
  origin: ["http://localhost:5173", "https://diagramify-theta.vercel.app"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin"],
};

export default corsOptions;
