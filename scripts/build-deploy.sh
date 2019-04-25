#!/usr/bin/env bash

tsc

cp .env build/.env
cp package-lock.json build/package-lock.json
cp package.json build/package.json

rsync -avzhP build/* pi@groupme.local:~/groupme-random-game
ssh pi@groupme.local "cd groupme-random-game && NODE_ENV=production npm -q install && NODE_ENV=production npm run start"
