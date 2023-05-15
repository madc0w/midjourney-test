// const MidjourneyAPI = require('midjourney-api');
// const midjourney = new MidjourneyAPI(baseUrl, apiKey, verbose);

const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');

const baseUrl = 'https://api.midjourneyapi.io';
const apiKey = process.env.MIDJOURNEY_API_KEY;

const prompt = 'a happy girl holding purple balloons on fire, 8k, --ar 3:2';

(async () => {
	// https://docs.midjourneyapi.io/midjourney-api/midjourney-api/imagine

	let resultId;
	// {
	// 	const config = baseConfig(
	// 		{
	// 			// callbackURL: 'https://....', // Optional
	// 			prompt,
	// 		},
	// 		'imagine'
	// 	);
	// 	const response = await axios.request(config);
	// 	// log('imagine data', JSON.stringify(response.data));
	// 	log('credits', JSON.stringify(response.headers['midapi-credits']));

	// 	resultId = response.data.resultId;
	// }
	// log('resultId', resultId);

	// const imageUrl = await getResult(resultId, 'imageURL');
	// log('imageUrl', imageUrl);
	// const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
	// await downloadAndSaveImage(imageUrl, `out/${filename}`);
	// log(`wrote image out/${filename}`);

	const filename =
		'badygobylamy_a_happy_girl_holding_purple_balloons_on_fire_8k_7fa7b69b-a433-4726-9666-a8add08433ae.png';

	{
		const outFilename =
			filename.substring(0, filename.lastIndexOf('.')) + '-small.png';
		await scaleImage(`out/${filename}`, `out/${outFilename}`, 100, 100);
		const data = new FormData();
		data.append('image', fs.createReadStream(`out/${outFilename}`), filename);
		// data.append('callbackURL', 'https://....'); // Optional

		const config = {
			method: 'post',
			maxBodyLength: Infinity,
			url: `${baseUrl}/describe`,
			headers: {
				Authorization: apiKey,
				...data.getHeaders(),
			},
			data,
		};

		const response = await axios.request(config);

		// const config = baseConfig(formData.getHeaders(), 'describe', formData);
		// const response = await axios.request(config);

		// const response = await axios.post(`${baseUrl}/describe`, formData, {
		// 	maxBodyLength: Infinity,
		// 	data: JSON.stringify({
		// 		image: fs.readFileSync(`out/${outFilename}`),
		// 	}),
		// 	headers: {
		// 		Authorization: apiKey,
		// 		...formData.getHeaders(),
		// 	},
		// });

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

function baseConfig(data, endpoint, headers = {}) {
	return {
		method: 'post',
		maxBodyLength: Infinity,
		headers: {
			Authorization: apiKey,
			'Content-Type': 'application/json',
			...headers,
		},
		data: JSON.stringify(data),
		url: `${baseUrl}/${endpoint}`,
	};
}

async function getResult(resultId, key) {
	let isWaiting, result, credits;
	do {
		const config = baseConfig(
			{
				resultId,
			},
			'result'
		);
		// log('config', config);
		const response = await axios.request(config);
		// log('response', response.data);
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
		credits = response.headers['midapi-credits'];
	} while (!result);
	log('remaining credits:', credits);
	return result;
}

function log(message1 = '', message2 = '') {
	console.log(`${new Date().toISOString()} : ${message1}`, message2);
}

async function scaleImage(inputPath, outputPath, width, height) {
	const image = sharp(inputPath);
	const metadata = await image.metadata();

	// Calculate the scaling factor while maintaining the aspect ratio
	const scaleFactor = Math.min(
		width / metadata.width,
		height / metadata.height
	);

	await image
		.resize(
			Math.round(metadata.width * scaleFactor),
			Math.round(metadata.height * scaleFactor)
		)
		.toFile(outputPath);
}
