import { verifyAccessToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {

  let token = null;
  const header = req.headers["authorization"];
  
  if (header && header.startsWith("Bearer ")) {
    token = header.split(" ")[1];
  }

  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
