import {
  Command,
  Declare,
  Options,
  createStringOption,
  type CommandContext
} from 'seyfert';
 
const options = {
  ip: createStringOption({
    description: "Server IP",
  }),
};
 
@Declare({
  name: 'mcs',
  description: 'Qeury a Minecraft server',
})
@Options(options)
export default class McsCommand extends Command {
 
  async run(ctx: CommandContext<typeof options>) {
    const ip = ctx.options.ip || 'hypixel.net';
    const port = 25565;
 
    await ctx.write({
      content: `${ip}:${port}`,
    });
  }
}