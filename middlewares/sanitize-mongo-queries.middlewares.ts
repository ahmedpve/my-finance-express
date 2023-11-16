import { NextFunction, Request, Response } from "express";

export default async function sanitizeMongoQuery(req: Request, res: Response, next: NextFunction) {
  const sanitizedQueryStr = JSON.stringify(req.query).replace(/\$/g, "");
  const sanitizedQuery = JSON.parse(sanitizedQueryStr);
  req.query = sanitizedQuery;

  const sanitizedBodyStr = JSON.stringify(req.body).replace(/\$/g, "");
  const sanitizedBody = JSON.parse(sanitizedBodyStr);
  req.body = sanitizedBody;

  next();
}
