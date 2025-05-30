import {
  AttachmentBuilder,
  Command,
  Declare,
  type CommandContext
} from 'seyfert';

import { prisma, browser } from '..';

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

@Declare({
  name: 'brawlstats',
  description: 'Query your Brawl Stars player stats'
})

export default class brawlStatsCommand extends Command {
  async run(ctx: CommandContext) {
    const res = await prisma.brawlPlayer.findFirst({
      where: {
        userId: ctx.author.id
      }
    })
    if (!res) {
      await ctx.write({
        content: `Your Discord account has not associated to a Brawl Stars playertag, use \`brawlbind\` to associate`
      })
      return
    }
    let tag = res.playerTag.replace('#', '%23')
    const data = await fetchBrawlPlayer(tag) as BrawlPlayer
    if (!data || data === null) {
      await ctx.write({
        content: `ERROR, CONTACT ADMIN`
      })
      return
    }

    const page = await browser.newPage();
    const result = generateBrawlStatsHtml(data)
    
    await page.setViewport({ width: 650, height: 200 })
    await page.setContent(result)
    await page.waitForSelector('body')
    const screenshot = await page.screenshot({
      encoding: 'base64',
      type: 'webp',
      fullPage: true
    })
    await page.close()
    
    const buffer = Buffer.from(screenshot, 'base64')
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

function generateBrawlStatsHtml(data: BrawlPlayer): string {
  const stats = [
    `Player: ${data.name}`,
    `Trophies: ${data.trophies} 🏆`,
    `3vs3 Victories: ${data['3vs3Victories']} 🏅`,
    `Solo Victories: ${data.soloVictories} 🏅`,
    `Duo Victories: ${data.duoVictories} 🏅`,
    `Total Brawlers: ${data.brawlers.length} 🤗`,
  ].join('<br>')

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
  <div class="container mx-auto py-4">
    <div class="px-6 flex items-center">
      <img src="https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoic3VwZXJjZWxsXC9maWxlXC9WeGZCYTJZM2VidFliNHhRNDJhdS5wbmcifQ:supercell:4JRrhrJjKTux8065H80-L2EiHN2bJg9E9QuhQD9ztIs?width=2400" class="h-32 w-32 object-contain mr-6" alt="Brawl Stars Logo" />
      <div class="text-lg font-bold text-[#cdd6f4]">${stats}</div>
    </div>
  </div>
  <footer class="bg-[#313244] text-center py-2">
    <p class="text-sm text-[#cdd6f4]">Powered by FSD</p>
  </footer>
</body>
</html>`;
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
      console.error(`Error fetching Brawl Stars player data: ${res.statusText}`)
      return null
    }
    return res.json()
  } catch (e) {
    console.error(e)
    return null
  }
}