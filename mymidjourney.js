const token =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTI0OSwiZW1haWwiOiJtYXJjQGJhbGxvb25hcnkuY29tIiwidXNlcm5hbWUiOiJtYXJjQGJhbGxvb25hcnkuY29tIiwiaWF0IjoxNjk3MDMzMzQ2fQ.PETQOlUgswQjl9uJxR3_jVC46_521aGf1uVjjeeQIrA';

const axios = require('axios');

(async () => {
	const Authorization = `Bearer ${token}`;

	const imagineResponse = await axios({
		method: 'post',
		url: 'https://api.mymidjourney.ai/api/v1/midjourney/imagine',
		headers: {
			'Content-Type': 'application/json',
			Authorization,
		},
		data: {
			prompt: 'A cat eating cheese',
		},
	});
	console.log('imagine response', imagineResponse.data);

	const messageId = imagineResponse.data.messageId;

	setInterval(async () => {
		const progressResponse = await axios({
			method: 'get',
			url: `https://api.mymidjourney.ai/api/v1/midjourney/message/${messageId}`,
			headers: {
				Authorization,
			},
		});
		console.log('progress response', progressResponse.data);
	}, 800);
})();
