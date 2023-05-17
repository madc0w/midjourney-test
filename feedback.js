let prompt = 'something amazing --ar 3:2';
const numIterations = 16;

// const MidjourneyAPI = require('midjourney-api');
// const midjourney = new MidjourneyAPI(baseUrl, apiKey, verbose);
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');

const baseUrl = 'https://api.midjourneyapi.io';
const apiKey = process.env.MIDJOURNEY_API_KEY;
let initCredits;

(async () => {
	// https://docs.midjourneyapi.io/midjourney-api/midjourney-api/imagine

	const promptFilePath = `out/upscaled/prompts-${new Date().getTime()}.txt`;
	for (let i = 0; i < numIterations; i++) {
		prompt = prompt.replace(/ --ar \d+:\d+/, ' --ar 3:2');
		log(`prompt ${i}:`, prompt);
		fs.appendFileSync(promptFilePath, prompt + '\n', (err) => {
			if (err) {
				console.error(`error writing to ${promptFilePath}`, err);
			}
		});
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

		const jobId = imagineResult.jobId.includes('.')
			? imagineResult.jobId.substring(0, imagineResult.jobId.lastIndexOf('.'))
			: imagineResult.jobId;
		{
			const config = baseConfig(
				{
					messageId: imagineResult.messageId,
					jobId,
					position: 1,
				},
				'upscale'
			);
			const response = await axios.request(config);
			// log('upscale', JSON.stringify(response.data));
			resultId = response.data.resultId;
		}
		const upscaledImageUrl = (await getResult(resultId)).imageURL;
		let numStr = (i + 1).toString();
		while (numStr.length < 3) {
			numStr = '0' + numStr;
		}
		const upscaledFilename =
			numStr +
			' - ' +
			filename.substring(0, filename.lastIndexOf('.')) +
			'-upscale.png';
		await downloadAndSaveImage(
			upscaledImageUrl,
			`out/upscaled/${upscaledFilename}`
		);

		{
			const smallFilename =
				filename.substring(0, filename.lastIndexOf('.')) + '-small.png';
			await scaleImage(
				`out/upscaled/${upscaledFilename}`,
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
	log('resultId:', resultId);
	let isWaiting, result, credits, status, progress;
	do {
		const config = baseConfig(
			{
				resultId,
			},
			'result'
		);
		// log('config', config);
		const response = await axios.request(config);
		result = response.data;
		// log('result', result);
		if (result.status) {
			if (status != result.status) {
				status = result.status;
				log('status:', result.status);
				if (status == 'failed') {
					log('failed response:', result);
					throw new Error('failed response');
				}
			}
			if (result.percentage && progress != result.percentage) {
				progress = result.percentage;
				log(result.percentage + '%');
			}
		} else if (!isWaiting) {
			log('waiting...');
			isWaiting = true;
		}
		credits = response.headers['midapi-credits'];
	} while (status != 'completed' && !result?.content);
	log('remaining credits:', credits);
	if (initCredits) {
		log('spent credits:', initCredits - credits);
	} else {
		initCredits = credits;
	}
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
