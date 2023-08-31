import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import createApolloServer from "./graphql";
import { User } from "./graphql/user";
import UserService from "./services/user.service";

async function startApolloServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json());

  
  app.get("/", (req, res) => {
    res.json({ message: "Server is up and running" });
  });
  
  // create GraphQL server with Apollo Server
  app.use("/graphql", expressMiddleware(await createApolloServer(), { context: async ({ req }) => {
    const token = req.headers["token"]
    try {
      const user = await UserService.decodeToken(token as string);
      return { user }
    } catch (e) {
      return {}
    }

  }}));
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

startApolloServer();
