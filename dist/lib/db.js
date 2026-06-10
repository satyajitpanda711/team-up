"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
async function connectDB() {
    if (mongoose_1.default.connection.readyState >= 1)
        return;
    return mongoose_1.default.connect(process.env.MONGODB_URI);
}
// this is db.ts
