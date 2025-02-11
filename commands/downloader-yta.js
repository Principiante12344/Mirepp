const {
    bold,
    monospace
} = require("@mengkodingan/ckptw");
const {
    youtubedl,
    youtubedlv2
} = require("@bochilteam/scraper");
const mime = require("mime-types");

module.exports = {
    name: "yta",
    aliases: ["ytaudio", "ytmp3"],
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
            `Contoh: ${monospace(`${ctx._used.prefix + ctx._used.command} https://example.com/`)}`
        );

        const urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)\b/i;
        if (!urlRegex.test(input)) ctx.reply(global.msg.urlInvalid);

        try {
            let ytdl;
            try {
                ytdl = await youtubedl(input);
            } catch (error) {
                ytdl = await youtubedlv2(input);
            }
            const qualityOptions = Object.keys(ytdl.audio);

            await ctx.reply(
                `❖ ${bold("YT Audio")}\n` +
                "\n" +
                `➲ Judul: ${ytdl.title}\n` +
                `➲ URL: ${input}\n` +
                `➲ Pilih kualitas:\n` +
                `${qualityOptions.map((quality, index) => `${index + 1}. ${quality}`).join("\n")}\n` +
                "\n" +
                global.msg.footer
            );

            const col = ctx.MessageCollector({
                time: 60000, // 1 minute.
            });

            col.on("collect", async (m) => {
                const selectedNumber = parseInt(m.content.trim());
                const selectedQualityIndex = selectedNumber - 1;

                if (!isNaN(selectedNumber) && selectedQualityIndex >= 0 && selectedQualityIndex < qualityOptions.length) {
                    const selectedQuality = qualityOptions[selectedQualityIndex];
                    const downloadFunction = ytdl.audio[selectedQuality].download;
                    ctx.react(ctx.id, "🔄", m.key);
                    const url = await downloadFunction();
                    await ctx.reply({
                        audio: {
                            url: url,
                        },
                        mimetype: mime.contentType("mp3"),
                        ptt: false,
                    });
                    return col.stop();
                }
            });

            col.on("end", async (collector, r) => {
                // No response when collector ends.
            });
        } catch (error) {
            console.error("Error:", error);
            if (error.status !== 200) return ctx.reply(global.msg.notFound);
            return ctx.reply(`${bold("[ ! ]")} Terjadi kesalahan: ${error.message}`);
        }
    }
};