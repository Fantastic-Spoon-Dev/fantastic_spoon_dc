import {
  Declare,
  Command,
  type CommandContext,
  Options,
  createStringOption,
  AttachmentBuilder,
  ActionRow,
  Button,
} from "seyfert";
import { ButtonStyle } from "seyfert/lib/types";
import { w2e } from "../utils/fwhat2eat";
import { logger } from "../utils/logger";
import { imgHtmlT1 } from "../utils/imageGen";
import { imgGen } from "../utils/imageGen";

const options = {
  meal: createStringOption({
    description: "How about a bbq pizza for breakfast?",
    choices: [
      { name: "breakfast", value: "breakfast" },
      { name: "lunch", value: "lunch" },
      { name: "dinner", value: "dinner" },
      { name: "dessert", value: "dessert" },
      { name: "mixed", value: "mixed" },
    ],
    required: false,
  }),
  category: createStringOption({
    description: "Is sushi a American food?",
    choices: [
      { name: "South-East Asian Food", value: "South-East-Asian" },
      { name: "East Asian", value: "East-Asian" },
      { name: "West-European Food", value: "West-European" },
      { name: "East-European Food", value: "East-European" },
      { name: "American Food", value: "American" },
      { name: "Latin-American Food", value: "Latin-American" },
      { name: "Middle-Eastern", value: "Middle-Eastern" },
      { name: "Australian", value: "Australian" },
      { name: "Mixed", value: "Mixed" },
    ],
  }),
};

@Declare({
  name: "what2eat",
  description: "Idk what to eat!",
})
@Options(options)
export default class EatCommand extends Command {
  async run(ctx: CommandContext<typeof options>) {
    await ctx.deferReply();
    const category = ctx.options.category || "Mixed";
    const meal = ctx.options.meal || "mixed";
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
