import * as alorg from '@theoperatore/alorg-service';
import { Command } from '../../types';
import { CommandError } from '../../utils';

const client = alorg.createClient();

type Ability = {
  name: string;
};

type Monster = {
  name: string;
  race: string;
  abilities: Ability[];
  image?: string;
};

export const commandMonster: Command = async (botId: string) => {
  const response = await client.get('alorg://dnd-monster-api/random');

  if (!response.payload) {
    throw new CommandError('Failed to get random monster');
  }

  const monster = JSON.parse(response.payload) as Monster;

  return {
    bot_id: botId,
    text: `# ${monster.name}\n# ${monster.race}\n# ${monster.abilities
      .map(a => a.name)
      .join(', ')}`,
    image: monster.image,
  };
};
