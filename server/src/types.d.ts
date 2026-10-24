// Adds the authenticated user, set by the auth middleware, to Express's Request type.
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

export {};
