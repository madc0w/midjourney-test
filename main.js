// const MidjourneyAPI = require('midjourney-api');
// const midjourney = new MidjourneyAPI(baseUrl, apiKey, verbose);

const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');

const baseUrl = 'https://api.midjourneyapi.io';
const apiKey = process.env.MIDJOURNEY_API_KEY;

let prompt = 'happy girl holding cute guinea pig --ar 3:2';

(async () => {
	// https://docs.midjourneyapi.io/midjourney-api/midjourney-api/imagine

	for (let i = 0; i < 8; i++) {
		log(`prompt ${i}:`, prompt);
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
			// log('imagine data', JSON.stringify(response.data));
			// log('credits', JSON.stringify(response.headers['midapi-credits']));

			resultId = response.data.resultId;
		}
		// log('resultId', resultId);

		const imagineResult = await getResult(resultId);
		const imageUrl = imagineResult.imageURL;
		// log('imagineResult', imagineResult);
		const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
		await downloadAndSaveImage(imageUrl, `out/${filename}`);
		// log(`wrote image out/${filename}`);

		{
			const config = baseConfig(
				{
					messageId: imagineResult.messageId,
					jobId: imagineResult.jobId,
					position: 1,
				},
				'upscale'
			);
			const response = await axios.request(config);
			// log('upscale', JSON.stringify(response.data));
			resultId = response.data.resultId;
		}
		const upscaledImageUrl = (await getResult(resultId)).imageURL;
		const upscaledFilename =
			filename.substring(0, filename.lastIndexOf('.')) + '-upscale.png';
		await downloadAndSaveImage(upscaledImageUrl, `out/${upscaledFilename}`);

		{
			const smallFilename =
				filename.substring(0, filename.lastIndexOf('.')) + '-small.png';
			await scaleImage(
				`out/${upscaledFilename}`,
				`out/${smallFilename}`,
				400,
				400
			);
			const data = new FormData();
			data.append(
				'image',
				fs.createReadStream(`out/${smallFilename}`),
				filename
			);
			// data.append('callbackURL', 'https://....'); // Optional

			const config = baseConfig(null, 'describe', data.getHeaders());
			config.data = data;
			const response = await axios.request(config);

			// log('describe', JSON.stringify(response.data));
			resultId = response.data.resultId;
		}
		const description = (await getResult(resultId)).content;
		prompt = description[0].substring(4);
	}
})();

async function downloadAndSaveImage(url, imagePath) {
	const response = await axios.get(url, { responseType: 'arraybuffer' });
	fs.writeFileSync(imagePath, response.data);
}

function baseConfig(data, endpoint, headers = {}) {
	// log('baseConfig endpoint', endpoint);
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

async function getResult(resultId) {
	let isWaiting, result, credits, prevStatus, prevProgress;
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
			if (prevStatus != response.data.status) {
				prevStatus = response.data.status;
				log('status:', response.data.status);
			}
			if (
				response.data.percentage &&
				prevProgress != response.data.percentage
			) {
				prevProgress = response.data.percentage;
				log(response.data.percentage + '%');
			}
		} else if (!isWaiting) {
			log('waiting...');
			isWaiting = true;
		}
		result = response.data;
		credits = response.headers['midapi-credits'];
	} while (prevStatus != 'completed');
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
