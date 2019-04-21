require('dotenv').config();

import { json } from 'body-parser';
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as express from 'express';
import { GroupMePostBody, GroupMeSender } from './types';
import { Parser } from './parser';
import { postToGroupme } from './utils';
import { commandRandom, commandWhoami } from './commands';

// TODO: figure out how to map this better...
// maybe these are just more env variables?
const PROD_GROUP_ID = '13613300';
const DEV_GROUP_ID = '17602864';

const groupToBotId = new Map([
  [PROD_GROUP_ID, process.env.PROD_BOT_ID],
  [DEV_GROUP_ID, process.env.DEV_BOT_ID],
]);

const parser = new Parser();

parser.setCommand('gotd', '#gotd - get a round robin GotD', commandRandom);
parser.setCommand('whoami', '#whoami - generate backstory', commandWhoami);
// parser.setCommand('dnd', '#dnd <term> - query compendium', () => {});
// parser.setCommand('monster', '#monster    - random dnd5e monster', () => {});
parser.setCommand('help', '#help - show this message', botId => {
  const helpText = `Available commands are:\n\`\`\`\n${parser.formatCommands()}\`\`\``;
  return Promise.resolve({
    bot_id: botId,
    text: helpText,
  });
});

const app = express();

app.use(helmet());
app.use(cors());
app.use(json());

app.get('/health_check', (req, res) => {
  console.log(`[log] - ${new Date().toLocaleString()} health_check`);
  res.sendStatus(204);
});

app.post('/random', async (req, res) => {
  const { group_id, sender_type, text } = req.body as GroupMePostBody;
  const botId = groupToBotId.get(group_id);

  if (sender_type === GroupMeSender.BOT) {
    return res.sendStatus(204);
  }

  if (!text) {
    return res.sendStatus(204);
  }

  if (!botId) {
    return res.sendStatus(204);
  }

  const command = parser.parse(text);
  if (!command) {
    return res.sendStatus(204);
  }

  try {
    const groupMeResponse = await command(botId, text);
    await postToGroupme(groupMeResponse);
  } catch (error) {
    // log this error but don't crash
    await postToGroupme({
      bot_id: botId,
      text: `Bzzzzrt! Failed dat command.`,
    });
    console.error('[error]', error);
  }

  return res.sendStatus(204);
});

const PORT = process.env.PORT || 9966;
app.listen(PORT, () => {
  console.log(
    `[log] - ${new Date().toLocaleString()} - server listening on ${PORT}`
  );
});
