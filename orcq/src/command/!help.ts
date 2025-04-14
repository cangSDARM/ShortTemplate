import { segment } from 'oicq';
import { Handler } from '../context/msg_handler';
import annotation from '../utils/annotation';

const helper: { [key in string]: string } = {
  'coc rd': `!coc rd fight 3d6 +1d100 -4d6\n
  can include rolling purpose, such as 'fight' in example\n
  number of spaces is irrelevant\n
  unlimited number of gain dice\n`,
  mtg_search: `search for an MTG card`,
  steam: `!steam top10\nshow the top 10 games on Steam according to the current number of players`,
  sgl: `remind others that this topic has already been discussed`,
  epic: `!epic free\nfind out what games epic is sending today`,
  cats: `!cats meme\nget the latest meme of cats on reddit\n!cats fat\nget the fatest cat on reddit :)`,
};
const reg = new RegExp(
  `^help(?:(?:\\s+(${Object.keys(helper).join('|')}))|\\s*)`,
  'iu'
);

const help: Handler = async ({ recv, resp }) => {
  const march = recv.message.match(reg);

  if (!march) return false;

  const cmd = march[1];

  if (!cmd) {
    resp.addMsg(segment.text('List of supported commands:'));
    resp.addMsg(
      segment.text(
        annotation(
          Object.keys(helper)
            .map(i => `!${i}`)
            .join('\n')
        )
      )
    );
    resp.addMsg(
      segment.text(annotation('Type !help [command] to view details'))
    );
  } else {
    const rightKey = cmd
      .replace(/\s*/iu, '')
      .toLowerCase()
      .trim();
    if (!helper[rightKey]) return true;

    resp.addMsg(segment.text(`!${cmd}`));
    resp.addMsg(segment.text(annotation(helper[cmd])));
  }

  resp.send();

  return true;
};

export default help;
