import { Client } from "seyfert";
import puppeteer from "puppeteer"; 
import { pino } from "pino";
import fs from "fs";
import pretty from "pino-pretty";

import type { ParseClient } from "seyfert";

import { PrismaClient } from "./generated/prisma";

let streams = [
  {stream: fs.createWriteStream('./logs/info.stream.out')},
  {stream: pretty()},
  {level: 'debug', stream: fs.createWriteStream('./logs/debug.stream.out')},
  {level: 'fatal', stream: fs.createWriteStream('./logs/fatal.stream.out')}
]

export const logger = pino({
  level: 'debug',
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
    }
  }
}, pino.multistream(streams))

export const prisma = new PrismaClient()
declare module 'seyfert' {
    interface UsingClient extends ParseClient<Client<true>> { }
}

const client = new Client();

export const browser = await puppeteer.connect({
  browserWSEndpoint: 'ws://chrome:3000'
})

client.start()
  .then(() => client.uploadCommands({ cachePath: './commands.json' }))

logger.info("ONLINE")