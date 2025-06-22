import { ComponentCommand, type ComponentContext } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types';

export default class NewsMenuComponent extends ComponentCommand {
	componentType = 'StringSelect' as const;

	filter(ctx: ComponentContext<typeof this.componentType>) {
		return ctx.customId === 'news-menu';
	}

	async run(ctx: ComponentContext<typeof this.componentType>) {
		const value = ctx.interaction.values[0];
		await ctx.write({
			content: value,
			flags: MessageFlags.Ephemeral
		})
	}
}
