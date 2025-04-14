import { Handler } from '../../context/msg_handler';
import top10 from './top10';

const steam: Handler = async context => {
  const march = context.recv.message.match(/^steam\s+(top10)/iu);
  if (!march || !march[1]) return false;

  await top10(context);

  return true;
};

export default steam;
