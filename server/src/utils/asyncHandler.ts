import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<any>;

const asyncHandler =
  (handler: AsyncRequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch((err) => next(err));
  };
export default asyncHandler;
// const asyncHandlerAsyncAwait = (fn) => async (req, res, next) => {
//   try {
//     // Execute the provided asynchronous function (fn) with the Express request, response, and next parameters
//     await fn(req, res, next);
//   } catch (error) {
//     // If an error occurs during execution, handle it by sending an error response
//     res.status(error.code || 500).json({
//       success: false,
//       message: error.message || "Internal Server Error",
//     });
//   }
// };
