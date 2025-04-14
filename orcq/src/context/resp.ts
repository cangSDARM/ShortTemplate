import { Client, MessageElem } from 'oicq';

class MsgResp {
  constructor(client: Client) {
    this.client = client;
  }

  client: Client;
  private messages: MessageElem[] = [];
  private type: 'private' | 'group' | undefined;
  private to: string = '';

  setTo(user_id: string): MsgResp {
    this.to = user_id;
    return this;
  }

  setType(type: 'private' | 'group'): MsgResp {
    this.type = type;
    return this;
  }

  clean() {
    this.messages = [];
  }

  addMsg(message: MessageElem) {
    this.messages.push(message);
  }

  async send() {
    if (this.messages.length < 1) {
      console.error('try send empty message');
      return;
    }

    if (this.to == '') {
      console.error('try send to void');
      return;
    }

    if (this.type == 'private') {
      this.client.sendPrivateMsg(parseInt(this.to), this.messages).catch(e => {
        console.error('send error: ', e);
      });
    } else if (this.type == 'group') {
      this.client.sendGroupMsg(parseInt(this.to), this.messages).catch(e => {
        console.error('send error: ', e);
      });
    } else {
      console.error('try send to undefined type');
    }
  }
}

export default MsgResp;
