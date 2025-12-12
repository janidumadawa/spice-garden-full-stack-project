// backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        req.userId = decoded.userId; // 'any' bypasses TS errors
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};



/* purpose
When frontend sends token, we decode it and attach req.userId 
so any protected API can identify user.

| Step                    | Meaning                                                         |
| ----------------------- | --------------------------------------------------------------- |
| Read token from headers | Frontend will send token as `Authorization: Bearer TOKEN_VALUE` |
| Verify token            | Checks if token is real and not expired                         |
| Decode user id          | We extract userId stored when login happened                    |
| Attach to request       | Now any route can access userId without needing cartId manually |

*/