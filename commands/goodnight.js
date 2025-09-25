const fetch = require('node-fetch');

async function goodnightCommand(sock, chatId, message) {
    try {
        // New API endpoint (no API key needed)
        const res = await fetch('https://apis.davidcyriltech.my.id/random/quotes');
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        
        // Verify API success status
        if (!json.success) {
            throw new Error('API returned unsuccessful status');
        }
        
        // Extract and format quote with author
        const quote = json.response?.quote;
        const author = json.response?.author;
        
        if (!quote) {
            throw new Error('Quote not found in response');
        }
        
        // Format: "quote - author" (maintains existing string format)
        const goodnightMessage = author 
            ? `${quote} - ${author}` 
            : quote;

        // Send the formatted message
        await sock.sendMessage(chatId, { text: goodnightMessage }, { quoted: message });
    } catch (error) {
        console.error('Error in goodnight command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get goodnight message. Please try again later!' }, { quoted: message });
    }
}

module.exports = { goodnightCommand };
