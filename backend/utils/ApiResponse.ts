class ApiResponse {
    success: boolean;
    message: string;
    result: any;
    statusCode: number;

    constructor(statusCode: number, message: string = "Success", result: any = null) {
        this.statusCode = statusCode;
        this.message = message;
        this.result = result;
        this.success = statusCode < 400;
    }
}

export { ApiResponse };
