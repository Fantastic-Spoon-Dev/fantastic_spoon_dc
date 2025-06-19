import { browser } from "..";
import { dark } from "./colors";

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
      ${icon ? `<div class="flex-shrink-0"><img src=${icon} alt="icon" class="w-auto h-auto rounded-lg" /></div>` : ''}
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


export async function imgGen(html: any) {
  const page = await browser.newPage()
  await page.setViewport({ width: 650, height: 200 })
  await page.setContent(html)
  const screenshot = await page.screenshot({
    encoding: 'base64',
    type: 'webp',
    fullPage: true
  })
  await page.close()
  return Buffer.from(screenshot, 'base64')
}
