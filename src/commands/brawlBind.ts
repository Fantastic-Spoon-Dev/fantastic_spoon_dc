import {
  Command,
  Declare,
  Options,
  createStringOption,
  type CommandContext
} from 'seyfert';

import { prisma } from '..';

const options = {
  playertag: createStringOption({
    description: 'Your Brawl Stars player tag',
    required: true,
  }),
}

@Declare({
  name: 'brawlbind',
  description: 'Associate your Discord account with your Brawl Stars account',
})
@Options(options)
export default class brawlBindCommand extends Command {
  async run(ctx: CommandContext<typeof options>) {
    let tag = ctx.options.playertag
    if (!tag.startsWith("#")) tag = "#" + tag
    const playerTagRegex = /^#[0-9A-Z]{6,10}$/
    if (!playerTagRegex.test(ctx.options.playertag)) {
      await ctx.write({
        content: 'Invalid player tag (Example: `#A1B2C3D4E`)'
      })
      return
    }
    const userId: string = ctx.author.id
    console.log(tag + `\n` + userId)
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
        await ctx.write({
          content: `${e}`
        })
        return
      }
      await ctx.write({
        content: `Updated your playertag from ${res.playerTag} to \`${tag}\``
      })
      return
    } else if (res && res.playerTag === tag) {
      await ctx.write({
        content: `Nothing Changed, playertag already associated to \`${tag}\``
      })
    }
    if (!res) {
      try {
        await prisma.brawlPlayer.create({
          data: {
            userId: userId,
            playerTag: tag
          }
        })
      } catch (e) {
        await ctx.write({
          content: `${e}`
        })
      }
      await ctx.write({
        content: `Associated to your playertag \`${tag}\``
      })
      return
    }
  }
}