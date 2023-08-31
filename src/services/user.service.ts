import { prismaClient } from "../lib/db";
import { createHmac, randomBytes } from "crypto";
import JWT from "jsonwebtoken";

const JWT_SECRET = "$uper$ecret$tring";

export interface CreateUserPayload {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
}

export interface GetUserTokenPayload {
  email: string;
  password: string;
}

class UserService {
  private static generateHash(salt: string, password: string) {
    const hash = createHmac("sha512", salt).update(password).digest("hex");
    return hash;
  }

  public static createUser(payload: CreateUserPayload) {
    const { firstName, lastName, email, password } = payload;
    const salt = randomBytes(16).toString("hex");

    const hash = UserService.generateHash(salt, password);

    return prismaClient.user.create({
      data: {
        firstName,
        lastName,
        email,
        salt,
        password: hash,
      },
    });
  }

  private static async getUserByEmail(email: string) {
    return prismaClient.user.findUnique({
      where: {
        email,
      },
    });
  }
  public static async getUserToken(payload: GetUserTokenPayload) {
    const { email, password } = payload;
    const user = await UserService.getUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    const userSalt = user.salt;
    const hash = UserService.generateHash(userSalt, password);

    if (hash !== user.password) {
      throw new Error("Invalid password");
    }

    // Generate token
    const token = JWT.sign({ id: user.id, email: user.email }, JWT_SECRET);
    return token;
  }
}

export default UserService;
