import { segment } from 'oicq';
import { Handler } from '../../context/msg_handler';
import annotation from '../../utils/annotation';
import rd from './rd';
import reward from './reward';
import { print } from './utils';

/**
 * passed:
r('  3d6 +1d100 xxx +d3 -500')
r('  3d6 +2d100 -500 +d8')
r('3d6+4d3-1')
r('3d6+4+d8')
r('3d6 +d6- 100')
r('  3d6 xxyyzz d5')
r('  3d6 +d7')
r('  3d6 +1x3')
r('  3d6 +d6y3')
 */

enum RType {
  open,
  nonopen,
  nottype,
}

const rType = (message: string) => {
  switch (message) {
    case 'd':
    case 'D':
      return RType.open;
    case 'h':
    case 'H':
      return RType.nonopen;
    default:
      return RType.nottype;
  }
};

const r: Handler = async ({ recv, resp, error }) => {
  const march = recv.message.match(/^coc\s+r(.+)/iu);
  if (!march || !march[1]) return false;

  let message = march[1];

  switch (rType(message.substring(0, 1))) {
    case RType.nottype:
      resp.addMsg(segment.text('unsupported type\n'));
      resp.addMsg(segment.text('only: rd, rD, rH, rh'));
      resp.send();
      return true;
    case RType.nonopen:
      resp.setTo(recv.sender.userId.toString());
      break;
    default:
  }
  const reason = ((message = message.substring(1)).match(/^\s*[^\s\d]*/iu) ?? [
    '',
  ])[0];
  const rdRes = rd(message.substring(reason.length));

  if (!rdRes) {
    error('coc r', message, 'Param Parse Error');
    return false;
  }

  const results = [...rdRes.result];

  message = rdRes.rest;
  if (rdRes.rest.length > 0) {
    const reRes = reward(message);
    results.push(...reRes.result);
    message = reRes.rest;
  }

  resp.addMsg(segment.reply(recv.message_id));
  if (reason.trim().length > 0)
    resp.addMsg(segment.text(`Due to: ${reason}\r\n`));
  resp.addMsg(segment.text(print.sum(results)));
  resp.addMsg(
    segment.text(
      `\r\nRoll: ${rdRes.result.reduce(
        (pre, cur) => pre + cur,
        0
      )}; Gain: ${results.reduce(
        (pre, cur, curIdx) => (curIdx >= rdRes.result.length ? pre + cur : 0),
        0
      )}`
    )
  );
  if (message.trim().length > 0) resp.addMsg(segment.text(annotation(message)));

  resp.send();

  return true;
};

export default r;
