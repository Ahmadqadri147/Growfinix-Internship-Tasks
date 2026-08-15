import { Request, Response, NextFunction } from "express";

export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export function validateObjectIdParam(param = "id") {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = String(req.params[param] ?? "");
    if (!isValidObjectId(value)) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }
    next();
  };
}
