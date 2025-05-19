import argon2 from "argon2";

const hashPassword = async (password: string) => {
    const hashedPassword = await argon2.hash(password);
    return hashedPassword;
}

const verifyPassword = async (password: string, hashedPassword: string) => {
    const isValid = await argon2.verify(hashedPassword, password);
    return isValid;
}

export { hashPassword, verifyPassword };