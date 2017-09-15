'use strict';

import qs from 'querystring';

const roll20Base = 'https://app.roll20.net/compendium/dnd5e';
const roll20Search = 'https://app.roll20.net/compendium/compendium/globalsearch/dnd5e';

const search = async term => fetch(`${roll20Search}?${qs.stringify({ terms: term })}`)
  .then(response => response.json());

const getDef = async pagename => fetch(`${roll20Base}/${qs.escape(pagename)}.json`)
  .then(response => response.json());

export const searchCompendium = async rawText => {
  const sanitized = rawText.split(' ')
    .filter(part => part !== '' || part !== ' ')
    .filter(part => !part.match('#dnd'))
    .join(' ');

  const searchResponse = await search(sanitized);

  if (searchResponse.length === 0) return `No definitions matching: ${sanitized}`;

  const defResponse = await getDef(searchResponse[0].pagename);

  return defResponse.content
    ? defResponse.content
    : `No content defined for: ${sanitized}`;
}
