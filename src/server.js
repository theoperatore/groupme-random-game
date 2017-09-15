'use strict';

// pollyfill
import 'isomorphic-fetch';
import dotenv from 'dotenv';
import cron from 'node-cron';
import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import cors from 'cors';
import getRandomGame from './getRandomGame';
import { searchCompendium } from './proxyCompendium';

dotenv.config();

const PLATFORMS = [
  'Game Gear',
  'Super Nintendo Entertainment System',
  'Nintendo Entertainment System',
  'Game Boy',
  'Game Boy Color',
  'Game Boy Advance',
  'Nintendo 64',
  'Dreamcast',
  'PlayStation',
  'Genesis',
];

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
    image.tiny_url}`,
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

const sendGame = platform =>
  getRandomGame(process.env.GB_TOKEN, platform)
    .then(mapGameToPost(platform))
    .then(postToGroupme);

const sendCompendiumEntry = rawText =>
  searchCompendium(rawText)
    .then(mapResultsToPost)
    .then(postToGroupme);

const generateId = () => {
  const str = 'abcdefghijklmnopqrstuvwxyz';
  const time = Date.now();
  return new Array(22)
    .fill(1)
    .map(() => str[Math.floor(Math.random() * str.length -1)])
    .join('') + `${time}`;
}

// the server is 4 hours ahead of NYC time, so 5 hours ahead of
// Central time. So make this go off at 1:30pm server time,
// which should be somewhere around 8:30am central time.
cron.schedule('30 13 * * *', () => {
  const platform = getRandom(PLATFORMS);
  const id = generateId();
  console.log(`[log] ${id} cron sending game`, platform);
  sendGame(platform)
    .then(() => `[log] ${id}: did it ${new Date().toLocaleString()}`)
    .then(console.log)
    .catch(err => {
      console.log(`[error] ${id}`, err);
    });
});
console.log('scheduled...');

const app = express();

app.use(cors());
app.use(compression());
app.use(bodyParser.json());

app.post('/random', (req, res) => {
  const { text } = req.body;

  const id = generateId();
  if (text.match('#dnd')) {
    console.log(`[log] ${id} searching compendium:`, text);
    sendCompendiumEntry(text)
      .then(() => `[log] ${id}: did it ${new Date().toLocaleString()}`)
      .then(console.log)
      .catch(err => {
        console.log(`[error] ${id}`, err);
      });
  } else if (text.match('#random')) {
    const platform = getRandom(PLATFORMS);
    console.log(`[log] ${id} post sending random game`, platform);
    sendGame(platform)
      .then(() => `[log] ${id}: did it ${new Date().toLocaleString()}`)
      .then(console.log)
      .catch(err => {
        console.log(`[error] ${id}`, err);
      });
  }

  res.sendStatus(200);
});

app.listen(process.env.PORT || 9966, () => {
  console.log('server running...');
});
