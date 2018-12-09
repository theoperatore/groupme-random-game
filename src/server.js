'use strict';

// pollyfill
import 'isomorphic-fetch';
import dotenv from 'dotenv';
import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import alorg from '@theoperatore/alorg-service';
import getRandomGame from './getRandomGame';
import { searchCompendium } from './proxyCompendium';
import { whoami } from './whoami';
import PLATFORMS from './giantBombPlatform-corpus';

dotenv.config();

// retired for the full list of platforms
// const PLATFORMS = [
//   'Game Gear',
//   'Super Nintendo Entertainment System',
//   'Nintendo Entertainment System',
//   'Game Boy',
//   'Game Boy Color',
//   'Game Boy Advance',
//   'Nintendo 64',
//   'Dreamcast',
//   'PlayStation',
//   'Genesis',
// ];
const client = alorg.createClient();

const formatDate = date =>
  new Intl.DateTimeFormat('en', {
    timeZone: 'UTC',
    month: 'short',
    year: 'numeric',
    day: 'numeric',
  }).format(new Date(date));

const mapGameToPost = platform => ({
  image,
  name,
  deck,
  description,
  original_release_date,
  site_detail_url,
}) => ({
  text: `# ${name}\n# ${platform}\n# ${formatDate(
    original_release_date
  )}\n\n${deck}\n\n${site_detail_url}\n\n--GOTD`,
  image: `${image.super_url ||
    image.screen_url ||
    image.medium_url ||
    image.small_url ||
    image.thumb_url ||
    image.icon_url ||
    image.tiny_url ||
    ''}`,
});

const mapResultsToPost = text => ({
  text,
  image: null,
});

const postToGroupme = ({ text, image }) =>
  fetch(`https://api.groupme.com/v3/bots/post?token=${process.env.GM_TOKEN}`, {
    method: 'POST',
    headers: new Headers().append('Content-Type', 'application/json'),
    body: JSON.stringify({
      bot_id: process.env.BOT_ID,
      text,
      picture_url: image,
    }),
  });

const getRandom = itms => itms[Math.floor(Math.random() * (itms.length - 1))];

const sendGame = platform => {
  let gameName = '';
  return getRandomGame(process.env.GB_TOKEN, platform.id)
    .then(game => {
      gameName = game.name;
      return game;
    })
    .then(mapGameToPost(platform.name))
    .then(postToGroupme)
    .then(response => ({ response, gameName }));
};

const sendCompendiumEntry = rawText =>
  searchCompendium(rawText)
    .then(mapResultsToPost)
    .then(postToGroupme);

const sendWhoami = () =>
  whoami()
    .then(mapResultsToPost)
    .then(postToGroupme);

const generateId = () => {
  const str = 'abcdefghijklmnopqrstuvwxyz';
  const time = Date.now();
  return (
    new Array(22)
      .fill(1)
      .map(() => str[Math.floor(Math.random() * str.length - 1)])
      .join('') + `${time}`
  );
};

const helpText = `
Available commands are:
\`\`\`
#random     - get random GotD
#dnd <term> - query compendium
#whoami     - generate backstory
#monster    - random dnd5e monster
#help       - show this message
\`\`\`
`;

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(bodyParser.json());

app.get('/health_check', (req, res) => res.sendStatus(204));

app.post('/random', (req, res) => {
  const { text, sender_type } = req.body;
  const isBotMessage = sender_type === 'bot';

  if (!text || isBotMessage) return res.sendStatus(200);

  const id = generateId();
  // this goes first to ensure help text doesn't trigger
  // other commands
  if (text.match('#help')) {
    postToGroupme({ text: helpText });
  } else if (text.match('#whoami')) {
    console.log(`[log] ${id} generating backstory...`);
    sendWhoami()
      .then(() => `[log] ${id} ${new Date().toLocaleString()}`)
      .then(console.log)
      .catch(err => console.log(`[error] ${id}`, err));
  } else if (text.match('#dnd')) {
    console.log(`[log] ${id} searching compendium:`, text);
    sendCompendiumEntry(text)
      .then(() => `[log] ${id} ${new Date().toLocaleString()}`)
      .then(console.log)
      .catch(err => console.log(`[error] ${id}`, err));
  } else if (text.match('#random')) {
    const platform = getRandom(PLATFORMS);
    console.log(`[log] ${id} post sending random game`, platform.name);
    sendGame(platform)
      .then(
        ({ gameName }) =>
          `[log] ${id} ${new Date().toLocaleString()} ${gameName}`
      )
      .then(console.log)
      .catch(err => console.log(`[error] ${id}`, err));
  } else if (text.match('#monster')) {
    client.get('alorg://dnd-monster-api/random').then(response => {
      const monster = JSON.parse(response.payload);
      postToGroupme({
        text: `# ${monster.name}\n# ${monster.race}\n# ${monster.abilities.map(a => a.name).join(', ')}`,
        image: monster.image
      });
    })
    .catch(error => {
      console.error(error);
      postToGroupme({ text: `Failure: ${error.message}` });
    })
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 9966;
app.listen(PORT, () => {
  console.log(new Date(), 'server listening on', PORT);
});
