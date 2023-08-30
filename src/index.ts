import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

async function startApolloServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // create GraphQL server
  const gqlServer = new ApolloServer({
    typeDefs: `
        type Query {
            hello: String
            sayHello(name: String): String
        }
    `,
    resolvers: {
      Query: {
        hello: () => "Hello world! This is GraphQL server",
        sayHello: (_: any, { name }: {name: string}) => `Hello ${name}!`,
      },
    },
  });

  await gqlServer.start();

  app.get("/", (req, res) => {
    res.json({ message: "Server is up and running" });
  });

  app.use("/graphql", expressMiddleware(gqlServer));
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

startApolloServer();
