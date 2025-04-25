import { Client } from "seyfert";
import puppeteer from "puppeteer"; 

import type { ParseClient } from "seyfert";

declare module 'seyfert' {
    interface UsingClient extends ParseClient<Client<true>> { }
}

const client = new Client();
 
export const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sanbox']
});

// 处理正常退出和异常退出
const cleanup = async () => {
    console.log('Closing browser...');
    await browser.close();
    process.exit();
};

// 监听进程的退出信号
process.on('SIGINT', cleanup);  // Ctrl+C
process.on('SIGTERM', cleanup); // kill 命令
process.on('uncaughtException', async (err) => {
    console.error('Uncaught Exception:', err);
    await cleanup();
});
process.on('unhandledRejection', async (err) => {
    console.error('Unhandled Rejection:', err);
    await cleanup();
});

// This will start the connection with the Discord gateway and load commands, events, components, and language (i18n)
client.start()
  .then(() => client.uploadCommands({ cachePath: './commands.json' }));