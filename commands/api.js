// This plugin was created by David Cyril 
// Don't Edit Or share without given me credits 

const axios = require('axios');

async function apiMakerCommand(sock, chatId, message) {
    try {
        // Extract query from message
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const query = text.split(' ').slice(1).join(' ').trim();
        
        // Show help if no query provided
        if (!query) {
            const helpMessage = `┌ ❏ *⌜ API MAKER GUIDE ⌟* ❏
│
├◆ 🌐 *Create custom API endpoints*
│
├◆ 💡 Usage: \`.createapi <METHOD> <ENDPOINT> <RESPONSE_TYPE>\`
│
├◆ 📌 *Examples:*
├◆ .createapi GET /users json
├◆ .createapi POST /create-user json
├◆ .createapi PUT /update-product json
│
├◆ 📝 *Parameters:*
├◆ • METHOD: GET, POST, PUT, DELETE
├◆ • ENDPOINT: Must start with '/'
├◆ • RESPONSE_TYPE: json, text, xml
└ ❏`;
            
            return await sock.sendMessage(chatId, {
                text: helpMessage,
                react: { text: '🌐', key: message.key }
            });
        }
        
        // Parse input safely
        const parts = query.split(/\s+/);
        if (parts.length < 3) {
            return await sock.sendMessage(chatId, {
                text: `┌ ❏ *⌜ INVALID FORMAT ⌟* ❏
│
├◆ ❌ Invalid format!
├◆ 💡 Use: \`.createapi <METHOD> <ENDPOINT> <RESPONSE_TYPE>\`
└ ❏`,
                react: { text: '❌', key: message.key }
            });
        }

        const [method, endpoint, responseType] = parts;

        // Validate method
        const validMethods = ['GET', 'POST', 'PUT', 'DELETE'];
        if (!validMethods.includes(method.toUpperCase())) {
            return await sock.sendMessage(chatId, {
                text: `┌ ❏ *⌜ INVALID METHOD ⌟* ❏
│
├◆ ❌ Invalid method!
├◆ 💡 Choose from: ${validMethods.join(', ')}
└ ❏`,
                react: { text: '❌', key: message.key }
            });
        }

        // Validate endpoint format
        if (!endpoint.startsWith('/')) {
            return await sock.sendMessage(chatId, {
                text: `┌ ❏ *⌜ INVALID ENDPOINT ⌟* ❏
│
├◆ ❌ Endpoint must start with '/'
├◆ 💡 Example: \`.createapi GET /users json\`
└ ❏`,
                react: { text: '❌', key: message.key }
            });
        }

        // Validate response type
        const validResponseTypes = ['json', 'text', 'xml'];
        if (!validResponseTypes.includes(responseType.toLowerCase())) {
            return await sock.sendMessage(chatId, {
                text: `┌ ❏ *⌜ INVALID RESPONSE ⌟* ❏
│
├◆ ❌ Invalid response type!
├◆ 💡 Choose from: ${validResponseTypes.join(', ')}
└ ❏`,
                react: { text: '❌', key: message.key }
            });
        }

        // React to show processing
        await sock.sendMessage(chatId, {
            text: `🔧 *Processing API creation...*`,
            react: { text: '🔧', key: message.key }
        });

        // Generate API details
        const apiStructure = {
            method: method.toUpperCase(),
            endpoint: endpoint,
            responseType: responseType.toLowerCase(),
            createdAt: new Date().toISOString(),
            status: "draft"
        };

        // Create response template
        const responseTemplates = {
            json: { status: true, message: "API endpoint created successfully", data: {} },
            text: "API endpoint created successfully",
            xml: `<?xml version="1.0" encoding="UTF-8"?><api><status>true</status><message>API endpoint created successfully</message></api>`
        };

        // Select correct response format
        const responseTemplate = responseTemplates[responseType.toLowerCase()];

        // Auto-generate API implementation
        const apiCode = `
// ${apiStructure.method} ${apiStructure.endpoint}
app.${apiStructure.method.toLowerCase()}('${apiStructure.endpoint}', (req, res) => {
    try {
        // Your API logic here
        res.${apiStructure.responseType}(${JSON.stringify(responseTemplate, null, 2)});
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});
`;

        // Format the API details message
        const apiDetails = `┌ ❏ *⌜ API ENDPOINT CREATED ⌟* ❏
│
├◆ 📍 Method: *${apiStructure.method}*
├◆ 🔗 Endpoint: *${apiStructure.endpoint}*
├◆ 📦 Response Type: *${apiStructure.responseType}*
├◆ ⏰ Created: *${new Date(apiStructure.createdAt).toLocaleString()}*
│
├◆ 📋 *Sample Implementation:*
├◆ \`\`\`javascript
${apiCode}
├◆ \`\`\`
│
├◆ 📋 *Sample Response:*
├◆ \`\`\`${apiStructure.responseType}
${JSON.stringify(responseTemplate, null, 2)}
├◆ \`\`\`
└ ❏`;

        // Send API details with newsletter context
        await sock.sendMessage(chatId, {
            text: apiDetails,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363269950668068@newsletter',
                    newsletterName: '❦ ════ •⊰❂ GODSZEAL XMD  ❂⊱• ════ ❦',
                    serverMessageId: -1
                }
            }
        });
        
        // React to successful completion
        await sock.sendMessage(chatId, {
            text: '✅ API endpoint created successfully!',
            react: { text: '✅', key: message.key }
        });

    } catch (error) {
        console.error('API Maker Error:', error);
        
        // Create error box
        const errorBox = `┌ ❏ *⌜ API CREATION FAILED ⌟* ❏
│
├◆ ❌ Failed to create API endpoint
├◆ 🔍 Error: ${error.message.substring(0, 50)}...
├◆ 💡 Please check your parameters and try again
└ ❏`;
        
        await sock.sendMessage(chatId, {
            text: errorBox,
            react: { text: '❌', key: message.key }
        });
    }
}

module.exports = apiMakerCommand;