// backend\src\types.d.ts
import { Request } from 'express';

// Extend the Express Request type
declare global {
  namespace Express {
    interface Request {
      userId: string; // Add userId property
    }
  }
}



// Attach the userId from the token to the request so controllers know which user is making the request.
// Using req.userId is cleaner, but TypeScript doesn’t know about it by default, so we either need to declare it in types.d.ts
// or use req.body.userId to avoid type errors.
