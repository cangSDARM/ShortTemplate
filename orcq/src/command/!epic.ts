import axios from 'axios';
import { segment } from 'oicq';
import { Handler } from '../context/msg_handler';
import { timeCache } from '../utils/cache';

const epicCache = (cache = '') => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 1);

  return timeCache.use({ stamp: date.getTime(), key: 'EpicFree', cache });
};

const epic: Handler = async ({ error, recv, resp }) => {
  const march = recv.message.match(/^epic\s*free/iu);

  if (!march) return false;

  try {
    const cache = epicCache();
    let free: { title: string; endDate: string }[] = [];
    if (cache) {
      free = JSON.parse(String.raw`${cache}`);
    } else {
      resp.addMsg(segment.text('Fetching...'));
      resp.send();
      resp.clean();

      const response = await axios.get(
        'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=zh-CN',
        {
          headers: {
            accept: 'application/json',
            origin: 'https://www.epicgames.com',
            referer: 'https://www.epicgames.com/store/zh-CN/free-games',
          },
        }
      );
      const data: any[] =
        response.data.data?.Catalog?.searchStore?.elements ?? [];

      free = data
        .filter(i => i?.promotions?.promotionalOffers?.length > 0)
        .map(i => ({
          title: i.title,
          endDate:
            i.promotions?.promotionalOffers[0]?.promotionalOffers[0]?.endDate,
        }));

      epicCache(JSON.stringify(free));
    }

    resp.addMsg(segment.at(recv.sender.userId));
    for (const f of free) {
      const endDate = new Date(f.endDate);

      resp.addMsg(
        segment.text(
          `\nGame: ${f.title}\nUp: ${endDate.toLocaleDateString('en-US', {
            year: '2-digit',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}`
        )
      );
    }
    resp.send();
  } catch (e) {
    error('epic', e);
  }

  return true;
};

export default epic;
