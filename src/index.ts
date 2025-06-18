import { Client } from "seyfert";
import puppeteer from "puppeteer";

import type { ParseClient } from "seyfert";

import { logger } from "./utils/logger";
import { PrismaClient } from "./generated/prisma";

export const prisma = new PrismaClient()
declare module 'seyfert' {
    interface UsingClient extends ParseClient<Client<true>> { }
}

const client = new Client();

export const browser = await puppeteer.connect({
  browserWSEndpoint: 'ws://chrome:3000'
})

client.start()
    .then(() => {
        logger.info("FSD ONLINE")
        return client.uploadCommands({ cachePath: './commands.json' });
    });
