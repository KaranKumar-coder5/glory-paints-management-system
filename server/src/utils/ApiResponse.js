class ApiResponse {
  static send(res, statusCode, message, data = null) {
    const response = {
      success: statusCode >= 200 && statusCode < 300,
      message,
    };
    if (data !== null) {
      response.data = data;
    }
    return res.status(statusCode).json(response);
  }

  static success(res, data, message = "Success") {
    return this.send(res, 200, message, data);
  }

  static created(res, data, message = "Created successfully") {
    return this.send(res, 201, message, data);
  }

  static paginated(res, items, pagination, message = "Success") {
    return this.send(res, 200, message, { items, pagination });
  }
}

module.exports = ApiResponse;
