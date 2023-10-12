// https://useapi.net/docs/start-here/setup-midjourney

async function verifyServer() {
	const discordToken = document.getElementById(`server-discord`)?.value;
	const serverId = document.getElementById(`server-server`)?.value;
	const data = {
		method: 'GET',
		headers: {
			Authorization: `${discordToken}`,
			'Content-Type': 'application/json',
		},
	};
	const url = `https://discord.com/api/v10/guilds/${serverId}`;
	await apiExecute(url, 'server', data);
}

async function verifyChannel() {
	const discord = document.getElementById(`channel-discord`)?.value;
	const channel = document.getElementById(`channel-channel`)?.value;
	const data = {
		method: 'GET',
		headers: {
			Authorization: `${discord}`,
			'Content-Type': 'application/json',
		},
	};
	const url = `https://discord.com/api/v10/channels/${channel}`;
	await apiExecute(url, 'channel', data);
}
