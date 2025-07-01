import {
  ComponentCommand,
  type ComponentContext,
  ActionRow,
  AttachmentBuilder,
  Button,
} from "seyfert";
import { ButtonStyle } from "seyfert/lib/types";
import { w2e } from "../utils/fwhat2eat";
import { logger } from "../utils/logger";
import { imgGen, imgHtmlT1 } from "../utils/imageGen";

export default class w2eButton extends ComponentCommand {
  componentType = "Button" as const;
  filter(ctx: ComponentContext<typeof this.componentType>) {
    if (ctx.interaction.customId.startsWith("w2ebtn:")) {
      return ctx.customId === ctx.interaction.customId;
    }
    return false;
  }
  async run(ctx: ComponentContext<typeof this.componentType>) {
    await ctx.deferReply();
    let [prefix, category, meal] = ctx.interaction.customId.split(":");
    if (!category) category = "";
    if (!meal) meal = "";
    let [text, imgUrl] = await w2e(category, meal);
    if (!text || text === null)
      await ctx.editOrReply({
        content: "Could not find any :-(",
      });
    if (!text) text = "";
    const html = await imgHtmlT1(imgUrl, text);
    const buffer = await imgGen(html, 620, 225);
    const row = new ActionRow().setComponents([
      new Button()
        .setCustomId(`w2ebtn:${category}:${meal}`)
        .setLabel(`Nah, try another`)
        .setStyle(ButtonStyle.Primary),
    ]);
    await ctx.editOrReply({
      files: [
        new AttachmentBuilder().setName("w2e.png").setFile("buffer", buffer),
      ],
      components: [row],
    });
  }
}
