// shamefully stolen from http://whothefuckismydndcharacter.com/
import corpus from './whoami-corpus';
import { Command } from '../../types';

function getRandomItem<T>(list: T[]): T {
  return list[Math.round(Math.random() * list.length - 1)];
}

async function whoami() {
  return corpus.template
    .replace('@adjective', getRandomItem(corpus.adjective))
    .replace('@race', getRandomItem(corpus.race))
    .replace('@dclass', getRandomItem(corpus.dclass))
    .replace('@location', getRandomItem(corpus.location))
    .replace('@backstory', getRandomItem(corpus.backstory));
}

export const commandWhoami: Command = async (botId: string) => {
  const text = await whoami();

  return {
    bot_id: botId,
    text,
  };
};
