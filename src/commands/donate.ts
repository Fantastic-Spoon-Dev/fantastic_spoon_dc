import { Declare, Command, type CommandContext } from "seyfert";

@Declare({
  name: "donate",
  description: "Donate to FSD",
})
export default class PingCommand extends Command {
  async run(ctx: CommandContext) {
    await ctx.write({
      content: `Fantastic Spoon needs your support! If you enjoy using it, please consider donating to help keep it alive. \nYou can donate via [Ko-Fi](https://ko-fi.com/itzdrli).\nYour support is greatly appreciated!`,
    });
  }
}
