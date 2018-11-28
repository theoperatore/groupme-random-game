const getAllPlatforms = async apiKey => {
  const rawResponse = await fetch(
    `http://www.giantbomb.com/api/platforms?api_key=${apiKey}&format=json&field_list=name,id`
  );
  const response = await rawResponse.json();

  // check response.error === "OK" && repsonse.status_code === 1
  return response.results;
};

const findGameMaxForPlatform = async (apiKey, platform = 9) => {
  const rawResponse = await fetch(
    `http://www.giantbomb.com/api/games?api_key=${apiKey}&format=json&platforms=${platform}&limit=1&field_list=id`
  );
  const response = await rawResponse.json();

  // check response.error === "OK" && repsonse.status_code === 1
  // only interseted in the "number_of_total_results"
  // mainly to help with random offsets
  return response.number_of_total_results;
};

// find a game given a max and platform
const findRandomGame = async (apiKey, platform = 9, gameMax = 1764) => {
  const offset = Math.round(Math.random() * gameMax + 1);
  const rawResponse = await fetch(
    `http://www.giantbomb.com/api/games?api_key=${apiKey}&format=json&platforms=${platform}&limit=1&offset=${offset}`
  );
  const response = await rawResponse.json();

  // check response.error === "OK" && repsonse.status_code === 1
  // but meh, that's for another person to do
  // I just want the game!
  return response.results[0];
};

export default async (apiKey, platformId) => {
  // const platforms = await getAllPlatforms(apiKey);
  // const platform = platforms.find(plat => plat.name === platformName) || {
  //   id: -1,
  // };
  // const maxGames = await findGameMaxForPlatform(apiKey, platform.id);
  const maxGames = await findGameMaxForPlatform(apiKey, platformId);

  return await findRandomGame(apiKey, platformId, maxGames);
};
