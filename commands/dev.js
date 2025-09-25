// This plugin was created by God's Zeal 
// Don't Edit Or share without given me credits 

const settings = require('../settings'); // Added settings import

async function devCommand(sock, chatId, message) {
    try {
        // Extract user name
        const pushname = message.pushName || "there";
        
        // Developer info
        const devInfo = {
            name: "Godszeal",
            whatsapp: "wa.me/2348089336992",
            youtube: "https://youtube.com/@Godszealtech",
            image: "https://jkgzqdubijffqnwcdqvp.supabase.co/storage/v1/object/public/uploads/Godszeal40.jpeg"
        };
        
        // Format the developer message with animation effects
        const devMessage = `┌ ❏ *⌜ DEVELOPER INFORMATION ⌟* ❏
│
├◆ 👋 Hello ${pushname}
├◆ I'm *Godszeal*, creator and developer of this smart bot.
│
├◆ *MY INFO:*
├◆ ────────────────────
├◆ 🪀 *Name:* Godszeal
├◆ 🪀 *WhatsApp:* ${devInfo.whatsapp}
├◆ 🪀 *YouTube:* ${devInfo.youtube}
│
├◆ *Bot Details:*
├◆ 📦 *Bot Name:* GODSZEAL XMD
├◆ 🌐 *Version:* ${settings.version || '2.0.5'}
├◆ 🛠️ *Features:* 100+ Commands
│
├◆ *Support Me:*
├◆ ❤️ Subscribe to my YouTube channel
├◆ 💬 Join my WhatsApp community
│
├◆ ✨ *Thank you for using GODSZEAL XMD!*
└ ❏
‎
${'='.repeat(30)}
⚡ *Godszeal is working hard for you!*
💡 *Type .help for command list*
${'='.repeat(30)}`;

        // Send the developer info with animated image
        await sock.sendMessage(chatId, {
            image: { url: devInfo.image },
            caption: devMessage,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                mentionedJid: [message.key.remoteJid],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363269950668068@newsletter',
                    newsletterName: '❦ ════ •⊰❂ GODSZEAL XMD  ❂⊱• ════ ❦',
                    serverMessageId: -1
                },
                externalAdReply: {
                    title: 'GODSZEAL XMD Bot',
                    body: 'Created with Godszeal Tech',
                    thumbnailUrl: devInfo.image,
                    mediaType: 1,
                    renderSmallerThumbnail: true,
                    showAdAttribution: true,
                    mediaUrl: devInfo.youtube,
                    sourceUrl: devInfo.youtube
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Dev Command Error:', error);
        
        // Create error box
        const errorBox = `┌ ❏ *⌜ DEVELOPER INFO ERROR ⌟* ❏
│
├◆ ❌ Failed to show developer information
├◆ 🔍 Error: ${error.message.substring(0, 50)}...
└ ❏`;
        
        await sock.sendMessage(chatId, {
            text: errorBox,
            react: { text: '❌', key: message.key }
        });
    }
}

module.exports = devCommand;