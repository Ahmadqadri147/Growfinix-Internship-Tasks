import "express";

declare module "express" {
  interface Request {
    user?: {
      userId: string;
      email: string;
      role: string;
    };
  }
}

interface ParsedQs {
  [key: string]: string | undefined;
}

declare namespace Express {
  interface Request {
    query: ParsedQs;
  }
}
