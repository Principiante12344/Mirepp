const {
    createAPIUrl
} = require('../lib/api.js');
const {
    bold
} = require('@mengkodingan/ckptw');

module.exports = {
    name: 'chatgpt',
    aliases: ['ai', 'chatai', 'gpt', 'gpt4'],
    category: 'ai',
    code: async (ctx) => {
        const input = ctx._args.join(' ');

        if (!input) return ctx.reply(`${bold('[ ! ]')} Masukkan teks biasa!`);

        try {
            const apiUrl = createAPIUrl('ai_tools', '/gpt', {
                prompt: input,
                uid: ctx._sender.jid.replace('@s.whatsapp.net', '')
            });
            const response = await fetch(apiUrl);
            const data = await response.json();

            return ctx.reply(data.gpt4);
        } catch (error) {
            console.error('Error:', error);
            return ctx.reply(`${bold('[ ! ]')} Terjadi kesalahan: ${error.message}`);
        }
    }
};