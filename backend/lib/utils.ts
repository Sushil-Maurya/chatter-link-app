import jwt from "jsonwebtoken";

export const generateToken = (userId: string) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
}

export const verifyToken = (token: string) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
}
