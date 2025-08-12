import type { ParseClient } from "seyfert";
import { Client } from "seyfert";

import { logger } from "./utils/logger";
import { PrismaClient } from "./generated/prisma";

export const prisma = new PrismaClient();
logger.info("Prisma initialized");

declare module "seyfert" {
  interface UsingClient extends ParseClient<Client<true>> {}
}
const client = new Client();

client.start().then(() => {
  logger.info("FSD Online");
  return client.uploadCommands({ cachePath: "./commands.json" });
});
