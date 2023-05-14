// const MidjourneyAPI = require('midjourney-api');
// const midjourney = new MidjourneyAPI(baseUrl, apiKey, verbose);

const fs = require('fs');
const axios = require('axios');

const baseUrl = 'https://api.midjourneyapi.io';
const apiKey = process.env.MIDJOURNEY_API_KEY;

const prompt = 'a happy girl holding purple balloons on fire, 8k, --ar 3:2';

(async () => {
	// https://docs.midjourneyapi.io/midjourney-api/midjourney-api/imagine

	let resultId;
	{
		const config = baseConfig(
			{
				// callbackURL: 'https://....', // Optional
				prompt,
			},
			'imagine'
		);
		const response = await axios.request(config);
		// log('imagine', JSON.stringify(response.data));
		resultId = response.data.resultId;
	}

	const imageUrl = await getResult(resultId, 'imageUrl');
	log('imageUrl', imageUrl);
	const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
	await downloadAndSaveImage(imageUrl, `out/${filename}`);
	log(`wrote image out/${filename}`);

	{
		const config = baseConfig(
			{
				image: fs.readFileSync(`out/${filename}`),
			},
			'describe',
			'multipart/form-data'
		);
		const response = await axios.request(config);
		log('describe', JSON.stringify(response.data));
		resultId = response.data.resultId;
	}
	const description = await getResult(resultId, 'content');
	log('description', description);

	// /**********  IMAGINE  ***********/

	// // Imagine request
	// const req1 = await midjourney.imagine('a red knight riding a blue horse');

	// // await sleep(30 * 1000);

	// // Get result
	// let status, res1;
	// do {
	// 	res1 = await midjourney.getResult(req1.resultId);
	// 	log('res1', res1);
	// 	status = res1.status;
	// } while (status == 'pending');

	// /**********  IMAGINE  ***********/

	// /**********  UPSCALE IMAGE #2  ***********/

	// // Upscale request
	// const req2 = await midjourney.upscale(res1.messageId, res1.jobId, 2);

	// await sleep(30 * 1000);

	// // Get result
	// const res2 = await midjourney.getResult(req2.resultId);
	// log('res2', res2);
	// process.exit();

	// /**********  UPSCALE IMAGE #2 ***********/

	// /**********  VARIATIONS OF IMAGE #3 ***********/

	// // Variations request
	// const req3 = await midjourney.variations(res1.messageId, res1.jobId, 3);

	// await sleep(30 * 1000);

	// // Get result
	// const res3 = await midjourney.getResult(req3.resultId);

	// /**********  VARIATIONS OF IMAGE #3  ***********/

	// /**********  GET SEED OF THE FIRST COMMAND  ***********/

	// // seed request
	// const req4 = await midjourney.getSeed(res1.messageId, res1.jobId);

	// await sleep(5 * 1000);

	// // Get result
	// const res4 = await midjourney.getResult(req4.resultId);
	// log('res4 ', res4);

	// /**********  GET SEED OF THE FIRST COMMAND ***********/

	// /**********  BLEND TWO IMAGES  ***********/

	// // seed request
	// const req5 = await midjourney.blend(
	// 	[
	// 		{
	// 			// FILE 1
	// 			file: fs.createReadStream('./images/image1.png'),
	// 			name: 'image1.png',
	// 		},
	// 		{
	// 			// FILE 2
	// 			file: fs.createReadStream('./images/image2.png'),
	// 			name: 'image2.png',
	// 		},
	// 		{
	// 			// FILE 3
	// 			file: fs.createReadStream('./images/image3.png'),
	// 			name: 'image3.png',
	// 		},
	// 	],
	// 	'Landscape'
	// );

	// await sleep(30 * 1000);

	// // Get result
	// const res5 = await midjourney.getResult(req5.resultId);

	// /**********  BLEND TWO IMAGES ***********/

	// /**********  DESCRIBE AN IMAGE  ***********/

	// // seed request
	// const req6 = await midjourney.describe({
	// 	// FILE 1
	// 	file: fs.createReadStream('./images/image2.png'),
	// 	name: 'image2.png',
	// });

	// await sleep(30 * 1000);

	// // Get result
	// const res6 = await midjourney.getResult(req6.resultId);

	// /**********  DESCRIBE AN IMAGE  ***********/
})();

async function downloadAndSaveImage(url, imagePath) {
	const response = await axios.get(url, { responseType: 'arraybuffer' });
	fs.writeFileSync(imagePath, response.data);
}

function baseConfig(data, endpoint, contentType) {
	return {
		method: 'post',
		maxBodyLength: Infinity,
		headers: {
			Authorization: apiKey,
			'Content-Type': contentType || 'application/json',
		},
		data: JSON.stringify(data),
		url: `${baseUrl}/${endpoint}`,
	};
}

async function getResult(resultId, key) {
	let isWaiting, result;
	do {
		const config = baseConfig(
			{
				resultId,
			},
			'result'
		);
		// log('config', config);
		const response = await axios.request(config);
		log('response', response.data);
		if (response.data.status) {
			log('status:', response.data.status);
			if (response.data.percentage) {
				log(response.data.percentage + '%');
			}
		} else if (!isWaiting) {
			log('waiting...');
			isWaiting = true;
		}
		result = response.data[key];
	} while (!result);
	return result;
}

function log(message1 = '', message2 = '') {
	console.log(`${new Date().toISOString()} : ${message1}`, message2);
}
