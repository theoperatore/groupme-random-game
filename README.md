### Groupme command bot

A small server meant to handle webhooks for the [GroupMe chat service](https://web.groupme.com). This bot server responds to all incoming messages.

#### How it works

1. A message comes in; if it's from a bot, ignore it.
2. Run the message through the command parser, if there is a match execute the command
3. All commands return a `GroupMeResponse` type
4. After a command has finished, a response is posted to the chat channel.

#### What are the parts

There is a small express server running with two endpoints; one is healthcheck and the other is for groupme. The groupme handler expects a `GroupMePostBody` type as json.

The main part is the parser, to which you can add commands, a help message, and a function that is expected to eventually resolve to a `GroupMeResponse`.

Since this is a chat service and all messages are being parsed, I needed a way to specify which messages are meant for commands and which are not. Any message that contains a `#<text>` will be treated as a command. For example:

```
#whoami
```

Will generate a random dnd backstory.

```
#gotd
```

Will search for a random game from Giant Bomb's api.

```
#dnd unconscious
```

Will search the DnD 5e Roll20 Compendium.

One downside is that any `#` anywhere in the text will be treated as a command, the parser isn't very smart. It just works on convention.

#### Environment requirements

These are pretty specific to my use case; if you're trying to make exactly this service, then they're all required. However, I encourage you to find & replace these instances to meet your needs.

- `GB_TOKEN` needs to be set to your giantbomb's api token to make requests
- `GM_TOKEN` needs to be set in order to send messages to GroupMe chats
- `DEV_BOT_ID` and `PROD_BOT_ID` are the bot ids to two separate channels that I maintain; one for testing in the wild and the other for production. I found it easier to reply a message back to the group that sent it; I have two bots set up for two distinct GroupMe channels. Just made my life easier. Haven't found a way to automate this yet...
- `PORT` for setting the port the server runs on. Defaults to `9966`.

#### All current commands

-`#dnd <term>` will search the dnd 5e roll20 compendium for your search term and reply with the correct markdown. It's a shame they return markdown and not json or some other more usable format. Although I think I'm not supposed to do this so.

- `#gotd` will select a round-robin video game platform from all platforms and return a random video game. I have this as a cron job to get a `Game of the Day`. It's quite fun and what inspiried all of this setup.
- `#whoami` is shamefully stolen from [http://whothefuckismydndcharacter.com](http://whothefuckismydndcharacter.com). It's pretty fun to have everyone see your backstory in the chat.
- `#monster` will search an upstream service that I'm running locally. It's an instance of another project I created, [Dnd Monster Api](https://github.com/theoperatore/dnd-monster-api) which is running either a graphql, grpc, or [alorg service](https://github.com/theoperatore/alorg-service) which is a small little microservice messaging and discovery library I made. This last command was more of a fun pet project sort of thing. Alorg Services aren't meant to be in the wild...

#### License

MIT
