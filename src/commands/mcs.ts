import {
  AttachmentBuilder,
  Command,
  type CommandContext,
  createNumberOption,
  createStringOption,
  Declare,
  Options,
} from "seyfert";

import mc from "@ahdg/minecraftstatuspinger";
import { autoToHTML as motdParser } from "@sfirew/minecraft-motd-parser";
import type { motdJsonType } from "@sfirew/minecraft-motd-parser/types/types";

import { prisma } from "../index.ts";
import { imgGen, imgHtmlT1 } from "../utils/imageGen.ts";
import { logger } from "../utils/logger.ts";

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
    description: "Server Port",
  }),
};

@Declare({
  name: "mcs",
  description: "Query a Minecraft server",
})
@Options(options)
export default class McsCommand extends Command {
  async run(ctx: CommandContext<typeof options>) {
    await ctx.deferReply();
    if (
      ctx.options.ip &&
      !/^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?$/.test(ctx.options.ip)
    ) {
      await ctx.editOrReply({
        content: "Invalid Server Address",
      });
      return;
    }
    const res = await prisma.mcsBind.findFirst({
      where: {
        channelId: ctx.channelId,
      },
    });
    let ip: string;
    if (ctx.options.ip) {
      ip = ctx.options.ip;
    } else if (res) {
      ip = res.ip;
    } else {
      ip = "hypixel.net";
    }
    let port: number = ctx.options.port || 25565;
    if (ip.includes(":")) {
      let [host = ip, portValue] = ip.split(":");
      ip = host;
      port = portValue ? parseInt(portValue) : port;
    }
    let data: any;
    try {
      await mc.setDnsServers(["8.8.8.8", "9.9.9.9"]);
      data = await mc.lookup({
        host: ip,
        port: port,
        disableSRV: false,
      });
    } catch (e) {
      logger.error(e);
      await ctx.editOrReply({
        content: `${e}`,
      });
      return;
    }

    const status: Status = data.status as any;
    let result = `<p>${ip} - Latency ${data.latency} ms</p>`;
    result += `<p>Version: ${status.version.name} - ${status.version.protocol}</p>`;
    result += `<p>${motdParser(status.description)}</p>`;
    result += `<p>Online - ${status.players.online}/${status.players.max}</p>`;
    const html = await imgHtmlT1(status.favicon, result);
    const buffer: any = await imgGen(html, 650, 225);

    await ctx.editOrReply({
      files: [
        new AttachmentBuilder().setName("status.png").setFile("buffer", buffer),
      ],
    });
    if (res && res.ip !== ip) {
      await prisma.mcsBind.update({
        where: {
          id: res.id,
          channelId: ctx.channelId,
        },
        data: {
          ip: ip,
        },
      });
    }
    if (!res) {
      await prisma.mcsBind.create({
        data: {
          channelId: ctx.channelId,
          ip: ip,
        },
      });
    }
  }
}
