import axios from 'axios';
import cheerio from 'cheerio';
import { segment } from 'oicq';
import { Handler } from '../../context/msg_handler';
import annotation from '../../utils/annotation';
import { timeCache } from '../../utils/cache';

const gameShortcut: { [key in string]: string } = {
  'Counter-Strike: Global Offensive': 'CS:Go',
  "PLAYERUNKNOWN'S BATTLEGROUNDS": 'PUPG',
  'Grand Theft Auto V': 'GTA5',
};

const steamCache = (cache = '') => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 10, 0, 0);

  return timeCache.use({ stamp: date.getTime(), key: 'SteamCache', cache });
};

const top10: Handler = async ({ recv, resp, error }) => {
  try {
    const cache = steamCache();
    let responseData: { timestamp: string; data: any[] } = {
      timestamp: '',
      data: [],
    };
    if (cache) {
      responseData = JSON.parse(String.raw`${cache}`);
    } else {
      resp.addMsg(segment.text('Fetching...'));
      resp.send();
      resp.clean();

      const response = await axios.get(
        'https://store.steampowered.com/stats/',
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
          },
        }
      );

      let cursor = { cur: '', peak: '', game: '' },
        text = '';
      const data: typeof cursor[] = [];

      const $ = cheerio.load(response.data);
      $('tr.player_count_row').each((i, el) => {
        if (i >= 10) return;
        const $el = $.load(el);

        cursor = { cur: '', peak: '', game: '' };
        $el('td > span').each((i, ele) => {
          if (i == 0) {
            cursor.cur = $.load(ele).text();
          } else if (i == 1) {
            cursor.peak = $.load(ele).text();
          }
        });
        text = $el('td > a').text();
        cursor.game = gameShortcut[text] ?? text;

        data.push(cursor);
      });

      responseData.timestamp = $('h2 > span.statsTopSmall').text();
      responseData.data = data;
      steamCache(JSON.stringify(responseData));
    }

    resp.addMsg(segment.at(recv.sender.userId));
    resp.addMsg(segment.text('\n' + responseData.timestamp));
    resp.addMsg(
      segment.text(
        responseData.data
          .map(i =>
            annotation(
              `Game: ${i.game}\nCur Players: ${i.cur}\nPeak Today: ${i.peak}`
            )
          )
          .join('')
      )
    );
    resp.send();
  } catch (e) {
    if (e?.code == 'ETIMEDOUT') {
      resp.addMsg(segment.text('ETIMEDOUT'));
      resp.send();
    } else {
      error('steam', e);
    }
  }

  return true;
};

export default top10;
