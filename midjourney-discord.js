const { Client, GatewayIntentBits } = require('discord.js');
const { Configuration, OpenAI } = require('openai');

const openAi = new OpenAI({
	apiKey: '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',
});

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

client.on('messageCreate', async (message) => {
	console.log(`message: ${message}`);
	// console.log(message);
});

client.on('ready', () => {
	console.log(`logged in ${client.user.tag}`);
});

client.login(
	'MTE2MTY4MDIzMTg2MjY0NDc3Ng.GTmPvl.e--Ca_rqwLNiadYlPu_054LmyJIUbckv_Ds1LA'
);
