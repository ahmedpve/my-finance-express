export function getStatusMessage(statusCode: number) {
  let statusMessage: string;
  switch (true) {
    case statusCode >= 100 && statusCode < 200:
      statusMessage = "Information";
      break;
    case statusCode >= 200 && statusCode < 300:
      statusMessage = "Successful";
      break;
    case statusCode >= 300 && statusCode < 400:
      statusMessage = "Redirection";
      break;
    case statusCode >= 400 && statusCode < 500:
      statusMessage = "Client Error";
      break;
    default:
      statusMessage = "Server Error";
      break;
  }
  return statusMessage;
}

export default class OperationalError extends Error {
  statusCode: number;
  statusMessage: string;
  message: string;
  isOperational: boolean;

  constructor(statusCode: number, message: string) {
    super(message);

    this.statusCode = statusCode;
    this.statusMessage = getStatusMessage(statusCode);
    this.message = message;
    this.isOperational = true;
  }
}
