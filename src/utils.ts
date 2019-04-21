import { RequestOptions } from 'https';
import { https } from 'follow-redirects';
import { GroupMeResponse } from './types';

export function request<T>(
  options: RequestOptions = {},
  postData?: string
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const request = https.request(options, response => {
      response.setEncoding('utf8');
      let data = '';
      response.on('data', chunk => {
        data += chunk;
      });

      response.on('end', () => {
        if (!data.trim()) return resolve();
        try {
          const out = JSON.parse(data.trim());
          resolve(out);
        } catch (error) {
          reject(error);
        }
      });
    });

    if (postData) {
      request.write(postData);
    }

    request.end();
  });
}

export const generateId = (length = 22, appendTimestamp = true) => {
  const str = 'abcdefghijklmnopqrstuvwxyz';
  const time = Date.now();
  return (
    new Array(length)
      .fill(1)
      .map(() => str[Math.floor(Math.random() * str.length - 1)])
      .join('') + (appendTimestamp ? `${time}` : '')
  );
};

export const postToGroupme = (message: GroupMeResponse) =>
  request(
    {
      host: 'api.groupme.com',
      path: `/v3/bots/post?token=${process.env.GM_TOKEN}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    JSON.stringify({
      bot_id: message.bot_id,
      text: message.text,
      picture_url: message.image,
    })
  );

export class CommandError extends Error {
  constructor(message: string) {
    super(message);
  }
}
