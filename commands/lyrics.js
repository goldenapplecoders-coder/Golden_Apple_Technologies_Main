const fetch = require('node-fetch');

async function lyricsCommand(sock, chatId, songTitle) {
    if (!songTitle) {
        await sock.sendMessage(chatId, { 
            text: '🔍 *Lyrics Search*\n\nPlease enter the song name to get the lyrics!\n\n📌 *Usage:* `lyrics <song name>`',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363269950668068@newsletter',
                    newsletterName: '❦ ════ •⊰❂ AI TOOLS HUB  ❂⊱• ════ ❦',
                    serverMessageId: -1
                }
            }
        });
        return;
    }

    try {
        // Fetch song lyrics using the new API
        const apiUrl = `https://api.giftedtech.web.id/api/search/lyrics?apikey=gifted&query=${encodeURIComponent(songTitle)}`;
        const res = await fetch(apiUrl);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        
        // Check if the API request was successful and has lyrics
        if (!json.success || json.status !== 200 || !json.result || !json.result.lyrics) {
            await sock.sendMessage(chatId, { 
                text: `❌ *Lyrics Not Found*\n\nWe couldn't find lyrics for "${songTitle}".\n\n🔍 *Tip:* Try searching with both song title and artist name.`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363269950668068@newsletter',
                        newsletterName: '❦ ════ •⊰❂ AI TOOLS HUB  ❂⊱• ════ ❦',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }
        
        const { title, artist, image, link, lyrics } = json.result;
        
        // Create a beautiful formatted preview
        const previewLyrics = lyrics.split('\n')
            .filter(line => !line.startsWith('[')) // Remove section headers for preview
            .filter(line => line.trim() !== '')
            .slice(0, 3)
            .map(line => `│ ${line}`)
            .join('\n');
        
        // Format the caption with elegant design
        const caption = `┌───────────────────────┐
│      🎵 *${title.toUpperCase()}*      │
└───────────────────────┘

*🎤 Artist:* ${artist}
*💿 Album:* Not specified

┌───────────────────────┐
│      📜 LYRICS PREVIEW      │
└───────────────────────┘
${previewLyrics}
│...

┌───────────────────────────┐
│ *AI TOOLS HUB* • Your Music Companion
└───────────────────────────┘`;

        // Define channel info for consistent newsletter appearance
        const channelInfo = {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363269950668068@newsletter',
                newsletterName: '❦ ════ •⊰❂ AI TOOLS HUB  ❂⊱• ════ ❦',
                serverMessageId: -1
            }
        };
        
        // Send the image with caption and URL button
        await sock.sendMessage(chatId, {
            image: { url: image.trim() },
            caption: caption,
            footer: "Tap below to view full lyrics on Genius",
            buttons: [
                {
                    buttonId: 'lyrics_link',
                    buttonText: { displayText: '🌐 VIEW FULL LYRICS' },
                    type: 4,
                    url: link.trim()
                },
                {
                    buttonId: 'search_another',
                    buttonText: { displayText: '🔍 SEARCH ANOTHER' },
                    type: 1
                }
            ],
            headerType: 4,
            contextInfo: channelInfo
        });
        
        // Send the full lyrics in a beautifully formatted message
        const formattedLyrics = lyrics
            .replace(/\[Verse \d+\]/g, '┌───────────────┐\n│     🎤 VERSE     │\n└───────────────┘')
            .replace(/\[Chorus\]/g, '┌───────────────┐\n│    🎶 CHORUS    │\n└───────────────┘')
            .replace(/\[Bridge\]/g, '┌───────────────┐\n│     🎼 BRIDGE    │\n└───────────────┘')
            .replace(/\[Outro\]/g, '┌───────────────┐\n│     🎤 OUTRO     │\n└───────────────┘')
            .replace(/\[Pre-Chorus\]/g, '┌───────────────┐\n│  🎵 PRE-CHORUS  │\n└───────────────┘');
        
        await sock.sendMessage(chatId, {
            text: `┌───────────────────────────┐
│      🎵 *${title}*      │
├───────────────────────────┤
│ *Artist:* ${artist}
│ *Source:* Genius
├───────────────────────────┤
${formattedLyrics}
├───────────────────────────┤
│ *AI TOOLS HUB* • Sharing the music magic 🎧
└───────────────────────────┘`,
            contextInfo: channelInfo
        });
    } catch (error) {
        console.error('Error in lyrics command:', error);
        await sock.sendMessage(chatId, { 
            text: `❌ *System Error*\n\nAn unexpected error occurred while processing your request.\n\n🔧 *Error Code:* LYR-500\n\n📌 *Tip:* Try again later or contact support.`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363269950668068@newsletter',
                    newsletterName: '❦ ════ •⊰❂ AI TOOLS HUB  ❂⊱• ════ ❦',
                    serverMessageId: -1
                }
            }
        });
    }
}

module.exports = { lyricsCommand };
