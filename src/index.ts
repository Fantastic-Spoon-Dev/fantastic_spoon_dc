import type { ParseClient } from "seyfert";
import { Client, extendContext, Interaction } from "seyfert";

import { logger } from "./utils/logger";
import { PrismaClient } from "./generated/prisma";

logger.info("Initializing prisma...");
export const prisma = new PrismaClient();
logger.info("Prisma initialized");

declare module "seyfert" {
  interface UsingClient extends ParseClient<Client<true>> {}
}
const client = new Client();

logger.info("Staring FSD");
client.start().then(() => {
  logger.info("FSD Online");
  return client.uploadCommands({ cachePath: "./commands.json" });
});
