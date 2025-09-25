// This plugin was created by God's Zeal TEch
// Don't Edit Or share without given me credits 

const axios = require('axios');

async function tempnumCommand(sock, chatId, message) {
    try {
        // Extract query from message
        const text = message.message?.conversation || 
                    message.message?.extendedTextMessage?.text || 
                    '';
        const query = text.split(' ').slice(1).join(' ').trim();
        
        // Show help if no query provided
        if (!query) {
            const helpMessage = `┌ ❏ *⌜ TEMP NUMBER GUIDE ⌟* ❏
│
├◆ 📱 Get temporary numbers for verification
│
├◆ 💡 Usage: \`.tempnum <country-code>\`
├◆ 💡 Example: \`.tempnum us\`
│
├◆ 📌 *Note:* Use \`.templist\` to see available countries
├◆ 📌 *Note:* Use \`.otpbox <number>\` to check OTPs
└ ❏`;
            
            return await sock.sendMessage(chatId, {
                text: helpMessage,
                react: { text: '📱', key: message.key }
            });
        }
        
        const countryCode = query.toLowerCase();
        
        // Send processing message
        await sock.sendMessage(chatId, {
            text: `📱 *Fetching temporary numbers for ${countryCode.toUpperCase()}...*`,
            react: { text: '📱', key: message.key }
        });
        
        try {
            // API call with validation
            const { data } = await axios.get(
                `https://api.vreden.my.id/api/tools/fakenumber/listnumber?id=${countryCode}`,
                { 
                    timeout: 10000
                }
            );

            // Validate response
            if (!data?.status || data.status !== 200 || !data?.result || !Array.isArray(data.result)) {
                console.error("Invalid API structure:", data);
                return await sock.sendMessage(chatId, {
                    text: `┌ ❏ *⌜ API ERROR ⌟* ❏
│
├◆ ❌ Invalid API response format
├◆ 💡 Try: \`.tempnum us\`
└ ❏`,
                    react: { text: '❌', key: message.key }
                });
            }

            if (data.result.length === 0) {
                return await sock.sendMessage(chatId, {
                    text: `┌ ❏ *⌜ NO NUMBERS ⌟* ❏
│
├◆ ❌ No numbers available for *${countryCode.toUpperCase()}*
├◆ 💡 Try another country code
├◆ 💡 Use \`.templist\` to see available countries
└ ❏`,
                    react: { text: '📭', key: message.key }
                });
            }

            // Process numbers
            const numbers = data.result.slice(0, 25);
            const numberList = numbers.map((num, i) => 
                `├◆ ${String(i+1).padStart(2, ' ')}. ${num.number}`
            ).join("\n");

            // Final message with OTP instructions
            const responseMessage = `┌ ❏ *⌜ TEMPORARY NUMBERS ⌟* ❏
│
├◆ 🌍 Country: ${countryCode.toUpperCase()}
├◆ 📋 Numbers Found: ${numbers.length}
│
${numberList}
│
├◆ 💡 *How to use:*
├◆ 1. Select a number from the list
├◆ 2. Use it for verification
├◆ 3. Check OTP with: \`.otpbox <number>\`
│
├◆ 💡 Example: \`.otpbox ${numbers[0].number}\`
└ ❏`;

            await sock.sendMessage(chatId, {
                text: responseMessage,
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

        } catch (apiError) {
            console.error("API Error:", apiError);
            
            if (apiError.code === "ECONNABORTED") {
                await sock.sendMessage(chatId, {
                    text: `┌ ❏ *⌜ REQUEST TIMEOUT ⌟* ❏
│
├◆ ⏳ API took too long to respond
├◆ 💡 Try smaller country codes like 'us', 'gb'
├◆ 💡 Use \`.templist\` to see available countries
└ ❏`,
                    react: { text: '⏳', key: message.key }
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `┌ ❏ *⌜ API ERROR ⌟* ❏
│
├◆ ❌ ${apiError.message}
├◆ 💡 Try: \`.tempnum us\`
├◆ 💡 Use \`.templist\` to see available countries
└ ❏`,
                    react: { text: '⚠️', key: message.key }
                });
            }
        }

    } catch (error) {
        console.error('Tempnum Command Error:', error);
        
        const errorBox = `┌ ❏ *⌜ SYSTEM ERROR ⌟* ❏
│
├◆ ❌ Failed to process request
├◆ 🔍 Error: ${error.message.substring(0, 50)}...
└ ❏`;
        
        await sock.sendMessage(chatId, {
            text: errorBox,
            react: { text: '❌', key: message.key }
        });
    }
}

async function templistCommand(sock, chatId, message) {
    try {
        // Send processing message
        await sock.sendMessage(chatId, {
            text: `🌍 *Fetching available countries...*`,
            react: { text: '🌍', key: message.key }
        });
        
        try {
            const { data } = await axios.get("https://api.vreden.my.id/api/tools/fakenumber/country", {
                timeout: 10000
            });

            if (!data?.status || data.status !== 200 || !data?.result || !Array.isArray(data.result)) {
                return await sock.sendMessage(chatId, {
                    text: `┌ ❏ *⌜ COUNTRY LIST ERROR ⌟* ❏
│
├◆ ❌ Failed to fetch country list
├◆ 💡 Try again later
└ ❏`,
                    react: { text: '❌', key: message.key }
                });
            }

            // Format countries in groups of 5 for better readability
            const countries = data.result;
            const totalCountries = countries.length;
            
            // Create formatted country list
            let countryList = '';
            for (let i = 0; i < countries.length; i += 5) {
                const chunk = countries.slice(i, i + 5);
                const line = chunk.map(c => `${c.title} (\`${c.id}\`)`).join(' | ');
                countryList += `├◆ ${line}\n`;
            }
            
            // Final message
            const responseMessage = `┌ ❏ *⌜ AVAILABLE COUNTRIES ⌟* ❏
│
├◆ 🌍 Total Countries: ${totalCountries}
│
${countryList}
│
├◆ 💡 *How to use:*
├◆ 1. Use \`.tempnum <country-code>\` to get numbers
├◆ 2. Example: \`.tempnum us\` for United States
└ ❏`;

            await sock.sendMessage(chatId, {
                text: responseMessage,
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

        } catch (apiError) {
            console.error("Country List API Error:", apiError);
            
            const errorBox = `┌ ❏ *⌜ API ERROR ⌟* ❏
│
├◆ ❌ Failed to fetch country list
├◆ ⏳ ${apiError.code === "ECONNABORTED" ? "Request timed out" : "API connection error"}
├◆ 💡 Try again later
└ ❏`;
            
            await sock.sendMessage(chatId, {
                text: errorBox,
                react: { text: '❌', key: message.key }
            });
        }

    } catch (error) {
        console.error('Templist Command Error:', error);
        
        const errorBox = `┌ ❏ *⌜ SYSTEM ERROR ⌟* ❏
│
├◆ ❌ Failed to process request
├◆ 🔍 Error: ${error.message.substring(0, 50)}...
└ ❏`;
        
        await sock.sendMessage(chatId, {
            text: errorBox,
            react: { text: '❌', key: message.key }
        });
    }
}

async function otpboxCommand(sock, chatId, message) {
    try {
        // Extract query from message
        const text = message.message?.conversation || 
                    message.message?.extendedTextMessage?.text || 
                    '';
        const query = text.split(' ').slice(1).join(' ').trim();
        
        // Show help if no query provided
        if (!query) {
            const helpMessage = `┌ ❏ *⌜ OTP CHECK GUIDE ⌟* ❏
│
├◆ 🔑 Check OTP messages for temporary numbers
│
├◆ 💡 Usage: \`.otpbox <full-number>\`
├◆ 💡 Example: \`.otpbox +1234567890\`
│
├◆ 📌 *Note:* Get numbers first with \`.tempnum <country-code>\`
└ ❏`;
            
            return await sock.sendMessage(chatId, {
                text: helpMessage,
                react: { text: '🔑', key: message.key }
            });
        }
        
        const phoneNumber = query.trim();
        
        // Validate phone number format
        if (!phoneNumber.startsWith("+")) {
            return await sock.sendMessage(chatId, {
                text: `┌ ❏ *⌜ INVALID NUMBER ⌟* ❏
│
├◆ ❌ Invalid phone number format
├◆ 💡 Number must start with '+' (e.g., +1234567890)
├◆ 💡 Use \`.tempnum <country-code>\` to get valid numbers
└ ❏`,
                react: { text: '❌', key: message.key }
            });
        }
        
        // Send processing message
        await sock.sendMessage(chatId, {
            text: `🔑 *Checking OTP for ${phoneNumber}...*`,
            react: { text: '🔑', key: message.key }
        });
        
        try {
            // Fetch OTP messages
            const { data } = await axios.get(
                `https://api.vreden.my.id/api/tools/fakenumber/message?nomor=${encodeURIComponent(phoneNumber)}`,
                { 
                    timeout: 10000
                }
            );

            // Validate response
            if (!data?.status || data.status !== 200 || !data?.result || !Array.isArray(data.result)) {
                return await sock.sendMessage(chatId, {
                    text: `┌ ❏ *⌜ NO OTP MESSAGES ⌟* ❏
│
├◆ ❌ No OTP messages found for this number
├◆ 💡 Verify number is from \`.tempnum\` results
├◆ 💡 Wait a few moments if recently requested
└ ❏`,
                    react: { text: '⚠️', key: message.key }
                });
            }

            if (data.result.length === 0) {
                return await sock.sendMessage(chatId, {
                    text: `┌ ❏ *⌜ NO OTP MESSAGES ⌟* ❏
│
├◆ 🕒 No OTP messages yet for this number
├◆ 💡 Wait a few moments and try again
├◆ 💡 Verify the number was used for verification
└ ❏`,
                    react: { text: '⏳', key: message.key }
                });
            }

            // Format OTP messages
            const otpMessages = data.result.map(msg => {
                // Extract OTP code (matches common OTP patterns)
                const otpMatch = msg.content.match(/\b\d{4,8}\b/g);
                const otpCode = otpMatch ? otpMatch[0] : "Not found";
                
                return `├◆ ┌───────────────────
├◆ │ *From:* ${msg.from || "Unknown"}
├◆ │ *Code:* ${otpCode}
├◆ │ *Time:* ${msg.time_wib || msg.timestamp}
├◆ │ *Message:* ${msg.content.substring(0, 40)}${msg.content.length > 40 ? "..." : ""}
├◆ └───────────────────`;
            }).join("\n");

            const responseMessage = `┌ ❏ *⌜ OTP MESSAGES ⌟* ❏
│
├◆ 📱 Number: ${phoneNumber}
├◆ 📬 Messages Found: ${data.result.length}
│
${otpMessages}
│
├◆ 💡 *How to use:*
├◆ 1. Copy the OTP code from messages
├◆ 2. Enter it on the verification page
└ ❏`;

            await sock.sendMessage(chatId, {
                text: responseMessage,
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

        } catch (apiError) {
            console.error("OTP Check Error:", apiError);
            
            const errorBox = `┌ ❏ *⌜ OTP CHECK ERROR ⌟* ❏
│
├◆ ❌ ${apiError.code === "ECONNABORTED" ? "Request timed out" : "Failed to check OTP"}
├◆ ⏳ Try again later
├◆ 💡 Verify the number is correct
└ ❏`;
            
            await sock.sendMessage(chatId, {
                text: errorBox,
                react: { text: '❌', key: message.key }
            });
        }

    } catch (error) {
        console.error('OTPbox Command Error:', error);
        
        const errorBox = `┌ ❏ *⌜ SYSTEM ERROR ⌟* ❏
│
├◆ ❌ Failed to process request
├◆ 🔍 Error: ${error.message.substring(0, 50)}...
└ ❏`;
        
        await sock.sendMessage(chatId, {
            text: errorBox,
            react: { text: '❌', key: message.key }
        });
    }
}

module.exports = {
    tempnumCommand,
    templistCommand,
    otpboxCommand
};