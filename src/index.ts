import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

import * as dotenv from "dotenv";
import { prismaClient } from "./lib/db";

dotenv.config(); // Load the environment variables
console.log(`The connection URL is ${process.env.DATABASE_URL}`);

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
        type Mutation {
          createUser(firstName: String!, lastName: String!, email: String!, password: String!): Boolean!
        }
    `,
    resolvers: {
      Query: {
        hello: () => "Hello world! This is GraphQL server",
        sayHello: (_: any, { name }: { name: string }) => `Hello ${name}!`,
      },
      Mutation: {
        createUser: async (
          _: any,
          {
            firstName,
            lastName,
            email,
            password,
          }: {
            firstName: string;
            lastName: string;
            email: string;
            password: string;
          }
        ) => {
          await prismaClient.user.create({
            data: {
              firstName,
              lastName,
              email,
              password,
              salt: "random_salt",
            },
          });
          return true;
        },
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
