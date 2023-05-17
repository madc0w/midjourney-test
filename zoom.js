const numIterations = 16;

const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');
const {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
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
	const filename = 'mj/' + Math.floor(Math.random() * 1e12) + '.png';
	const uploadResult = await s3Upload(
		fs.readFileSync(
			'out/upscaled/11/001 - yodan_something_amazing_76600910-1653-403a-ae36-fdf953a83c3b-upscale.png'
		),
		filename,
		'image/png'
	);
	console.log(uploadResult);

	// generate initial image
	// loop:
	//      zoom
	//      upload
	//      prompt Midjourney
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

async function s3Delete(filename) {
	const command = new DeleteObjectCommand({
		Bucket: process.env.S3_BUCKET,
		Key: filename,
	});
	return await s3.send(command);
}
