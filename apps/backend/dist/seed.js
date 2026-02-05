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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
// 1. Load Environment Variables
dotenv_1.default.config();
// 2. Initialize Client with Explicit URL
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("🌱 Seeding database...");
        // Create the Doctor
        const user = yield prisma.user.create({
            data: {
                email: "law@heartpirates.com",
                password: "securepassword", // In a real app, hash this!
                name: "Dr. Trafalgar Law",
                clinic: {
                    create: { name: "Heart Pirates Clinic" },
                },
            },
        });
        console.log("✅ Seeded doctor:", user.name);
    });
}
main()
    .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () { return yield prisma.$disconnect(); }));
