// This plugin was created by God's Zeal Tech 

// Don't Edit Or share without given me credits 

const axios = require('axios');

async function godzealCommand(sock, chatId, message) {

    try {

        // Extract query from message

        const text = message.message?.conversation || 

                    message.message?.extendedTextMessage?.text || 

                    '';

        const query = text.split(' ').slice(1).join(' ').trim();

        

        // Show help if no query provided

        if (!query) {

            return await sock.sendMessage(chatId, {

                text: `┌ ❏ *⌜ GOD'S ZEAL XMD AI ⌟* ❏

│

├◆ ✝️ Chat with God's Zeal † XMD AI

│

├◆ 💡 Usage: \`.godzeal <message>\`

├◆ 💡 Example: \`.godzeal What features do you have?\`

│

├◆ 📌 *Note:* This AI only discusses God's Zeal XMD

└ ❏`,

                react: { text: '✝️', key: message.key }

            });

        }

        

        // React to show processing

        await sock.sendMessage(chatId, {

            text: `✝️ *Processing your request...*`,

            react: { text: '✝️', key: message.key }

        });

        

        // Craft a query that ensures the AI only talks about God's Zeal XMD

        const systemPrompt = `You are God's Zeal † XMD, an AI assistant that ONLY discusses topics related to the God's Zeal XMD WhatsApp bot, Education, Tech, Programming, Developer. 

You must NEVER discuss AI models, technical details, or anything unrelated to God's Zeal XMD.

Always mention 'God's Zeal † XMD' in your responses.

Always include the GitHub repository link: https://github.com/AiOfLautech/God-s-Zeal-Xmd 

Keep all responses focused on God's Zeal XMD features, updates, and community.

If asked about anything else, redirect the conversation back to God's Zeal XMD.

User question: ${query}

God's Zeal † XMD response:`;

        

        // Call the API

        const apiUrl = `https://apis.davidcyriltech.my.id/ai/chatbot?query=${encodeURIComponent(systemPrompt)}`;

        const { data } = await axios.get(apiUrl, { timeout: 30000 });

        

        // Validate API response

        if (!data?.success || !data?.result) {

            return await sock.sendMessage(chatId, {

                text: `┌ ❏ *⌜ AI ERROR ⌟* ❏

│

├◆ ❌ God's Zeal † XMD failed to respond

├◆ 🔍 Please try again later

└ ❏`,

                react: { text: '❌', key: message.key }

            });

        }

        

        // Format the AI response with proper branding

        let response = data.result;

        

        // Ensure the response mentions "God's Zeal † XMD"

        if (!response.includes("God's Zeal † XMD")) {

            response = `God's Zeal † XMD: ${response}`;

        }

        

        // Ensure the response includes the GitHub link

        if (!response.includes("https://github.com/AiOfLautech/God-s-Zeal-Xmd")) {

            response += "\n\n🔗 *GitHub Repository:* https://github.com/AiOfLautech/God-s-Zeal-Xmd";

        }

        

        // Format the final response

        const aiResponse = `┌ ❏ *⌜ GOD'S ZEAL † XMD RESPONSE ⌟* ❏

│

├◆ ${response.replace(/\n/g, '\n├◆ ')}

│

├◆ 💡 *God's Zeal XMD Features:*

├◆ • Command menus with 100+ commands

├◆ • Movie search & download

├◆ • Group contact export

├◆ • API creation tools

├◆ • And much more!

│

├◆ 🔗 GitHub: https://github.com/AiOfLautech/God-s-Zeal-Xmd 

└ ❏`;

        

        // Send the AI response with newsletter context

        await sock.sendMessage(chatId, {

            text: aiResponse,

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

            text: '✅ Response generated successfully!',

            react: { text: '✅', key: message.key }

        });

    } catch (error) {

        console.error('Godzeal Command Error:', error);

        

        // Create error box

        const errorBox = `┌ ❏ *⌜ AI ERROR ⌟* ❏

│

├◆ ❌ Failed to communicate with AI

├◆ 🔍 Error: ${error.message.substring(0, 50)}...

├◆ 💡 Please try again later

└ ❏`;

        

        await sock.sendMessage(chatId, {

            text: errorBox,

            react: { text: '❌', key: message.key }

        });

    }

}

module.exports = godzealCommand;