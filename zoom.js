const numIterations = 16;

const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
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
	// loop:
	//      zoom
	//      upload
	//      prompt Midjourney
})();
