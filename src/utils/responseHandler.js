import { StatusCodes } from "http-status-codes";

//send success response(200)

export const sendSuccess = (
  res,
  data = null,
  message = "Success",
  statusCode = StatusCodes.OK
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString,
  });
};

//send error response(500)
export const sendError = (
  res,
  message = "Something went wrong",
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
  errors = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  });
};

//send validation error
export const sendValidationError = (
  res,
  errors,
  message = "Validation Failed"
) => {
  return res.status(StatusCodes.BAD_REQUEST).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  });
};

//send unauthorized response
export const sendUnauthorized = (res, message = "Unauthorized access") => {
  return res.status(StatusCodes.UNAUTHORIZED).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
};
//send forbidden response (access dined)
export const sendForbidden = (res, message = "Access forbidden") => {
  return res.status(StatusCodes.FORBIDDEN).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
};
//send not found response(404)

export const sendNotFound = (res, message = "Resource not found") => {
  return res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
};

//send conflict response(HTTP 409)
export const sendConflict = (res, message = "Resource already exists") => {
  return res.status(StatusCodes.CONFILCT).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
};
