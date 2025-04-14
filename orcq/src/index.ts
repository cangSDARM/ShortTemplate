// import { createClient } from 'oicq';
// import MsgContext from './context';

import {
  createClient,
  GroupMessageEventData,
  MessageEventData,
  PrivateMessageEventData,
} from 'oicq';
import command from './command';
import Context from './context';
import { prepare } from './db';

// const context = new MsgContext(bot);

// // login with your password or password_md5

// bot.on('system.login', () => {
//   console.log('login');
// });

// //监听并输入滑动验证码ticket(同一设备只需验证一次)

// bot.on('system.login.error', e => {
//   console.error('fatil', e);
// });

// bot.on('system.offline.device', e => {
//   console.error('fatil', e);
// });
// bot.on('system.offline.kickoff', e => {
//   console.error('fatil', e);
// });
// bot.on('system.offline', e => {
//   console.error('fatil', e);
// });

// bot.on('system.login.captcha', e => {
//   console.error('fatil', e);
// });

// //监听设备锁验证(同一设备只需验证一次)
// bot.on('system.login.device', () => {
//   bot.logger.info('验证完成后敲击Enter继续..');
//   process.stdin.once('data', () => {
//     bot.login();
//   });
// });

const activedGroup = (data: MessageEventData) => {
  if ((data as GroupMessageEventData)?.group_id == 535985889) return true;
  if ((data as GroupMessageEventData)?.group_id == 99) return true;

  if ((data as PrivateMessageEventData)?.user_id == 99) return true;

  return false;
};

const entry = async (leading = '!') => {
  const uin = 849614019; //qq
  const bot = createClient(uin, {
    log_level: 'warn', //日志级别设置为debug
    platform: 3, //登录设备选择
  });

  bot.on('system.login.slider', () => {
    process.stdin.once('data', input => {
      bot.sliderLogin(input.toString());
    });
  });
  bot
    .on('system.login.qrcode', function() {
      process.stdin.once('data', () => {
        this.login(); //扫码后按回车登录
      });
    })
    .login();

  const context = new Context(bot);

  await bot.on('message', async data => {
    const message = data.raw_message?.trimStart();

    if (!activedGroup(data)) return;
    if (!message.startsWith(leading)) return;

    console.log('recived data: ', data);

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
  });
};

const main = (leading = '!') => {
  prepare();
  entry(leading).catch(e => console.error('internal error; ', e));
};

main();
