import { segment } from 'oicq';
import { Handler } from '../context/msg_handler';

const sgl: Handler = async ({ recv, resp }) => {
  const march = recv.message.match(/^\s*(sgl|水过了|别人水过了)/iu);

  if (!march || !march[1]) return false;

  resp.addMsg(segment.image('./src/assets/brsgl.jpg'));
  resp.send();

  return true;
};

export default sgl;
