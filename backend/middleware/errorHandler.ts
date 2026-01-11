import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js"; // Note: .js extension for ES modules if needed, assuming Standard ES usage

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || error instanceof Error ? 500 : 400;
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode, message, error?.errors || [], error.stack);
    }

    const response = {
        ...error,
        message: error.message,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
    };

    // Remove errors array if empty to keep response clean
    if (response.errors && response.errors.length === 0) {
        delete response.errors;
    }

    res.status(error.statusCode).json(response);
};

export { errorHandler };
