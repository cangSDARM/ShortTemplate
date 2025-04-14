import { Client, MessageEventData } from 'oicq';
import { updateOrInsert } from '../db';
import MsgRecv from './recv';
import MsgResp from './resp';

function isMessageEventData(data: any): data is MessageEventData {
  return !!data.raw_message;
}

class Context {
  constructor(client: Client) {
    this.bot = client;
    this.resp = new MsgResp(this.bot);
    this.recv = new MsgRecv(this.bot);
  }

  public bot: Client;
  public resp: MsgResp;
  public recv: MsgRecv;

  inject<T = MessageEventData>(type: 'command', data: T) {
    if (type == 'command' && isMessageEventData(data)) {
      this.recv.recvData(data);
      this.resp
        .setType(this.recv.sender.type)
        .setTo(this.recv.recverId.toString())
        .clean();
    }
  }

  error = (froom: string, ...msg: string[]) => {
    console.error('Error! ', msg);
    const json = JSON.stringify(msg);
    const stamp = Date.now();
    updateOrInsert(
      { qs: `select * from err_log where timestamp=?`, params: [stamp] },
      {
        qs: `update err_log set err=? where timestamp=?`,
        params: [json, stamp],
      },
      {
        qs: `insert into err_log values (null,?,?,?)`,
        params: [stamp, json, froom],
      }
    );
  };
}

export default Context;
