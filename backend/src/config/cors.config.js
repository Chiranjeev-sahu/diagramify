const corsOptions = {
  origin: true, // Allow all origins temporarily for deployment
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin"],
};

export default corsOptions;
