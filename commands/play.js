const axios = require('axios');

async function playCommand(sock, chatId, message) {
    try {
        // Extract query from message
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const searchQuery = text.split(' ').slice(1).join(' ').trim();
        
        // Validate input with styled message
        if (!searchQuery) {
            return await sock.sendMessage(chatId, {
                text: `┌ ❏ *⌜ MUSIC HUB ⌟* ❏
│
├◆ 🎵 Please specify a song!
├◆ 💡 Example: \`.play faded\`
└ ❏`
            });
        }

        // Send initial processing message
        await sock.sendMessage(chatId, {
            text: `🔍 *Searching for:* "${searchQuery}"`,
            react: { text: '🔎', key: message.key }
        });

        // Fetch from API
        const apiUrl = `https://apis.davidcyriltech.my.id/play?query=${encodeURIComponent(searchQuery)}`;
        const { data } = await axios.get(apiUrl, { timeout: 30000 });

        // Validate API response
        if (!data?.status || !data?.result) {
            return await sock.sendMessage(chatId, {
                text: `┌ ❏ *⌜ SEARCH FAILED ⌟* ❏
│
├◆ ❌ Song not found!
├◆ 🔍 Try different keywords
└ ❏`
            });
        }

        const songData = data.result;
        const downloadUrl = songData.download_url;
        const thumbnail = songData.thumbnail?.trim();

        // Format views count
        const formattedViews = songData.views 
            ? parseInt(songData.views).toLocaleString() 
            : 'N/A';

        // Create styled box message
        const boxMessage = `┌ ❏ *⌜ AUDIO FOUND ⌟* ❏
│
├◆ 🎵 Title: ${songData.title || 'Unknown'}
├◆ ⏱️ Duration: ${songData.duration || 'N/A'}
├◆ 👀 Views: ${formattedViews}
├◆ 📅 Published: ${songData.published || 'N/A'}
├◆ 🌐 Source: YouTube
├◆ 💎 GODSZEAL XMD • Premium Music
└ ❏`;

        // Send metadata with thumbnail
        await sock.sendMessage(chatId, {
            image: { url: thumbnail },
            caption: boxMessage
        });

        // Send download notification
        await sock.sendMessage(chatId, {
            text: `⏳ *Downloading audio...*
Estimated time: 10-30 seconds`,
            react: { text: '⏳', key: message.key }
        });

        // Send the audio
        await sock.sendMessage(chatId, {
            audio: { url: downloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${songData.title.replace(/[^\w\s]/gi, '') || 'audio'}.mp3`,
            ptt: false
        });

        // Send success box
        await sock.sendMessage(chatId, {
            text: `┌ ❏ *⌜ DOWNLOAD COMPLETE ⌟* ❏
│
├◆ ✅ Enjoy your music!
├◆ 🎵 Title: ${songData.title.substring(0, 15)}...
└ ❏`,
            react: { text: '🎧', key: message.key }
        });

    } catch (error) {
        console.error('Play Command Error:', error);
        
        // Create error box
        const errorBox = `┌ ❏ *⌜ DOWNLOAD ERROR ⌟* ❏
│
├◆ ❌ Failed to process your request
├◆ 🔁 Please try again later!
└ ❏`;

        await sock.sendMessage(chatId, {
            text: errorBox,
            react: { text: '❌', key: message.key }
        });
    }
}

module.exports = playCommand;