import zod from 'zod';

const createUserSchema = zod.object({
    email: zod.string().email(),
    password: zod.string().min(8),
    username: zod.string().min(3),
})

const signinSchema = zod.object({
    email: zod.string().email(),
    password: zod.string().min(8),
})

export {createUserSchema, signinSchema}