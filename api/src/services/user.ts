import { db } from "../db";

class UserService {

    async getUserById(id: string) {
        const user = await db.user.findUnique({
            where: {
                id,
            },
        });
        return user;
    }
    async getUserByEmail(email: string) {
        const user = await db.user.findUnique({
            where: {
                email,
            },
        });
        return user;
    }

    async getUserByUsername(username: string) {
        const user = await db.user.findUnique({
            where: {
                username,
            },
        });
        return user;
    }

    async createUser(email: string, password: string, username: string) {
        const user = await db.user.create({
            data: {
                email,
                password,
                username,
            },
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true,
            }
        });
        return user;
    }

    async createSession(userId: string, token: string, expiresAt: Date) {
        const session = await db.session.create({
            data: {
                userId,
                token,
                expiresAt,
            },
            select: {
                id: true,
                userId: true,
                token: true,
                expiresAt: true,
            }
        });
        return session;
    }

    async deleteSession(token: string) {
        const session = await db.session.deleteMany({
            where: {
                token,
            },
        });
        return session;
    }
}

export default new UserService();