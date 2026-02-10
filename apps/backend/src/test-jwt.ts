import "dotenv/config"; // 👈 THIS LINE IS CRITICAL
import { generateAccessToken,generateRefreshToken } from "./utils/jwt.utils";

const token = generateAccessToken({
  userId: "test123",
  role: "USER",
  verified: true,
});
const refreshToken = generateRefreshToken({
  userId: "test123",
});
console.log("JWT ACCESS TOKEN:", token);
console.log("JWT REFRESH TOKEN:", refreshToken);
