import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { PrismaClient } from './generated/prisma';

const BASE_URL = 'https://fsd.itzdrli.cc/';
const app = new Hono();

export const prisma = new PrismaClient()

app.post('/shorten', async (c) => {
  const body = await c.req.json<{ url?: string }>();
  let oUrl = body.url;
  if (!oUrl) return c.json({error: 'Please provide a URL'}, 400);
  if (!oUrl.match(/^(http|https|ftp):\/\/[\w.-]+\.[\w.-]+[\w\-._~:/?#[\]@!$&'()*+,;=]*$/))
    return c.json({error: 'Please provide a valid URL (including http:// or https://)'}, 400);
  if (!oUrl.endsWith('/')) oUrl += '/';

  try {
    const existingUrl = await prisma.url.findFirst({
      where: {longUrl: oUrl},
    });
    if (existingUrl) {
      const shortUrl = `${BASE_URL}${existingUrl.shortId}`;
      return c.json({url: shortUrl});
    }
    let shortId: string = "";
    let isUnique = false;
    while (!isUnique) {
      shortId = nanoid(6);
      const existingShortId = await prisma.url.findUnique({
        where: {shortId},
      });
      if (!existingShortId) isUnique = true;
    }
    await prisma.url.create({
      data: {
        shortId,
        createdAt: new Date(),
        longUrl: oUrl,
      },
    });
    const shortUrl = `${BASE_URL}${shortId}`;
    return c.json({url: shortUrl});
  } catch (err) {
    console.error('Error processing URL:', err);
    return c.json({error: 'An error occurred while processing the URL'}, 500);
  }
});

app.get('/:id', async (c) => {
  const shortId = c.req.param('id');
  try {
    const urlRecord = await prisma.url.findUnique({
      where: {shortId},
    });
    if (urlRecord) {
      return c.redirect(urlRecord.longUrl);
    } else {
      return c.json({error: '404 NOT FOUND'}, 404);
    }
  } catch (error) {
    console.error('Error fetching URL record:', error);
    return c.json({error: '500 INTERNAL SERVER ERROR'}, 500);
  }
});

app.get('/', (c) => c.json({message: "I'm a teapot"}, 418));

export default {
  host: "0.0.0.0",
  port: process.env.FL_PORT || 3000,
  fetch: app.fetch,
};