import type { UserDocument } from "@models";

declare global {
  namespace Express {
    interface Request {
      uid?: string;
      user?: UserDocument;
    }
  }
}

export {};
