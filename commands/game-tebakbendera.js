const {
    tebakbendera
} = require("@bochilteam/scraper");
const {
    bold
} = require("@mengkodingan/ckptw");

const session = new Map();

module.exports = {
    name: "tebakbendera",
    aliases: ["guessflag", "whatflag"],
    category: "game",
    code: async (ctx) => {
        if (await session.has(ctx.id)) return ctx.reply("Sesi permainan sedang berjalan!");

        const data = await tebakbendera();
        const coin = 3;
        const timeout = 120000;
        const senderNumber = ctx._sender.jid.split("@")[0];

        await session.set(ctx.id, true);

        await ctx.reply({
            image: {
                url: data.img,
            },
            caption: `❖ ${bold("Tebak Bendera")}\n` +
                "\n" +
                (global.system.useCoin ? `\n➲ Bonus: ${coin} Koin\n` : "\n") +
                `Batas waktu ${(timeout / 1000).toFixed(2)} detik.\n` +
                'Ketik "hint" untuk bantuan.\n' +
                "\n" +
                global.msg.footer
        });


        const col = ctx.MessageCollector({
            time: timeout
        });

        col.on("collect", async (m) => {
            if (m.content.toLowerCase() === data.name.toLowerCase()) {
                await session.delete(ctx.id);
                if (global.system.useCoin) await global.db.add(`user.${senderNumber}.coin`, coin);
                await ctx.reply(
                    `${bold("[ ! ]")} Benar!` +
                    (global.system.useCoin ? `\n+${coin} Koin` : "")
                );
                return col.stop();
            } else if (m.content.toLowerCase() === "hint") {
                const clue = data.name.replace(/[AIUEOaiueo]/g, "_");
                await ctx.reply(clue);
            } else if (m.content.toLowerCase().endsWith(data.name.split(" ")[1])) {
                await ctx.reply("Sedikit lagi!");
            }
        });

        col.on("end", async (collector, r) => {
            if (await session.has(ctx.id)) {
                await session.delete(ctx.id);

                return ctx.reply(
                    `Waktu habis!\n` +
                    `Jawabannya adalah ${data.name}.`
                );
            }
        });
    }
};