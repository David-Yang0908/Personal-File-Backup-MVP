const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const snsClient = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' });

exports.handler = async (event) => {
    console.log('Share file event:', JSON.stringify(event, null, 2));
    
    const topicArn = process.env.SNS_TOPIC_ARN;
    
    if (!topicArn) {
        console.error('SNS_TOPIC_ARN environment variable is not set');
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Server configuration error'
            })
        };
    }
    
    try {
        // 解析請求 body
        let body;
        try {
            body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
        } catch (parseError) {
            console.error('Failed to parse request body:', parseError);
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Invalid request body format'
                })
            };
        }
        
        // 驗證必要參數
        const fileName = body.fileName;
        const recipientEmail = body.recipientEmail;
        const customMessage = body.customMessage;
        const downloadUrl = body.downloadUrl; // 選填參數
        
        if (!fileName) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'fileName is required'
                })
            };
        }
        
        if (!recipientEmail) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'recipientEmail is required'
                })
            };
        }
        
        if (!customMessage) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'customMessage is required'
                })
            };
        }
        
        // 驗證 email 格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipientEmail)) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Invalid recipientEmail format'
                })
            };
        }
        
        // 準備 SNS 訊息內容（用於 JSON 格式）
        const notificationMessage = {
            event: 'file_shared',
            fileName: fileName,
            recipientEmail: recipientEmail,
            customMessage: customMessage,
            downloadUrl: downloadUrl || '',
            timestamp: new Date().toISOString()
        };
        
        // 準備人類可讀的郵件內容
        let emailContent = `檔案名稱: ${fileName}\n\n`;
        emailContent += `分享者的話:\n${customMessage}\n\n`;
        
        if (downloadUrl) {
            emailContent += `下載連結:\n${downloadUrl}\n\n`;
        }
        
        emailContent += `---\n此訊息由 Dropbex 系統自動發送`;
        
        // 發送 SNS 訊息
        const params = {
            TopicArn: topicArn,
            Message: emailContent, // 使用人類可讀的格式
            Subject: `[Dropbex] 有人分享了檔案給您`,
            MessageAttributes: {
                eventType: {
                    DataType: 'String',
                    StringValue: 'file_shared'
                },
                fileName: {
                    DataType: 'String',
                    StringValue: fileName
                },
                recipientEmail: {
                    DataType: 'String',
                    StringValue: recipientEmail
                }
            }
        };
        
        const snsResponse = await snsClient.send(new PublishCommand(params));
        
        // 記錄通知
        console.log('File share notification sent:', {
            fileName: fileName,
            recipientEmail: recipientEmail,
            messageId: snsResponse.MessageId,
            timestamp: new Date().toISOString()
        });
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'File share notification sent successfully',
                messageId: snsResponse.MessageId,
                fileName: fileName,
                recipientEmail: recipientEmail
            })
        };
    } catch (error) {
        console.error('Error processing file share notification:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: error.message || 'Internal server error'
            })
        };
    }
};

