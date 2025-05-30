import {
  AttachmentBuilder,
  Command,
  Declare,
  Options,
  createNumberOption,
  createStringOption,
  type CommandContext
} from 'seyfert';
import mc from "@ahdg/minecraftstatuspinger"
import { autoToHTML as motdParser } from '@sfirew/minecraft-motd-parser'; 
import type { motdJsonType } from '@sfirew/minecraft-motd-parser/types/types';
import { browser, prisma } from '../index.ts';

interface Status {
  description: motdJsonType;
  players: { max: number; online: number };
  version: { name: string; protocol: number };
  favicon: string;
}

const options = {
  ip: createStringOption({
    description: "Server IP",
  }),
  port: createNumberOption({
    description: "Server Port"
  }),
};
 
@Declare({
  name: 'mcs',
  description: 'Qeury a Minecraft server',
})
@Options(options)
export default class McsCommand extends Command {
 
  async run(ctx: CommandContext<typeof options>) {
    if (ctx.options.ip && !/^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?$/.test(ctx.options.ip)) {
      await ctx.write({
        content: 'Invalid IP address'
      })
      return
    }
    const res = await prisma.mcsBind.findFirst({
      where: {
        channelId: ctx.channelId
      }
    })
    let ip:string = ''
    if (ctx.options.ip) {
      ip = ctx.options.ip
    } else if (res) {
      ip = res.ip
    } else {
      ip = 'de.itzdrli.cc'
    }
    let port:number = ctx.options.port || 25565;
    if (ip.includes(':')) {
      let [host = ip, portValue] = ip.split(":")
      ip = host
      port = portValue ? parseInt(portValue) : port
    }
    let data: any
    try {
      mc.setDnsServers(['8.8.8.8', '9.9.9.9'])
      data = await mc.lookup({
        host: ip,
        port: port,
        disableSRV: false
      })
    } catch (e) {
      console.error(e)
      await ctx.write({
        content: `${e}`
      }) 
      return
    }

    const page = await browser.newPage();
    const status: Status = data.status as any
    let result = `<p>${ip} - Latency ${data.latency} ms</p>`
    result += `<p>Version: ${status.version.name} - ${status.version.protocol}</p>`
    result += `<p>${motdParser(status.description)}</p>`
    result += `<p>Online - ${status.players.online}/${status.players.max}</p>`
    const html = generateHtml(result, status.favicon)

    let hight = 320
    if (!status.favicon) hight = 280
    await page.setViewport({ width: 650, height: hight })
    await page.setContent(html)
    await page.waitForSelector('body')
    const screenshot = await page.screenshot({
      encoding: 'base64',
      type: 'webp',
      fullPage: true
    })
    const channelId = ctx.guildId
    await page.close()
    const buffer = Buffer.from(screenshot, 'base64')
    await ctx.write({
      files: [
        new AttachmentBuilder()
          .setName('status.png')
          .setFile('buffer', buffer)
      ]
    });
    if (res && res.ip !== ip){
      await prisma.mcsBind.update({
        where: {
          id: res.id,
          channelId: ctx.channelId
        },
        data: {
          ip: ip
        }
      });
    }
    if (!res) {
      await prisma.mcsBind.create({
        data: {
          channelId: ctx.channelId,
          ip: ip
        }
      });
    }
  }
}

function generateHtml(result: string, icon64: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=auto, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      background-color: #1e1e2e;
      color: #cdd6f4;
    }
  </style>
</head>
<body style="width: 650px">
  <div class="container mx-auto py-8">
    ${icon64 ? `<div class="text-center"><img src=${icon64} alt="icon" class="w-80px h-80px mx-auto" /></div>` : ''}
    <div class="text-center mt-4">
      <div class="text-lg font-bold text-[#cdd6f4]">${result}</div>
    </div>
  </div>
  <footer class="bg-[#313244] text-center py-2">
    <p class="text-sm text-[#cdd6f4]">Powered by FSD</p>
  </footer>
</body>
</html>`;
}
