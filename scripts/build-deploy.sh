#!/usr/bin/env bash

tsc

cp .env build/.env
cp .npmrc build/.npmrc
cp .yarnrc build/.yarnrc
cp yarn.lock build/yarn.lock
cp package.json build/package.json

rsync -avzhP build pi@groupme.local:~/groupme-random-game
# ssh pi@groupme.local cd groupme-random-game && npm run stop && npm install && npm run start
