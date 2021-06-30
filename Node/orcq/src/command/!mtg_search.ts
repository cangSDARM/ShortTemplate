import axios from 'axios';
import FormData from 'form-data';
import { segment } from 'oicq';
import { Handler } from '../context/msg_handler';
import annotation from '../utils/annotation';

const search: Handler = async ({ recv, resp, error }) => {
  try {
    const march = recv.message.match(/^mtg_search\s+([^\s\\\/#!\+-]+)/iu);

    if (!march || !march[1]) return false;

    const searchStr = march[1];

    const form = new FormData();
    form.append('statistic', 'total');
    form.append('size', '30');
    form.append('page', 0);
    form.append('token', '');
    form.append('collect', '');
    form.append('name', searchStr);

    resp.addMsg(segment.text('Searching...'));
    resp.send();
    resp.clean();

    const response = await axios.post(
      'https://api2.iyingdi.com/magic/card/search/vertical',
      form,
      {
        responseType: 'json',
        headers: {
          ...form.getHeaders(),
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
        },
      }
    );
    const data: { total: number; cards: any[] } = (response.data as any)
      ?.data ?? { total: 0, cards: [] };

    if (data.cards.length < 1) {
      resp.addMsg(segment.text(`Cannot find a card containing ${searchStr}`));
      resp.send();
      return true;
    }

    const cards = data.cards.filter((_, idx) => idx < 3);

    resp.addMsg(
      segment.text('Find X in total'.replace('X', data.total.toString()))
    );
    cards.forEach(i => {
      resp.addMsg(
        segment.text(
          annotation(`${i.cname}`, i.seriesName + ' - ' + i.seriesPubtime)
        )
      );
      resp.addMsg(segment.image(i.img, false, 500));
    });
    resp.send();
    return true;
  } catch (e) {
    error('mtg_search', e);
    return true;
  }
};

export default search;
