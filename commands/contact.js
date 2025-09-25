// This plugin was created by God's Zeal Tech 
// Don't Edit Or share without given me credits 

async function contactCommand(sock, chatId, message) {
    try {
        // Check if we're in a group
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            return await sock.sendMessage(chatId, {
                text: `┌ ❏ *⌜ CONTACT EXPORT ⌟* ❏
│
├◆ ❌ This command only works in groups!
└ ❏`
            });
        }
        
        // Get group metadata
        const groupMetadata = await sock.groupMetadata(chatId);
        
        // Get all participants
        const participants = groupMetadata.participants;
        const adminCount = participants.filter(p => p.admin).length;
        
        // Generate VCF content with proper contact information
        let vcard = '';
        let noPort = 0;
        
        for (let a of participants) {
            // Extract phone number from ID
            
            vcard += `BEGIN:VCARD\n`;
            vcard += `VERSION:3.0\n`;
            vcard += `FN:[${noPort++}] +${a.id.split("@")[0]}\n`;
            vcard += `TEL;type=CELL;type=VOICE;waid=${a.id.split("@")[0]}:+${a.id.split("@")[0]}\n`;
            vcard += `END:VCARD\n`;
        }

        // Format group creation date
        const creationDate = new Date(groupMetadata.creation * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Send group details
        const detailsMessage = `┌ ❏ *⌜ GROUP DETAILS ⌟* ❏
│
├◆ 🏷️ Name: ${groupMetadata.subject}
├◆ 👥 Total Members: ${participants.length}
├◆ 👑 Admins: ${adminCount}
├◆ 🔑 Group JID: ${chatId}
├◆ 📅 Created: ${creationDate}
├◆ 🌐 Channel JID: 120363269950668068@newsletter
│
├◆ 💡 *Group contacts exported to VCF file*
├◆ 📎 Format: vCard (Compatible with all devices)
└ ❏`;
        
        await sock.sendMessage(chatId, {
            text: detailsMessage,
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
        
        // Create a buffer from the VCF content
        const vcfBuffer = Buffer.from(vcard.trim());
        
        // Send VCF file with detailed caption
        const caption = `📎 *Group Contacts Export*\n` +
                       `• Total members: ${participants.length}\n` +
                       `• Format: vCard 3.0\n` +
                       `• Group: ${groupMetadata.subject}\n` +
                       `• Created: ${creationDate}\n` +
                       `• Members: ${participants.length} (${adminCount} admins)\n` +
                       `• Compatible with: All devices & contact managers\n\n` +
                       `💡 *How to use:*\n` +
                       `1. Save the VCF file\n` +
                       `2. Open Contacts app on your device\n` +
                       `3. Import contacts from the saved file\n` +
                       `4. All WhatsApp group members will be added to your contacts\n\n` +
                       `⚠️ *Note:* Only phone numbers are exported (no WhatsApp-specific IDs)`;
        
        await sock.sendMessage(chatId, {
            document: vcfBuffer,
            mimetype: 'text/vcard',
            fileName: `${groupMetadata.subject.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_contacts.vcf`,
            caption: caption,
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
        console.error('Contact Export Error:', error);
        
        const errorBox = `┌ ❏ *⌜ EXPORT ERROR ⌟* ❏
│
├◆ ❌ Failed to export group contacts
├◆ 🔍 Error: ${error.message.substring(0, 50)}...
└ ❏`;
        
        await sock.sendMessage(chatId, {
            text: errorBox,
            react: { text: '❌', key: message.key }
        });
    }
}

module.exports = contactCommand;
