

import { verifyToken } from "../lib/utils.ts";
import User from "../models/User.ts";

// auth middleware
export const protectedRoute = async (req: any, res: any, next: any) => {
    try {
        const token = req.headers.token;

        const decoded = verifyToken(token);
        if (!token) {
            return res.json({ success: false, message: 'No token provided' });
        }
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message });
    }
}
