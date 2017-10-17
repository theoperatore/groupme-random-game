// shamefully stolen from http://whothefuckismydndcharacter.com/
import corpus from './whoami-corpus';

const getRandomItem = (list) => list[Math.round(Math.random() * list.length - 1)];

export async function whoami() {
  return corpus.template
    .replace('@adjective', getRandomItem(corpus.adjective))
    .replace('@race', getRandomItem(corpus.race))
    .replace('@dclass', getRandomItem(corpus.dclass))
    .replace('@location', getRandomItem(corpus.location))
    .replace('@backstory', getRandomItem(corpus.backstory));
}
