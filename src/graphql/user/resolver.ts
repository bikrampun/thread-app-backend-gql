import UserService, { CreateUserPayload } from "../../services/user.service";

const queries = {
    getUserToken: async (_: any, payload: { email: string; password: string }) => {
        const res = await UserService.getUserToken(payload);
        return res;
    },
    getCurrentLoggedInUser: async (_: any, __: any, context: any) => {
        console.log(context);
        if (context && context.user) {
            const id = context.user.id;
            const user = await UserService.getUserById(id);
            return user;
        }
        throw new Error("User not found");
    }
};

const mutations = {
    createUser: async (_: any, payload: CreateUserPayload) => {
        const res = await UserService.createUser(payload);
        return res.id;
    },
};

export const resolvers = { queries, mutations };