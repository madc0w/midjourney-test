// see https://dev.to/useapi/interact-with-midjourney-using-discord-api-3k3e

const axios = require('axios');
// const { Client, GatewayIntentBits, ChannelType } = require('discord.js');

const prompt = 'cats eating cheese';
const discordToken = process.env.DISCORD_TOKEN;
const channelId = '1161695321114558505';
const serverId = '1159876170100256778';
const accessToken = '';

(async () => {
	// console.log('ChannelType', ChannelType);
	// console.log('ChannelType.GuildText', ChannelType.GuildText);

	// await sleep(20000);

	// const client = new Client({
	// 	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
	// });

	// client.on('ready', async () => {
	// 	console.log(`Bot is ready as: ${client.user.tag}`);
	// 	// console.log('client.channels', client.channels);

	// 	client.channels.cache.map((channel) => {
	// 		console.log(channel);
	// 		if (
	// 			channel.type == ChannelType.GuildText &&
	// 			channel.permissionsFor(client.user).has('SEND_MESSAGES')
	// 		) {
	// 			channel.send('here I is!');
	// 		}
	// 	});

	// 	// Registering the command with Discord
	// 	// Replace 'server-id' with your server id
	// 	const guild = await client.guilds.cache.get(serverId);
	// 	await guild.commands.create({
	// 		name: 'imagine',
	// 		description: 'MJ imagine',
	// 	});
	// });

	// client.on('messageCreate', (msg) => {
	// 	console.log('message', msg);
	// 	// if (msg.content === '!hello') {
	// 	msg.channel.send('midjourney-bot here to save the day.');
	// 	// }
	// });

	// // Always last: your bot token
	// client.login(discordToken);

	// await sleep(120 * 1000);
	// return;

	// // do token exchange dance
	// // https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-refresh-token-exchange-example

	// const data = {
	// 	grant_type: 'refresh_token',
	// 	refresh_token: 'dORakZYZYnvsbX6pHZrLXvBZ262mYJ',
	// };
	// const headers = {
	// 	'Content-Type': 'application/x-www-form-urlencoded',
	// };

	// const config = {
	// 	headers,
	// 	auth: {
	// 		username: '1161680231862644776',
	// 		password: 'qPdT_ztT4VlUUbM4L3d24pX6ogzOWYSr',
	// 	},
	// };

	// const tokenExchangeResponse = await axios.post(
	// 	`https://discord.com/api/v10/oauth2/token`,
	// 	data,
	// 	config
	// );

	// obtain refresh token:

	// const data = {
	// 	grant_type: 'authorization_code',
	// 	code: accessToken,
	// 	redirect_uri: 'https://www.balloonary.com',
	// };

	// const config = {
	// 	headers: {
	// 		'Content-Type': 'application/x-www-form-urlencoded',
	// 	},
	// 	auth: {
	// 		username: '1161680231862644776',
	// 		password: 'qPdT_ztT4VlUUbM4L3d24pX6ogzOWYSr',
	// 	},
	// };

	// console.log('config', config);
	// console.log('data', data);
	// const tokenExchangeResponse = await axios.post(
	// 	`https://discord.com/api/v10/oauth2/token`,
	// 	data,
	// 	config
	// );

	// console.log(tokenExchangeResponse);
	// return;

	const headers = {
		// 'Content-Type': 'application/x-www-form-urlencoded',
		Authorization: discordToken,
	};
	console.log('headers', headers);

	const searchResponse = await axios({
		method: 'get',
		headers,
		url: `https://discord.com/api/v10/channels/${channelId}/application-commands/search?type=1&include_applications=true&query=imagine`,
	});
	// console.log(searchResponse);

	const applicationId = searchResponse.data.applications.find(
		(a) => a.name == 'Midjourney Bot'
	).id;
	const command = searchResponse.data.application_commands.find(
		(ac) => ac.application_id == applicationId
	);
	const version = command.version;
	const commandId = command.id;

	console.log('applicationId', applicationId);
	console.log('version', version);
	console.log('commandId', commandId);

	const sessionId = Math.floor(Math.random() * 1e12);
	const imagineResponse = await axios({
		method: 'post',
		url: 'https://discord.com/api/v10/interactions',
		headers: {
			// 'Content-Type': 'application/x-www-form-urlencoded',
			// 'Content-Type': 'application/json',
			Authorization: discordToken,
		},
		data: {
			type: 2,
			application_id: applicationId,
			guild_id: serverId,
			channel_id: channelId,
			session_id: sessionId,
			data: {
				version,
				id: commandId,
				name: 'imagine',
				type: 1,
				options: [
					{
						type: 3,
						name: 'prompt',
						value: prompt,
					},
				],
				application_command: {
					id: commandId,
					application_id: serverId,
					version,
					default_member_permissions: null,
					type: 1,
					nsfw: false,
					name: 'imagine',
					description: 'Create images with Midjourney',
					dm_permission: true,
					contexts: [0, 1, 2],
					integration_types: [0],
					options: [
						{
							type: 3,
							name: 'prompt',
							description: 'The prompt to imagine',
							required: true,
						},
					],
				},
				attachments: [],
			},
		},
	});
	console.log('imagine response', imagineResponse.status);

	// HTTP 204 means "no response", which is correct
	if (imagineResponse.status == 204) {
		const messagesResponse = await axios({
			method: 'get',
			headers,
			url: `https://discord.com/api/v10/channels/${channelId}/messages`,
		});
		console.log(messagesResponse.data);
	}
})();

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
