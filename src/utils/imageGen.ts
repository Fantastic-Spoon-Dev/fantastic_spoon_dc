import { dark } from "./colors";
import { firefox } from "playwright-core";

export async function imgHtmlT1(icon: any, text: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=auto, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      background-color: ${dark[0]};
      color: ${dark[1]};
    }
  </style>
</head>
<body style="width: 650px">
  <div class="container mx-auto pl-20 pr-8 py-4">
    <div class="px-6 flex items-center gap-10">
      ${
        icon
          ? `<div class="flex-shrink-0"><img src=${icon} alt="icon" class="w-auto h-auto rounded-lg" /></div>`
          : ""
      }
      <div class="flex-grow pl-25">
        <div class="text-lg font-bold text-[${dark[1]}]">${text}</div>
      </div>
    </div>
  </div>
  <footer class="bg-[${dark[2]}] text-center py-2">
    <p class="text-sm text-[${dark[1]}]">Powered by FSD</p>
  </footer>
</body>
</html>`;
}

export async function imgGen(html: any, w: number, h: number) {
  const browser = await firefox.connect(process.env.PLAYWRIGHT_ADDR || "");
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(html);
  await page.waitForLoadState('networkidle')
  const contentHeight: number = await page.evaluate(() => {
    // @ts-ignore
    return document.body.scrollHeight;
  });
  await page.setViewportSize({ width: w, height: contentHeight });
  const buffer = await page.screenshot();
  await page.close();
  await ctx.close();
  return buffer;
}
