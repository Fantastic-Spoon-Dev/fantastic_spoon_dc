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
import { imgGen, imgHtmlT1 } from '../utils/imageGen.ts';

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
      ip = 'join.itzdrli.cc'
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

    const status: Status = data.status as any
    let result = `<p>${ip} - Latency ${data.latency} ms</p>`
    result += `<p>Version: ${status.version.name} - ${status.version.protocol}</p>`
    result += `<p>${motdParser(status.description)}</p>`
    result += `<p>Online - ${status.players.online}/${status.players.max}</p>`
    const html = await imgHtmlT1(status.favicon, result)
    const buffer:any = await imgGen(html)

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

