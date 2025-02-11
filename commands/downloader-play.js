const {
    bold,
    monospace
} = require("@mengkodingan/ckptw");
const {
    youtubedl,
    youtubedlv2
} = require("@bochilteam/scraper");
const yts = require("yt-search");
const mime = require("mime-types");

module.exports = {
    name: "play",
    category: "downloader",
    code: async (ctx) => {
        const handlerObj = await global.handler(ctx, {
            banned: true,
            coin: 3
        });

        if (handlerObj.status) return ctx.reply(handlerObj.message);

        const input = ctx._args.length ? ctx._args.join(" ") : null;

        if (!input) return ctx.reply(
            `${global.msg.argument}\n` +
            `Ejemplo: ${monospace(`${ctx._used.prefix + ctx._used.command} hikaru utada - one last kiss`)}`
        );

        try {
            const searchRes = await yts(input);

            if (!searchRes) return ctx.reply(global.msg.notFound);

            const ytVid = searchRes.videos[0];

            await ctx.reply(
                `❖ ${bold("Reproducir")}\n` +
                "\n" +
                `➲ Título: ${ytVid.title}\n` +
                `➲ Artista: ${ytVid.author.name}\n` +
                `➲ Duración: ${ytVid.timestamp}\n` +
                `➲ URL: ${ytVid.url}\n` +
                "\n" +
                global.msg.footer
            );

            let ytdlRes;
            try {
                ytdlRes = await youtubedl(ytVid.url);
            } catch (error) {
                ytdlRes = await youtubedlv2(ytVid.url);
            }

            const audInfo = Object.values(ytdlRes.audio)[0];
            const audUrl = await audInfo.download();

            if (!audUrl) return ctx.reply(global.msg.notFound);

            return await ctx.reply({
                audio: {
                    url: audUrl,
                },
                mimetype: mime.contentType("mp3"),
                ptt: false
            });
        } catch (error) {
            console.error("Error:", error);
            return ctx.reply(`${bold("[ ! ]")} Se produjo un error: ${error.message}`);
        }
    }
};
