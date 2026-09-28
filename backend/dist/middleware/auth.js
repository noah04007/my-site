"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_js_1 = require("../database/db.js");
const JWT_SECRET = process.env.JWT_SECRET || 'winter-arc-hyper-secret-key-2026';
function generateToken(user) {
    return jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '90d' });
}
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: No token provided' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = db_js_1.db.findUserById(decoded.id);
        if (!user) {
            res.status(401).json({ error: 'User not found' });
            return;
        }
        req.user = user;
        next();
    }
    catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
