import {
  Client,
  GroupMessageEventData,
  MessageEventData,
  PrivateMessageEventData,
} from 'oicq';
import command from './command';
import Context from './context';

const activedGroup = (data: MessageEventData) => {
  if ((data as GroupMessageEventData)?.group_id == 1046614153) return true;
  if ((data as GroupMessageEventData)?.group_id == 250325468) return true;

  if ((data as PrivateMessageEventData)?.user_id == 648384410) return true;

  return false;
};

const main = async (bot: Client, data: MessageEventData, leading: string) => {
  if (!bot || !data || !leading) throw 'no data passed into this thread';

  const context = new Context(bot);
  const message = data.raw_message?.trimStart();

  if (!activedGroup(data)) return;
  if (!message.startsWith(leading)) return;

  const source = Object.assign(data, {
    raw_message: message.replace(leading, ''),
  });
  context.inject('command', source);
  for (const cmd of command) {
    const done = await cmd(context);
    if (done) {
      return;
    } else continue;
  }
};

//@ts-ignore
self.addEventListener('message', (e: any) => {
  const message = e.data || e;

  main(message?.bot, message?.data, message?.leading).catch(e =>
    console.error('thread error: ', e)
  );
});
