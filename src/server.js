'use strict';

// pollyfill
import 'isomorphic-fetch';
import dotenv from 'dotenv';
import cron from 'node-cron';
import getRandomGame from './getRandomGame';

dotenv.config();

const PLATFORMS = [
  'Game Gear',
  'Super Nintendo Entertainment System',
  'Nintendo Entertainment System',
];

const mapGameToPost = platform => ({ image, name, deck, description, original_release_date, site_detail_url }) => ({
  text: `# ${name}\n# ${platform}\n# ${original_release_date}\n\n${deck}\n\n${site_detail_url}\n\n--GOTD`,
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
  sendGame(platform)
    .then(() => `did it, ${new Date().toLocaleString()}`)
    .then(console.log)
    .catch(console.error);
});
console.log('scheduled...');
