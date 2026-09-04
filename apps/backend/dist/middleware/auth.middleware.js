"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = exports.checkHospitalScope = exports.authorizeRoles = exports.requireAuth = void 0;
const jwt_1 = require("../config/jwt");
const requireAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                message: "Missing Authorization header",
                hint: "Send: Authorization: Bearer <token>"
            });
        }
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Invalid token format",
                hint: "Use 'Bearer <token>' format"
            });
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                message: "Empty token provided"
            });
        }
        const payload = (0, jwt_1.verifyToken)(token);
        req.user = {
            userId: payload.userId,
            role: payload.role,
        };
        next();
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return res.status(401).json({
            message: "Invalid or expired token",
            error: errorMessage
        });
    }
};
exports.requireAuth = requireAuth;
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
const checkHospitalScope = (req, res, next) => {
    var _a;
    const hospitalIdFromParams = req.params.hospitalId;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.hospitalId)) {
        return res.status(403).json({ message: "Hospital scope missing" });
    }
    if (req.user.hospitalId !== hospitalIdFromParams) {
        return res.status(403).json({ message: "Unauthorized hospital access" });
    }
    next();
};
exports.checkHospitalScope = checkHospitalScope;
// Export aliases for backward compatibility
exports.protect = exports.requireAuth;
const authorize = (...allowedRoles) => {
    return (0, exports.authorizeRoles)(...allowedRoles);
};
exports.authorize = authorize;
