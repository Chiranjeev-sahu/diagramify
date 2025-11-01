const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELET", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin"],
};

export default corsOptions;
