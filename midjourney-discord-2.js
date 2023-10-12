const axios = require('axios');
const { Client, GatewayIntentBits } = require('discord.js');

const discordToken =
	'MTE1OTg3NTI0Mjc5ODM1NDQ2Mg.G4fRaU.9b4QSV4GiD5wctqkrrKTGyWy6AeNqJiEiPE7d0';
const channelId = '1161695321114558505';

(async () => {
	// const Authorization = discordToken;
	// const client = new Client({
	// 	intents: [
	// 		GatewayIntentBits.Guilds,
	// 		GatewayIntentBits.GuildMessages,
	// 		GatewayIntentBits.MessageContent,
	// 	],
	// });

	// client.login(discordToken);

	// client.on('ready', () => {
	// 	console.log(`logged in ${client.user.tag}`);
	// });

	const searchResponse = await axios({
		method: 'get',
		headers: {
			// 'Content-Type': 'application/x-www-form-urlencoded',
			// 'Content-Type': 'application/json',
			Authorization: discordToken,
		},
		url: `https://discord.com/api/v10/channels/${channelId}/application-commands/search?type=1&include_applications=true&query=imagine`,
	});
	console.log(searchResponse);
	return;

	const imagineResponse = await axios({
		method: 'post',
		url: 'https://api.useapi.net/v1/jobs/imagine',
		// headers: {
		// 	'Content-Type': 'application/x-www-form-urlencoded',
		// 	// 'Content-Type': 'application/json',
		// 	// Authorization,
		// },
		data: {
			prompt: 'cats eating cheese',
			discord: discordToken,
			server: '1159876170100256778',
			channel: '1161695321114558505',
			maxJobs: 3,
			// replyUrl: 'Place your call back URL here. Optional.',
			// replyRef: 'Place your reference id here.Optional.',
		},
	});
	console.log('imagine response', imagineResponse.data);
})();
