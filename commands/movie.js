// This plugin was created by God's Zeal Tech 
// Don't Edit Or share without given me credits 

const axios = require('axios');

// Temporary storage for search results and quality options
const searchCache = new Map();
const qualityCache = new Map();

// Command for searching and downloading movies
async function movieCommand(sock, chatId, message) {
    try {
        // Check if it's a reply to a search results message
        let isReplyToSearch = false;
        let replyNumber = null;
        
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            const quotedMessage = message.message.extendedTextMessage.contextInfo.quotedMessage;
            const quotedText = quotedMessage.conversation || 
                              quotedMessage.extendedTextMessage?.text || 
                              '';
            
            isReplyToSearch = quotedText.includes('MOVIE RESULTS');
            
            // Check if the current message is just a number
            const replyText = message.message?.conversation || 
                             message.message?.extendedTextMessage?.text || 
                             '';
            
            const num = parseInt(replyText);
            if (!isNaN(num) && num > 0) {
                replyNumber = num;
            }
        }
        
        // Extract query from message
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const command = text.split(' ')[0];
        let query = text.split(' ').slice(1).join(' ').trim();
        
        // Handle quality selection
        if (query.toLowerCase() === 'fhd' || query.toLowerCase() === 'hd' || query.toLowerCase() === 'sd') {
            return handleQualitySelection(sock, chatId, message, query.toLowerCase());
        }
        
        // Handle selection via reply (just a number reply to search results)
        if (isReplyToSearch && replyNumber !== null) {
            return handleMovieSelection(sock, chatId, message, replyNumber);
        }
        
        // If no query provided, show usage
        if (!query) {
            return await sendUsageMessage(sock, chatId, message);
        }
        
        // Check if it's a selection command (e.g., .movie 1)
        const selection = parseInt(query);
        if (!isNaN(selection) && selection > 0) {
            return handleMovieSelection(sock, chatId, message, selection);
        }
        
        // Send initial processing message
        await sock.sendMessage(chatId, {
            text: `🔍 *Searching for:* "${query}"`,
            react: { text: '🔎', key: message.key }
        });
        
        // Fetch from search API
        const apiUrl = `https://apis.davidcyriltech.my.id/movies/search?query=${encodeURIComponent(query)}`;
        const { data } = await axios.get(apiUrl, { timeout: 30000 });
        
        // Validate API response
        if (!data?.status || !data?.results || data.results.length === 0) {
            return await sock.sendMessage(chatId, {
                text: `┌ ❏ *⌜ SEARCH FAILED ⌟* ❏
│
├◆ ❌ No movies found!
├◆ 🔍 Try different keywords
└ ❏`
            });
        }
        
        // Store results for this chat
        searchCache.set(chatId, data.results);
        
        // Format the search results
        let resultsMessage = `┌ ❏ *⌜ MOVIE RESULTS ⌟* ❏
│
├◆ 🎬 Found ${data.results.length} results for "${query}"
│
│ *Select a movie by number:*
│`;
        
        // Add each result with numbering
        data.results.forEach((movie, index) => {
            resultsMessage += `├◆ ${index + 1}. ${movie.title.replace(/\|.*$/, '').trim()} (${movie.year})\n`;
        });
        
        resultsMessage += `│
├◆ 💡 Reply with the number to select
└ ❏`;
        
        // Send the search results
        await sock.sendMessage(chatId, {
            text: resultsMessage
        });
        
    } catch (error) {
        console.error('Movie Command Error:', error);
        
        // Create error box
        const errorBox = `┌ ❏ *⌜ MOVIE ERROR ⌟* ❏
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

// Helper function to handle movie selection
async function handleMovieSelection(sock, chatId, message, selection) {
    // Check if there are stored search results for this chat
    const results = searchCache.get(chatId);
    if (!results || selection > results.length) {
        return await sock.sendMessage(chatId, {
            text: `┌ ❏ *⌜ INVALID SELECTION ⌟* ❏
│
├◆ ❌ Invalid movie number!
├◆ 🔍 Please search again with \`.movie <title>\`
└ ❏`
        });
    }
    
    // Get the selected movie
    const movie = results[selection - 1];
    
    // Send processing message
    await sock.sendMessage(chatId, {
        text: `⏳ *Fetching details for:* ${movie.title}`,
        react: { text: '⏳', key: message.key }
    });
    
    // Fetch from download API
    const apiUrl = `https://apis.davidcyriltech.my.id/zoom/movie?url=${encodeURIComponent(movie.link.trim())}`;
    const { data } = await axios.get(apiUrl, { timeout: 30000 });
    
    // Validate API response
    if (!data?.status || !data?.result) {
        return await sock.sendMessage(chatId, {
            text: `┌ ❏ *⌜ DETAILS ERROR ⌟* ❏
│
├◆ ❌ Failed to get movie details!
├◆ 🔍 Try again later or select another movie
└ ❏`
        });
    }
    
    const movieData = data.result;
    
    // Parse size information from the movie details
    const sizeInfo = movieData.size || '';
    let fhdSize = 'Size not available';
    let hdSize = 'Size not available';
    let sdSize = 'Size not available';
    
    // Extract sizes based on the knowledge base structure
    if (sizeInfo.includes('FHD 1080p')) {
        const fhdMatch = sizeInfo.match(/FHD 1080p \| ([\d\.]+\s*(GB|MB))/);
        fhdSize = fhdMatch ? fhdMatch[1] : 'Size not available';
    }
    
    if (sizeInfo.includes('HD 720p')) {
        const hdMatch = sizeInfo.match(/HD 720p \| ([\d\.]+\s*(GB|MB))/);
        hdSize = hdMatch ? hdMatch[1] : 'Size not available';
    }
    
    if (sizeInfo.includes('SD 480p')) {
        const sdMatch = sizeInfo.match(/SD 480p \| ([\d\.]+\s*(GB|MB))/);
        sdSize = sdMatch ? sdMatch[1] : 'Size not available';
    }
    
    // Store movie data for quality selection
    qualityCache.set(chatId, {
        title: movieData.title,
        details: movieData,
        movieLink: movie.link.trim()
    });
    
    // Format the quality selection message with sizes
    const qualityMessage = `┌ ❏ *⌜ QUALITY SELECTION ⌟* ❏
│
├◆ 🎬 ${movieData.title}
├◆ 📅 Date: ${movieData.date}
├◆ 👀 Views: ${movieData.view}
│
├◆ *Available qualities:*
├◆ FHD - Full HD 1080p | ${fhdSize}
├◆ HD - HD 720p | ${hdSize}
├◆ SD - Standard Definition 480p | ${sdSize}
│
├◆ 💡 Reply with \`.movie fhd\`, \`.movie hd\`, or \`.movie sd\`
└ ❏`;
    
    // Send the quality selection options with movie poster
    await sock.sendMessage(chatId, {
        image: { url: movie.image.trim() },
        caption: qualityMessage,
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
}

// Helper function to handle quality selection
async function handleQualitySelection(sock, chatId, message, quality) {
    // Check if we have movie data for this chat
    const movieData = qualityCache.get(chatId);
    if (!movieData) {
        return await sock.sendMessage(chatId, {
            text: `┌ ❏ *⌜ SELECTION ERROR ⌟* ❏
│
├◆ ❌ No movie selected!
├◆ 🔍 Please search and select a movie first
└ ❏`
        });
    }
    
    // Send processing message
    await sock.sendMessage(chatId, {
        text: `⏳ *Preparing ${quality.toUpperCase()} download for:* ${movieData.title}`,
        react: { text: '⏳', key: message.key }
    });
    
    try {
        // The dl_link from the API is the direct download page
        let downloadLink = movieData.details.dl_link.trim();
        let fileSize = 'Size not available';
        
        // Extract the correct file size based on quality
        const sizeInfo = movieData.details.size || '';
        if (quality === 'fhd' && sizeInfo.includes('FHD 1080p')) {
            const sizeMatch = sizeInfo.match(/FHD 1080p \| ([\d\.]+\s*(GB|MB))/);
            fileSize = sizeMatch ? sizeMatch[1] : 'Size not available';
        } else if (quality === 'hd' && sizeInfo.includes('HD 720p')) {
            const sizeMatch = sizeInfo.match(/HD 720p \| ([\d\.]+\s*(GB|MB))/);
            fileSize = sizeMatch ? sizeMatch[1] : 'Size not available';
        } else if (quality === 'sd' && sizeInfo.includes('SD 480p')) {
            const sizeMatch = sizeInfo.match(/SD 480p \| ([\d\.]+\s*(GB|MB))/);
            fileSize = sizeMatch ? sizeMatch[1] : 'Size not available';
        }
        
        // Format the download message with direct link
        const downloadMessage = `┌ ❏ *⌜ DOWNLOAD READY ⌟* ❏
│
├◆ 🎬 ${movieData.title}
├◆ 📀 Quality: ${quality.toUpperCase()}
├◆ 📦 Size: ${fileSize}
├◆ 👀 Views: ${movieData.details.view}
│
├◆ ⬇️ *Direct Download Link:*
├◆ ${downloadLink}
│
├◆ 💡 *Note:* Click the link to download the file
├◆ ⚠️ *Warning:* This is a direct link to the file
└ ❏`;
        
        // Send the download message with newsletter context
        await sock.sendMessage(chatId, {
            text: downloadMessage,
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
        
    } catch (error) {
        console.error('Quality Selection Error:', error);
        
        // Create error box with direct link fallback
        const errorBox = `┌ ❏ *⌜ DOWNLOAD ERROR ⌟* ❏
│
├◆ ❌ Failed to get quality-specific download link
├◆ 🔗 Here's the main download page:
├◆ ${movieData.details.dl_link.trim()}
│
├◆ 💡 *Note:* Click the link to download
└ ❏`;
        
        await sock.sendMessage(chatId, {
            text: errorBox,
            react: { text: '⚠️', key: message.key }
        });
    }
}

// Helper function to send usage message with newsletter features
async function sendUsageMessage(sock, chatId, message) {
    const usageMessage = `┌ ❏ *⌜ MOVIE SEARCH ⌟* ❏
│
├◆ 🎬 Search for movies with \`.movie <title>\`
├◆ 💡 Example: \`.movie deadpool\`
└ ❏`;
    
    await sock.sendMessage(chatId, {
        text: usageMessage,
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
}

module.exports = movieCommand;
