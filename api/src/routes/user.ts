import { Router } from "express";
import { RedisManager } from "../RedisManager";
import { USER_BALANCE } from "../types";
import { createUserSchema, signinSchema } from "../types/users";
import { hashPassword, verifyPassword } from "../utils";
import UserService from "../services/user";
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from "../middleware/auth";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "1d";

export const userRouter = Router();

userRouter.get("/me", authenticate, async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const user = await UserService.getUserById(req.user.id);
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    res.json({
        id: user.id,
        email: user.email,
        username: user.username
    });
});

userRouter.get("/balance", async (req, res) => {
    const response = await RedisManager.getInstance().sendAndAwait({
        type: USER_BALANCE,
        data: {
            userId: req.query.userId as string,
        }
    });
    res.json(response.payload);
})

userRouter.post("/signup", async (req, res) => {
    try {
        const parsedBody = createUserSchema.safeParse(req.body);
        if (!parsedBody.success) {
            res.status(411).json({
                error: "Invalid payload",
            });
            return;
        }

        const existingUser = await UserService.getUserByEmail(parsedBody.data.email);
        if (existingUser) {
            res.status(409).json({
                error: "User already exists",
            });
            return;
        }

        const existingUsername = await UserService.getUserByUsername(parsedBody.data.username);
        if (existingUsername) {
            res.status(409).json({
                error: "Username already exists",
            });
            return;
        }

        const hashedPassword = await hashPassword(parsedBody.data.password);
        const user = await UserService.createUser(
            parsedBody.data.email,
            hashedPassword,
            parsedBody.data.username
        );

        res.status(201).json({
            message: "User created successfully",
            user,

        })
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });

    }
})

userRouter.post("/signin", async (req, res) => {
    try {
        const parsedBody = signinSchema.safeParse(req.body);
        if (!parsedBody.success) {
            res.status(411).json({
                error: "Invalid payload",
            });
            return;
        }

        const user = await UserService.getUserByEmail(parsedBody.data.email);
        if (!user) {
            res.status(401).json({
                error: "Invalid credentials",
            });
            return;
        }

        const isPasswordValid = await verifyPassword(parsedBody.data.password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                error: "Invalid credentials",
            });
            return;
        }


        const token = uuidv4();

        const expiresAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)

        await UserService.createSession(user.id, token, expiresAt);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            }
        });
    } catch (error) {
        console.error("Error signing in user:", error);
        res.status(500).json({ error: "Internal server error" });

    }
})

userRouter.post("/signout", authenticate, async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const token = req.headers.authorization?.split(" ")[1];

    await UserService.deleteSession(token ? token : "");

    res.json({
        message: "Logout successful",
    });
})