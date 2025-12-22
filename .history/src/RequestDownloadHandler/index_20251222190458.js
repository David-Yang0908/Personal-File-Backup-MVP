// RequestDownloadHandler/index.js 修正版
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({});
const BUCKET_NAME = process.env.BUCKET_NAME;

exports.handler = async (event) => {
    const fileName = event.queryStringParameters?.fileName;

    if (!fileName) {
        return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "Missing fileName parameter" }),
        };
    }

    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
            // 【關鍵修正】強制瀏覽器下載並設定原始檔名
            ResponseContentDisposition: `attachment; filename="${fileName.split('/').pop()}"`
        });

        // 產生 5 分鐘有效的連結
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
            body: JSON.stringify({ message: "Could not generate download URL", error: error.message }),
        };
    }
};