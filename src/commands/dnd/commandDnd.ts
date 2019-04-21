import * as qs from 'querystring';
import { request } from '../../utils';
import { Command } from '../../types';

const search = async <T>(term: string) =>
  request<T>({
    host: 'app.roll20.net',
    path: `/compendium/compendium/globalsearch/dnd5e?${qs.stringify({
      terms: term,
    })}`,
    headers: {
      accept: 'application/json',
    },
  });

const getDef = async <T>(pagename: string) =>
  request<T>({
    host: 'app.roll20.net',
    path: `/compendium/dnd5e/${qs.escape(pagename)}.json`,
    headers: {
      accept: 'application/json',
    },
  });

type SearchResponse = {
  pagename: string;
};

type DefinitionResponse = {
  content?: string;
};

const searchCompendium = async (rawText: string) => {
  const sanitized = rawText
    .split(' ')
    .map(part => part.trim())
    .filter(part => part !== '')
    .filter(part => !part.match('#dnd'))
    .join(' ');

  const searchResponse = await search<SearchResponse[]>(sanitized);

  if (!searchResponse || searchResponse.length === 0)
    return `No definitions matching: ${sanitized}`;

  const defResponse = await getDef<DefinitionResponse>(
    searchResponse[0].pagename
  );

  let out = `No content defined for: ${sanitized}`;
  if (defResponse && defResponse.content) {
    const { content } = defResponse;
    if (content.length >= 500) {
      out = `${content.substr(
        0,
        500
      )}...\n\nhttps://app.roll20.net/compendium/dnd5e/${qs.escape(
        searchResponse[0].pagename
      )}`;
    } else {
      out = content;
    }
  }

  return out;
};

export const commandDnd: Command = async (botId: string, rawText: string) => {
  const text = await searchCompendium(rawText);
  return {
    bot_id: botId,
    text,
  };
};
