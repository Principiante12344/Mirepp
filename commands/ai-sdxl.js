const {
    createAPIUrl
} = require('../lib/api.js');
const {
    bold,
    monospace
} = require('@mengkodingan/ckptw');

module.exports = {
    name: 'sdxl',
    aliases: ['aisdxl', 'imgsdxl'],
    category: 'ai',
    code: async (ctx) => {
        const input = ctx._args;
        const iStyles = input.shift();
        const prompt = input.join(' ');

        const styleList = [...Array(9).keys()].map((index) => `${index + 1}. ${getStyleText(index + 1)}`).join('\n');

        if (!input) return ctx.reply(
            `${bold('[ ! ]')} Masukkan parameter!\n` +
            `Contoh: ${monospace(`${ctx._used.prefix + ctx._used.command} 7 cat`)}\n` +
            `Daftar gaya:\n` +
            `${styleList}`
        );

        try {
            const styles = parseInt(iStyles.trim());

            if (isNaN(styles) || styles < 1 || styles > 9) return ctx.reply(
                `${bold('[ ! ]')} Masukkan gaya yang tersedia.\n` +
                `Daftar gaya:\n` +
                `${styleList}`
            );

            const apiUrl = createAPIUrl('ai_tools', '/sdxl', {
                prompt: prompt.trim(),
                styles: styles
            });

            await ctx.reply({
                image: {
                    url: apiUrl
                },
                caption: `• Prompt: ${prompt.trim()}\n` +
                    `• Gaya: ${getStyleText(styles)}`
            });
        } catch (error) {
            console.error('Error:', error);
            return ctx.reply(`${bold('[ ! ]')} Terjadi kesalahan: ${error.message}`);
        }
    }
};

function getStyleText(styleNumber) {
    const styleTexts = [
        'Cinematic',
        'Photographic',
        'Anime',
        'Manga',
        'Digital Art',
        'Pixel Art',
        'Fantasy Art',
        'Neonpunk',
        '3D Model'
    ];

    return styleTexts[styleNumber - 1] || '';
};