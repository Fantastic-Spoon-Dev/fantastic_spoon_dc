import type { ParseClient } from "seyfert";
import { Client } from "seyfert";

import { logger } from "./utils/logger";
import { PrismaClient } from "./generated/prisma";

export const prisma = new PrismaClient()
declare module 'seyfert' {
	interface UsingClient extends ParseClient<Client<true>> {
	}
}
logger.info("Initializing prisma...");
const client = new Client();
logger.info("Prisma initialized");

logger.info("Staring FSD")
client.start()
	.then(() => {
		logger.info("FSD Online")
		return client.uploadCommands({cachePath: './commands.json'});
	});

