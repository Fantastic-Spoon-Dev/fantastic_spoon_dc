import { Client } from "seyfert";
import puppeteer from "puppeteer"; 

import type { ParseClient } from "seyfert";

import { PrismaClient } from "./generated/prisma";

export const prisma = new PrismaClient()
declare module 'seyfert' {
    interface UsingClient extends ParseClient<Client<true>> { }
}

const client = new Client();
 
export const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sanbox']
});

const cleanup = async () => {
    console.log('Closing browser...');
    await browser.close();
    process.exit();
};

process.on('SIGINT', cleanup); 
process.on('SIGTERM', cleanup); 
process.on('uncaughtException', async (err) => {
    console.error('Uncaught Exception:', err);
    await cleanup();
});
process.on('unhandledRejection', async (err) => {
    console.error('Unhandled Rejection:', err);
    await cleanup();
});

client.start()
  .then(() => client.uploadCommands({ cachePath: './commands.json' }));