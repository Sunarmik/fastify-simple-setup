import axios from "axios";
import { Type } from "@sinclair/typebox";
import * as EmailValidator from "email-validator";
import {
  FastifyError,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify";

enum Challenges {
  development,
  uiux,
  qa,
  integrations,
  maintenance,
  consultancy,
}

enum Budget {
  "10k" = "Less than $10k",
  "30k" = "Around $30k",
  "nolimit" = "Budget is not a constraint",
}


async function validateHuman(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  return await axios
    .post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`
    )
    .then((response) => {
      const data = response.data;
      if (data.success) {
        return true;
      }
      return false;
    })
    .catch((error) => {
      console.error(error);
      return false;
    });
}


const routes: FastifyPluginAsync = async (server) => {
  server.get(
    "/health-check",
    {
      schema: {
        response: {
          200: Type.Object({
            status: Type.String(),
          }),
        },
      },
      preHandler: server.rateLimit({
        max: 2,
        timeWindow: 500,
        ban: 2
      })
    },
    async function () {
      const status = await this.mongo.db?.command({ ping: 1 });
      if (status?.ok) {
        return { status: "Healthy" };
      }
      this.log.fatal(`DB Ping test failed. ${JSON.stringify(status)}`);
      return { status: "Unhealthy" };
    }
  );

  /**
   * @description save user queries
   */
  server.post(
    "/save-query",
    {
      schema: {
        body: {
          type: "object",
          required: [
            "services",
            "budget",
            "email",
            "name",
            "isNDAAgreementRequired",
          ],
          properties: {
            services: {
              type: "array",
              items: {
                type: "string",
                enum: Object.values(Challenges),
              },
            },
            budget: {
              type: "string",
              enum: Object.values(Budget),
            },
            email: {
              type: "string",
              maxLength: 50,
            },
            name: {
              type: "string",
              maxLength: 50,
            },
            isNDAAgreementRequired: {
              type: "boolean",
            },
            contactNumber: {
              type: "string",
              maxLength: 15,
            },
            clientMessage: {
              type: "string",
              maxLength: 500,
            },
            token: {
              type: "string",
              maxLength: 1000,
            },
          },
        },
      },
      preHandler: server.rateLimit({
        max: 100,
        timeWindow: 1000,
        ban: 2
      }),
      errorHandler: function (
        error: FastifyError,
        _: FastifyRequest,
        reply: FastifyReply
      ) {
        switch (error.message) {
          case "body must have required property 'services'":
            return reply.code(400).send(new Error("Services is required."));
          case "body must have required property 'budget'":
            return reply.code(400).send(new Error("Budget is required."));
          case "body must have required property 'email'":
            return reply.code(400).send(new Error("Email is required."));
          case "body must have required property 'name'":
            return reply.code(400).send(new Error("Name is required."));
          case "body must have required property 'isNDAAgreementRequired'":
            return reply.code(400).send(new Error("NDA is required."));
          default:
            server.log.error(error);
            return reply.code(400).send(new Error("Invalid input."));
        }
      },
    },
    async function (
      req: FastifyRequest<{
        Body: {
          services: Array<string>;
          budget: string;
          email: string;
          name: string;
          isNDAAgreementRequired: boolean;
          contactNumber: string;
          clientMessage: string;
          token: string;
        };
      }>,
      reply
    ) {
      const {
        services,
        budget,
        contactNumber,
        email,
        name,
        isNDAAgreementRequired,
        clientMessage,
        token,
      } = req.body;
      const human = await validateHuman(token);
      if (!human) {
        reply.code(400);
        reply.send({ errors: ["Please, you're not fooling us, bot."] });
        return;
      }
      if (!EmailValidator.validate(email)) {
        return reply.code(400).send(new Error("Invalid input."));
      }
      const collection = this.mongo.db?.collection("projectRequirements");
      const records = await collection
        ?.find({
          $or: [{ email }, { contactNumber: contactNumber || "" }],
        })
        .project({ _id: 1 });
      const parsedRecords = await records?.toArray();
      if (parsedRecords?.length && parsedRecords.length > 5) {
        server.log.warn(
          `User with email ${email} is retrying to save the info as \n ${JSON.stringify(
            req.body
          )}`
        );
        return reply
          .code(200)
          .send({ status: "success", message: "Thank you." });
      }

      const clientReq = {
        services,
        budget,
        contactNumber,
        email,
        name,
        isNDAAgreementRequired,
        clientMessage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      server.log.info(`Saving new request: \n ${JSON.stringify(clientReq)}`);
      await collection?.insertOne(clientReq);
      await server.sendEmail(email,'Hello from ArhulTech',`<html><body>Thank you for contacting us.<br/>We will get back to you soon.</body></html>`)
      reply.code(201).send({ status: "success", message: "Thank You" });
    }
  );
};

export default routes;
