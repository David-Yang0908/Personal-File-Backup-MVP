const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({});
const BUCKET_NAME = process.env.BUCKET_NAME;

exports.handler = async (event) => {
    // 從網址參數取得檔名，例如: ?fileName=test.txt
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
        });

        // 產生 5 分鐘內有效的臨時下載連結
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
            body: JSON.stringify({ message: "Could not generate download URL" }),
        };
    }
};