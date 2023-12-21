// using https://www.npmjs.com/package/midjourney-discord-api

const channelId = '1161695321114558505';
const serverId = '1159876170100256778';

// const Midjourney = require('midjourney-discord-api');
// import Midjourney from 'midjourney-discord-api';

(async () => {
	const Midjourney = await import('midjourney-discord-api');

	// const client = new Midjourney.Midjourney(process.env.DISCORD_TOKEN);
	// Midjourney.setDiscordChannelUrl(
	// 	`https://discord.com/channels/${serverId}/${channelId}`
	// );
	const client = new Midjourney.Midjourney('interaction.txt');
	// const msgs = await cli.getMessages();
	// console.log(msgs.length + ' messages visible'); // by default get 50 messages

	const msg = await client.imagine(
		'A photo of an astronaut riding a horse'
		/* add optional progress function (percent) => void */
	);
	console.log('you find your result here: ', msg.attachments[0].url);
})();
