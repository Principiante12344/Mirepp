const {
    bold,
    monospace
} = require("@mengkodingan/ckptw");

module.exports = {
    name: "join",
    category: "owner",
    code: async (ctx) => {
        const handlerObj = await global.handler(ctx, {
            owner: true
        });

        if (handlerObj.status) return ctx.reply(handlerObj.message);

        const input = ctx._args.length ? ctx._args.join(" ") : null;

        if (!input) return ctx.reply(
            `${global.msg.argument}\n` +
            `Contoh: ${monospace(`${ctx._used.prefix + ctx._used.command} ${global.bot.groupChat}`)}`
        );

        const urlRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
        const match = input.match(urlRegex);
        if (!match) return ctx.reply(global.msg.urlInvalid);

        try {
            const urlCode = match[1];
            const res = await ctx.groups.acceptInvite(urlCode);
            const members = await ctx.group().members();
            const participantsIds = members.map(user => user.id);

            await ctx.sendMessage(res, {
                text: `Halo! Saya adalah Bot WhatsApp bernama ${global.bot.name}, dimiliki oleh ${global.owner.name}. Saya bisa melakukan banyak perintah, seperti membuat stiker, menggunakan AI untuk pekerjaan tertentu, dan beberapa perintah berguna lainnya. Saya di sini untuk menghibur dan menyenangkan Anda!`
            }, {
                mentions: participantsIds
            });

            return await ctx.reply(`${bold("[ ! ]")} Berhasil bergabung dengan grup!`);
        } catch (error) {
            console.error("Error:", error);
            return ctx.reply(`${bold("[ ! ]")} Terjadi kesalahan: ${error.message}`);
        }
    }
};