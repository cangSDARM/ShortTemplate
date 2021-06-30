import { Handler } from '../../context/msg_handler';
import catsInReddit from './memes';

const cats: Handler = async context => {
  const march = context.recv.message.match(/^cats\s+(\S+)/iu);
  if (!march || !march[1]) return false;

  switch (march[1]) {
    case 'meme':
      await catsInReddit({ ...context, cat: 'memes' });
      break;
    case 'fat':
      await catsInReddit({ ...context, cat: 'fat' });
      break;
    default:
      console.warn(march[1]);
  }

  return true;
};

export default cats;
