export class ResponseHelper {
  static success(data: any, message = 'Success') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string, details?: any) {
    return {
      success: false,
      message,
      details: details || null,
      timestamp: new Date().toISOString(),
    };
  }
}
