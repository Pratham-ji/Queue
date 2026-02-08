"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginAfterOtp = void 0;
// src/modules/auth/auth.service.ts
const jwt_utils_1 = require("../utils/jwt.utils");
const loginAfterOtp = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = (0, jwt_utils_1.generateAccessToken)({
        userId: user.id,
        role: user.role,
        verified: true,
    });
    const refreshToken = (0, jwt_utils_1.generateRefreshToken)({
        userId: user.id,
    });
    return {
        accessToken,
        refreshToken,
    };
});
exports.loginAfterOtp = loginAfterOtp;
