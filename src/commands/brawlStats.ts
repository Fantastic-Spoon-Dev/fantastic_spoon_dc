import { AttachmentBuilder, Command, type CommandContext, createStringOption, Declare, Options } from 'seyfert';

import { prisma } from '..';
import { imgGen, imgHtmlT1 } from '../utils/imageGen';
import { logger } from '../utils/logger';

interface BrawlPlayer {
	name: string;
	tag: string;
	namecolor: string;
	nameColor: string;
	icon: any;
	trophies: number;
	highestTrophies: number;
	expLevel: number;
	expPoints: number;
	isQualifiedFromChampionshipChallenge: boolean;
	"3vs3Victories": number;
	soloVictories: number;
	duoVictories: number;
	bestRoboRumbleTime: number;
	bestTimeAsBigBrawler: number;
	club: any;
	brawlers: any[];
}

const options = {
	playertag: createStringOption({
		description: 'Your Brawl Stars player tag'
	}),
}

@Declare({
	name: 'brawlstats',
	description: 'Query your Brawl Stars player stats'
})
@Options(options)

export default class brawlStatsCommand extends Command {
	async run(ctx: CommandContext<typeof options>) {
		let tag = ""
		if (ctx.options.playertag) {
			tag = ctx.options.playertag
			if (!tag.startsWith("#")) tag = "#" + tag
			const playerTagRegex = /^#[0-9A-Z]{6,10}$/
			if (!playerTagRegex.test(ctx.options.playertag)) {
				await ctx.write({
					content: 'Invalid player tag (Example: `#A1B2C3D4E`)'
				})
				return
			}
			const userId = ctx.author.id
			const res = await prisma.brawlPlayer.findFirst({
				where: {
					userId: userId
				}
			})
			if (res && res.playerTag !== tag) {
				try {
					await prisma.brawlPlayer.update({
						where: {
							id: res.id,
							userId: userId
						},
						data: {
							playerTag: tag
						}
					})
				} catch (e) {
					logger.error(e)
					await ctx.write({
						content: `${e}`
					})
				}
			} else if (!res) {
				try {
					await prisma.brawlPlayer.create({
						data: {
							userId: userId,
							playerTag: tag
						}
					})
				} catch (e) {
					logger.error(e)
					await ctx.write({
						content: `${e}`
					})
				}
			}

		} else {
			const res = await prisma.brawlPlayer.findFirst({
				where: {
					userId: ctx.author.id
				}
			})
			if (!res) {
				await ctx.write({
					content: `Provide a valid Brawl Stars player tag`
				})
				return
			}
			tag = res.playerTag
		}
		tag = tag.replace('#', '%23')
		let data
		try {
			data = await fetchBrawlPlayer(tag) as BrawlPlayer
		} catch (e) {
			await ctx.write({
				content: `${e}, please try again later`
			})
			return
		}
		if (!data) {
			await ctx.write({
				content: `Error, try again later.`
			})
			return
		}

		const stats = [
			`Player: ${data.name}`,
			`Trophies: ${data.trophies} 🏆`,
			`3vs3 Victories: ${data['3vs3Victories']} 🏅`,
			`Solo Victories: ${data.soloVictories} 🏅`,
			`Duo Victories: ${data.duoVictories} 🏅`,
			`Total Brawlers: ${data.brawlers.length} 🤗`,
		].join('<br>')
		const bsIconUrl = "https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoic3VwZXJjZWxsXC9maWxlXC9WeGZCYTJZM2VidFliNHhRNDJhdS5wbmcifQ:supercell:4JRrhrJjKTux8065H80-L2EiHN2bJg9E9QuhQD9ztIs?width=120"
		const html = await imgHtmlT1(bsIconUrl, stats)

		const buffer: any = await imgGen(html)
		await ctx.write({
			files: [
				new AttachmentBuilder()
					.setName('brawlstats.png')
					.setFile('buffer', buffer)
			]
		});
		return
	}
}

async function fetchBrawlPlayer(playerTag: string) {
	const brawlUrl = `https://api.brawlstars.com/v1/players/${playerTag}`
	try {
		const res = await fetch(brawlUrl, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${process.env.BRAWL_KEY}`,
				'Accept': 'application/json'
			}
		})
		if (!res.ok) {
			return null
		}
		return res.json()
	} catch (e) {
		console.error(e)
		return null
	}
}