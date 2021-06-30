import { Client, GroupMessageEventData, MessageEventData } from 'oicq';

interface Sender {
  userId: number;
  groupId: number;
  type: 'group' | 'private';
  nickname: string;
}

function isGroupMessageEventData(data: any): data is GroupMessageEventData {
  return !!data.group_id;
}

class MsgRecv {
  constructor(client: Client) {
    this.client = client;
  }
  //@ts-ignore
  private client: Client;

  private _raw_message: string = '';
  message_id: string = '';
  sender: Sender = {
    userId: -1,
    groupId: -1,
    type: 'group',
    nickname: '',
  };
  recverId: number = -1;

  get message(): string {
    return this._raw_message;
  }

  recvData(data: MessageEventData) {
    this._raw_message = data.raw_message.trim();
    this.message_id = data.message_id;

    const isGroupMessage = isGroupMessageEventData(data);

    this.sender = {
      userId: data.sender.user_id,
      groupId: (data as GroupMessageEventData)?.group_id,
      type: isGroupMessage ? 'group' : 'private',
      nickname: data.sender.nickname,
    };
    this.recverId = isGroupMessage ? this.sender.groupId : this.sender.userId;
  }
}

export default MsgRecv;
