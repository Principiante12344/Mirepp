const {
    createAPIUrl
} = require("../tools/api.js");
const {
    bold,
    monospace
} = require("@mengkodingan/ckptw");
const axios = require("axios");

module.exports = {
    name: "githubsearch",
    aliases: ["ghs"],
    category: "internet",
    code: async (ctx) => {
        const handlerObj = await global.handler(ctx, {
            banned: true,
            coin: 3
        });

        if (handlerObj.status) return ctx.reply(handlerObj.message);

        const input = ctx._args.length ? ctx._args.join(" ") : null;

        if (!input) return ctx.reply(
            `${global.msg.argument}\n` +
            `Contoh: ${monospace(`${ctx._used.prefix + ctx._used.command} ckptw-wabot`)}`
        );

        try {
            const apiUrl = await createAPIUrl("https://api.github.com", "/search/repositories", {
                q: input
            });
            const response = await axios.get(apiUrl);

            const data = await response.data;
            const repo = data.items[0];

            return ctx.reply(
                `❖ ${bold("GitHub Search")}\n` +
                "\n" +
                `➲ Nama: ${repo.name}\n` +
                `➲ Deskripsi: ${repo.description}\n` +
                `➲ Owner: ${repo.owner.login}\n` +
                `➲ Dibuat: ${formatDate(repo.created_at)}\n` +
                `➲ Bahasa: ${repo.language}\n` +
                `➲ Lisensi: ${repo.license.name}\n` +
                "\n" +
                global.msg.footer
            );
        } catch (error) {
            console.error("Error:", error);
            if (error.status !== 200) return ctx.reply(global.msg.notFound);
            return ctx.reply(`${bold("[ ! ]")} Terjadi kesalahan: ${error.message}`);
        }
    }
};

function formatDate(date, locale = "id") {
    const dt = new Date(date);
    return dt.toLocaleDateString(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
    });
}