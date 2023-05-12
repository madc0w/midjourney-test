// const MidjourneyAPI = require('midjourney-api');
// const midjourney = new MidjourneyAPI(baseUrl, apiKey, verbose);

const baseUrl = 'https://api.midjourneyapi.io';
const apiKey = 'e08acd94-e16a-4e87-b906-f2e0e5ad26fd';

const prompt = 'a happy girl holding purple balloons on fire, 8k, --ar 3:2';

(async () => {
	// https://docs.midjourneyapi.io/midjourney-api/midjourney-api/imagine
	const axios = require('axios');

	let resultId;
	{
		const data = JSON.stringify({
			// callbackURL: 'https://....', // Optional
			prompt,
		});

		const config = {
			method: 'post',
			maxBodyLength: Infinity,
			url: `${baseUrl}/imagine`,
			headers: {
				Authorization: apiKey,
				'Content-Type': 'application/json',
			},
			data,
		};

		const response = await axios.request(config);
		// console.log('imagine', JSON.stringify(response.data));
		resultId = response.data.resultId;
	}

	let imageUrl, isWaiting;
	do {
		const data = JSON.stringify({
			resultId,
		});

		const config = {
			method: 'post',
			maxBodyLength: Infinity,
			url: `${baseUrl}/result`,
			headers: {
				Authorization: apiKey,
				'Content-Type': 'application/json',
			},
			data,
		};

		const response = await axios.request(config);
		// console.log('result', JSON.stringify(response.data));
		if (response.data.status) {
			console.log('status:', response.data.status);
			if (response.data.percentage) {
				console.log(response.data.percentage + '%');
			}
		} else if (!isWaiting) {
			console.log('waiting...');
			isWaiting = true;
		}
		imageUrl = response.data.imageURL;
	} while (!imageUrl);
	console.log('imageUrl', imageUrl);

	// /**********  IMAGINE  ***********/

	// // Imagine request
	// const req1 = await midjourney.imagine('a red knight riding a blue horse');

	// // await sleep(30 * 1000);

	// // Get result
	// let status, res1;
	// do {
	// 	res1 = await midjourney.getResult(req1.resultId);
	// 	console.log('res1', res1);
	// 	status = res1.status;
	// } while (status == 'pending');

	// /**********  IMAGINE  ***********/

	// /**********  UPSCALE IMAGE #2  ***********/

	// // Upscale request
	// const req2 = await midjourney.upscale(res1.messageId, res1.jobId, 2);

	// await sleep(30 * 1000);

	// // Get result
	// const res2 = await midjourney.getResult(req2.resultId);
	// console.log('res2', res2);
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
	// console.log('res4 ', res4);

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

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
