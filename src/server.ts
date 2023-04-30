import fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import config from "./plugins/config.js";
import routes from "./routes/index.js";
import mongodbPlugin from "@fastify/mongodb";
import mailer from "./plugins/mailer.js";
const server = fastify({
  ajv: {
    customOptions: {
      removeAdditional: "all",
      coerceTypes: true,
      useDefaults: true,
    },
  },
  logger: {
    level: process.env.LOG_LEVEL,
  },
});

await server.register(cors, {
  origin: [
    "http://localhost:3000",
    "https://www.arhultech.com",
    "https://stoneapple-git-stoneapplefrontend-sunarmik.vercel.app",
    "https://stoneapple-git-develop-sunarmik.vercel.app",
  ],
  methods: "POST, OPTIONS",
});
await server.register(helmet, { contentSecurityPolicy: false, global: true });
await server.register(config);
await server.register(rateLimit, {
  global: true,
  max: 2,
  timeWindow: 1000,
});
await server.register(mongodbPlugin, {
  forceClose: true,
  database: server.config.MONGO_DB_NAME,
  url: `mongodb+srv://${server.config.MONGO_ATLAS_USERNAME}:${server.config.MONGO_ATLAS_PASSWORD}@${server.config.MONGO_SERVER_URI}/?retryWrites=true&w=majority`,
});
await server.register(routes);
await server.register(mailer);
await server.after();
await server.setNotFoundHandler({}, function (_, reply) {
  reply.code(404).send("You are hitting an invalid route. Don't do it.");
});
await server.ready();

export default server;
