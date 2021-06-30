import axios from 'axios';
import fs from 'fs';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { segment } from 'oicq';
import { Stream } from 'stream';
import { Handler } from '../../context/msg_handler';
import { timeCache } from '../../utils/cache';
import { sleep } from '../../utils/sleep';

const catsCache = (cache = '', key = 'Cats') => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 3, 0, 0);

  return timeCache.use({ stamp: date.getTime(), key, cache });
};

const Cats = {
  memes: {
    url: 'https://www.reddit.com/r/Catmemes/top.json',
    fs: './catsmemes.png',
    key: 'CatsMeme',
  },
  fat: {
    url: 'https://www.reddit.com/r/fat_cat/top.json',
    fs: './cattoofat.png',
    key: 'CatsFat',
  },
};

const catsInReddit: Handler<{ cat: keyof typeof Cats }> = async ({
  resp,
  error,
  cat,
}) => {
  try {
    const cache = catsCache();
    let responseData: any = {};
    if (cache) {
      responseData = JSON.parse(String.raw`${cache}`);
    } else {
      resp.addMsg(segment.text('Fetching...'));
      resp.send();
      resp.clean();

      const response = await axios.get(Cats[cat].url, {
        proxy: false,
        httpsAgent: new HttpsProxyAgent('http://127.0.0.1:4780'),
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
        },
      });

      let i = 0,
        data;
      while (!!(data = response.data.data?.children[i]?.data)) {
        if (data.url_overridden_by_dest || data.thumbnail) {
          responseData = data;
          break;
        }
        i++;
      }

      const img = await axios.get(
        responseData.url_overridden_by_dest || responseData.thumbnail,
        {
          responseType: 'stream',
          proxy: false,
          httpsAgent: new HttpsProxyAgent('http://127.0.0.1:4780'),
        }
      );
      await (img.data as Stream).pipe(fs.createWriteStream(Cats[cat].fs));
      await sleep(500);

      catsCache(JSON.stringify(responseData), Cats[cat].key);
    }

    if (fs.existsSync(Cats[cat].fs)) {
      resp.addMsg(segment.text(responseData.title + '\n'));
      resp.addMsg(segment.image(Cats[cat].fs));
      resp.send();
    }
  } catch (e) {
    error('cats', e);
  }

  return true;
};

export default catsInReddit;
