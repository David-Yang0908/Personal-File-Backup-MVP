const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const axios = require("axios"); // 需要安裝 axios

const s3Client = new S3Client({});
const BUCKET_NAME = process.env.BUCKET_NAME;

exports.handler = async (event) => {
    let fileName = event.queryStringParameters?.fileName;

    if (!fileName) {
        return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "Missing fileName parameter" }),
        };
    }

    try {
        // --- 核心改進：處理外部 arXiv 網址 ---
        if (fileName.startsWith('http')) {
            const url = fileName;
            const pureFileName = url.split('/').pop();
            const s3Key = `cache/${pureFileName}`; // 暫存在 cache 資料夾

            // 1. Lambda 在後端抓取檔案 (不受 CORS 限制)
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            
            // 2. 將檔案上傳到你的 S3 儲存桶
            await s3Client.send(new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: s3Key,
                Body: response.data,
                ContentType: 'application/pdf'
            }));

            // 3. 更新 fileName 為 S3 中的 Key
            fileName = s3Key;
        }

        // --- 產生下載連結 ---
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
            // 強制下載標頭
            ResponseContentDisposition: `attachment; filename="${fileName.split('/').pop()}"`
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,OPTIONS"
            },
            body: JSON.stringify({ downloadUrl: signedUrl }),
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "下載失敗", error: error.message }),
        };
    }
};