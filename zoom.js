const prompt = 'something amazing --ar 3:2';
const numIterations = 16;
const zoomFactor = 0.8;

const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');
const {
	S3Client,
	PutObjectCommand,
	// DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const s3 = new S3Client({
	region: process.env.S3_REGION,
	credentials: {
		accessKeyId: process.env.S3_KEY,
		secretAccessKey: process.env.S3_SECRET,
	},
});

const baseUrl = 'https://api.midjourneyapi.io';
const apiKey = process.env.MIDJOURNEY_API_KEY;
let initCredits;

(async () => {
	// generate initial image
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
	log(upscaledImageUrl);
	const filename = upscaledImageUrl.substring(
		upscaledImageUrl.lastIndexOf('/') + 1
	);
	await downloadAndSaveImage(upscaledImageUrl, `out/${filename}`);
	const s3Filename = 'mj/' + filename;
	const uploadResult = await s3Upload(
		fs.readFileSync(`out/${filename}`),
		s3Filename,
		'image/png'
	);

	log(uploadResult);

	for (let i = 0; i < numIterations; i++) {
		// zoom
		const croppedFilename =
			filename.substring(0, filename.lastIndexOf('.')) +
			'-cropped.' +
			filename.substring(filename.lastIndexOf('.') + 1);
		const imageMetadata = await sharp(`out/${filename}`).metadata();
		log('imageMetadata', imageMetadata);

		await sharp(`out/${filename}`)
			.extract({
				width: Math.round(imageMetadata.width * zoomFactor),
				height: Math.round(imageMetadata.height * zoomFactor),
				left: Math.round((imageMetadata.width * (1 - zoomFactor)) / 2),
				top: Math.round((imageMetadata.height * (1 - zoomFactor)) / 2),
			})
			.toFile(`out/${croppedFilename}`);

		process.exit();
		//      upload
		//      prompt Midjourney
	}
})();

async function s3Upload(body, fileName, type) {
	const command = new PutObjectCommand({
		Bucket: process.env.S3_BUCKET,
		Key: fileName,
		Body: body,
		ContentType: type,
		ACL: 'public-read',
	});

	await s3.send(command);
	return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${fileName}`;
}

// throws "permission error"
// async function s3Delete(filename) {
// 	const command = new DeleteObjectCommand({
// 		Bucket: process.env.S3_BUCKET,
// 		Key: filename,
// 	});
// 	return await s3.send(command);
// }

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

async function downloadAndSaveImage(url, imagePath) {
	const response = await axios.get(url, { responseType: 'arraybuffer' });
	fs.writeFileSync(imagePath, response.data);
}
