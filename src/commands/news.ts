import {
	ActionRow,
	AttachmentBuilder,
	Command,
	CommandContext,
	createStringOption,
	Declare,
	Options,
	StringSelectMenu,
	StringSelectOption
} from 'seyfert';
import { imgGen } from '../utils/imageGen';
import { dark } from '../utils/colors';
import { logger } from '../utils/logger'

const options = {
	category: createStringOption({
		description: "What category are you interested?",
		choices: [
			{name: 'business', value: 'business'},
			{name: 'entertainment', value: 'entertainment'},
			{name: 'general', value: 'general'},
			{name: 'health', value: 'health'},
			{name: 'science', value: 'science'},
			{name: 'sports', value: 'sports'},
			{name: 'technology', value: 'technology'}
		],
		required: false,
	})
}
@Declare({
	name: 'headlines',
	description: `What's new?`,
})
@Options(options)
export default class HeadlinesCommand extends Command {
	async run(ctx: CommandContext<typeof options>) {
		const base_url = "https://newsapi.org/v2/top-headlines?pageSize=10&apiKey=" + process.env.NEWS_API_KEY + "&category=" + (ctx.options.category || 'general');
		const res = await fetch(base_url);
		const resJson: any = await res.json();

		let cardsHtml = '';

		const menu = new StringSelectMenu()
			.setCustomId('news-menu')
			.setPlaceholder('Read more about...');

		for (let index = 0; index < resJson.articles.length; index++) {
			const article = resJson.articles[index];
			if (article.title.length > 90) {
				article.title = article.title.substring(0, 90) + '...';
			}
			const fl_url = "https://fsd.itzdrli.cc"
			const fl_res = await fetch(`${fl_url}/shorten`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({url: article.url})
			})
			if (!fl_res) logger.error('Failed to shorten URL');
			const fl_resJson: any = await fl_res.json();
			menu.addOption(
				new StringSelectOption()
					.setLabel(`${index + 1}. ${article.title}`)
					.setValue(fl_resJson.url)
			);
			cardsHtml += `
        		<div class="flex justify-center w-full">
            		<div class="w-[645px] bg-[${dark[2]}] shadow-lg rounded-2xl p-4">
                		<h2 class="text-lg font-semibold mb-2 break-words text-[${dark[1]}]">${index + 1}. ${article.title}</h2>
                		<p class="text-sm text-gray-400 mb-4">${article.description || 'No description available.'}</p>
            		</div>
        		</div>
    		`;
		}

		const stringRow = new ActionRow<StringSelectMenu>().setComponents([menu]);

		const html = await fHtml(cardsHtml);
		const imgBuffer = await imgGen(html);

		await ctx.write({
			files: [
				new AttachmentBuilder()
					.setName('news.png')
					.setFile('buffer', imgBuffer)
			],
			components: [stringRow],
		});
	}
}

export async function fHtml(cardHtml: any) {
	let today = new Date();
	const dd = String(today.getDate()).padStart(2, '0');
	const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	const yyyy = today.getFullYear();

	const date = dd + '/' + mm + '/' + yyyy;
	return `
    <head>
      	<meta charset="UTF-8">
      	<meta name="viewport" content="width=auto, initial-scale=1.0, max-height: auto">
      	<title>market-info-plus</title>
      	<script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-[${dark[0]}] text-[${dark[1]}] h-[fit-content] w-[500px]">
      	<div class="w-[645px] mx-auto p-4 justify-center items-center">
        	<div class="text-center mb-5">
          	<div class="bg-[${dark[2]}] shadow-lg rounded-2xl py-4 px-6">
            	<p class="text-2xl font-bold text-[${dark[1]}]">Headlines - ${date}</p>
            	<p class="text-sm text-[${dark[1]}]">Powered by FSD</p>
          	</div>
        	</div>
        	<div class="flex flex-col items-center gap-3">
          		${cardHtml}
        	</div>
      	</div>
    </body>
  	`
}