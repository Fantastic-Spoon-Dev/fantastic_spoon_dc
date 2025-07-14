import { logger } from "./logger";

interface FoodEntry {
  id: number;
  documentId: string;
  name: string;
  description: string;
  createdAt: any;
  updatedAt: any;
  publishedAt: any;
  locale: string;
  meals: string[];
  category: string[];
  image: any;
}

interface FoodsResponse {
  data: FoodEntry[];
  meta?: any;
}

export async function w2e(category: string, meal: string) {
  const TOKEN: string = process.env.API_TOKEN || "";
  const BASE_URL = "https://api.itzdrli.cc/api/foods";
  const params = new URLSearchParams({
    populate: "image",
  });
  const res = (await fetcher(BASE_URL, params, TOKEN)) as FoodsResponse;
  if (!res || !res.data) return [];
  let filtered = res.data.filter(
    (item) => item.category?.includes(category) && item.meals?.includes(meal)
  );
  let randomIndex = Math.floor(Math.random() * filtered.length) - 1;
  if (randomIndex === -1) randomIndex = 0;
  const name: string = filtered[randomIndex]?.name + "</br>" || "";
  const desc: string = filtered[randomIndex]?.description || "";
  // logger.info(randomIndex);
  // logger.info(filtered[randomIndex]);
  let imgUrl: string = "";
  if (filtered[randomIndex]?.image) {
    imgUrl =
      "https://api.itzdrli.cc" +
      filtered[randomIndex]?.image.formats.thumbnail.url;
  }
  const text: string = name + desc || "";
  return [text, imgUrl];
}

async function fetcher(url: string, params: any, token: string) {
  try {
    const res = await fetch(`${url}?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    if (!res) return null;
    return res.json();
  } catch (e) {
    logger.error(e);
    return null;
  }
}
