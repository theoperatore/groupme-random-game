export type GroupMePostBody = {
  text?: string | null;
  sender_type: GroupMeSender;
  group_id: string;
};

export enum GroupMeSender {
  BOT = 'bot',
  USER = 'user',
}

export type GroupMeResponse = {
  bot_id: string;
  text: string;
  image?: string;
};

export type Command = (
  botId: string,
  rawText: string
) => Promise<GroupMeResponse>;
