import { Request, Response, NextFunction } from 'express';
import { db } from '../db';

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
         res.status(401).json({ message: 'Missing or invalid token' });
        return;
    }

    const token = authHeader.split(' ')[1];

    const session = await db.session.findFirst({
        where: {
            token,
            expiresAt: {
                gte: new Date()
            }
        },
        include: {
            user: true
        }
    });

    if (!session) {
        res.status(401).json({ message: 'Session expired or invalid' });
        return;
    }

    req.user = session.user
    next();
}