

import { verifyToken } from "../lib/utils.js";
import User from "../models/User.js";

// auth middleware
export const protectedRoute = async (req: any, res: any, next: any) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided or invalid token format. Use Bearer token.' 
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        // Verify token
        const decoded = verifyToken(token);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid or expired token' 
            });
        }

        // Find user and attach to request
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        req.user = user;
        next();
    } catch (error: any) {
        console.error('Auth Middleware Error:', error);
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication failed',
            error: error?.message || 'Unknown error occurred'
        });
    }
}
