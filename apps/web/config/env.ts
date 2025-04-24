const env = {
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || "",
  NEXT_PUBLIC_SOCKET_URL:
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
};

export default env;
