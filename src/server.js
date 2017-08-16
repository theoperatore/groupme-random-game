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

const formatDate = date => new Intl.DateTimeFormat('en', {
  timeZone: 'UTC',
  month: 'short',
  year: 'numeric',
  day: 'numeric',
}).format(new Date(date));

const mapGameToPost = platform => ({ image, name, deck, description, original_release_date, site_detail_url }) => ({
  text: `# ${name}\n# ${platform}\n# ${formatDate(original_release_date)}\n\n${deck}\n\n${site_detail_url}\n\n--GOTD`,
  image: `${image.super_url || image.screen_url || image.medium_url || image.small_url || image.thumb_url || image.icon_url || image.tiny_url}`,
});

const postToGroupme = ({ text, image }) =>
  fetch(`https://api.groupme.com/v3/bots/post?token=${process.env.GM_TOKEN}`, {
    method: 'POST',
    headers: new Headers()
      .append('Content-Type', 'application/json'),
    body: JSON.stringify({
      bot_id: process.env.BOT_ID,
      text,
      picture_url: image,
    })
  });

const getRandom = itms =>
  itms[Math.floor(Math.random() * (itms.length - 1))];

const sendGame = platform =>
  getRandomGame(process.env.GB_TOKEN, platform)
    .then(mapGameToPost(platform))
    .then(postToGroupme);

// the server is 4 hours ahead of NYC time, so 5 hours ahead of
// Central time. So make this go off at 1:30pm server time,
// which should be somewhere around 8:30am central time.
cron.schedule('30 13 * * *', () => {
  const platform = getRandom(PLATFORMS);
  console.log('cron sending game', platform);
  sendGame(platform)
    .then(() => `did it, ${new Date().toLocaleString()}`)
    .then(console.log)
    .catch(console.error);
});
console.log('scheduled...');

const app = express();

app.use(cors());
app.use(compression());
app.use(bodyParser.json());

app.post('/random', (req, res) => {
  const { text } = req.body;

  if (!text || !text.match('#random')) return res.sendStatus(200);

  const platform = getRandom(PLATFORMS);
  console.log('sending random game from post', platform);
  sendGame(platform)
    .then(() => `did it, ${new Date().toLocaleString()}`)
    .then(console.log)
    .catch(console.error);

  res.sendStatus(200);
});

app.listen(process.env.PORT || 9966, () => {
  console.log('server running...');
});
