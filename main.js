// Módulos y dependencias requeridos
const {
    handler
} = require("./handler.js");
const smpl = require("./tools/simple.js");
const {
    bold,
    Client,
    CommandHandler
} = require("@mengkodingan/ckptw");
const {
    Events,
    MessageType
} = require("@mengkodingan/ckptw/lib/Constant");
const {
    exec
} = require("child_process");
const path = require("path");
const SimplDB = require("simpl.db");
const {
    inspect
} = require("util");

// Mensaje de conexión.
console.log("Conectando...");

// Crear una nueva instancia del bot.
const bot = new Client({
    prefix: global.bot.prefix,
    readIncommingMsg: true,
    printQRInTerminal: !global.system.usePairingCode,
    phoneNumber: global.bot.phoneNumber,
    usePairingCode: global.system.usePairingCode,
    selfReply: true
});

// Crear una nueva instancia de la base de datos.
const db = new SimplDB();
global.db = db;

// Manejo de eventos cuando el bot está listo.
bot.ev.once(Events.ClientReady, async (m) => {
    console.log(`Listo en ${m.user.id}`);
    global.system.startTime = Date.now();
});

// Crear manejadores de comandos y cargar comandos.
const cmd = new CommandHandler(bot, path.resolve(__dirname, "commands"));
cmd.load();

// Asignar manejador global.
global.handler = handler;

// Manejo de eventos cuando aparece un mensaje.
bot.ev.on(Events.MessagesUpsert, async (m, ctx) => {
    const senderNumber = ctx._sender.jid.split("@")[0];
    const senderJid = ctx._sender.jid;
    const groupNumber = ctx.isGroup() ? m.key.remoteJid.split("@")[0] : null;
    const groupJid = ctx.isGroup() ? m.key.remoteJid : null;
    const isGroup = ctx.isGroup();
    const isPrivate = !isGroup;

    // Ignorar mensajes enviados por el propio bot.
    if (m.key.fromMe) return;

    // Simulación de escritura automática para comandos.
    if (smpl.isCmd(m, ctx)) ctx.simulateTyping();

    // Manejo de AFK: Usuarios mencionados.
    const mentionJids = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (mentionJids && mentionJids.length > 0) {
        for (const mentionJid of mentionJids) {
            const getAFKMention = db.get(`user.${mentionJid.split("@")[0]}.afk`);
            if (getAFKMention) {
                const [reason, timeStamp] = await Promise.all([
                    db.get(`user.${mentionJid.split("@")[0]}.afk.reason`),
                    db.get(`user.${mentionJid.split("@")[0]}.afk.timeStamp`)
                ]);
                const timeAgo = smpl.convertMsToDuration(Date.now() - timeStamp);

                return ctx.reply(`Está AFK con la razón ${reason} durante ${timeAgo || "menos de un segundo."}.`);
            }
        }
    }

    // Manejo de AFK: Regreso de AFK.
    const getAFKMessage = await db.get(`user.${senderNumber}.afk`);
    if (getAFKMessage) {
        const [reason, timeStamp] = await Promise.all([
            db.get(`user.${senderNumber}.afk.reason`),
            db.get(`user.${senderNumber}.afk.timeStamp`)
        ]);
        const timeAgo = smpl.convertMsToDuration(Date.now() - timeStamp);
        await db.delete(`user.${senderNumber}.afk`);

        return ctx.reply(`Has terminado el AFK con la razón ${reason} durante ${timeAgo || "menos de un segundo."}.`);
    }

    // Comandos solo para el propietario.
    if (smpl.isOwner(ctx, senderNumber) === 1) {
        // Comando Eval: Ejecutar código JavaScript.
        if (m.content && m.content.startsWith && (m.content.startsWith("> ") || m.content.startsWith(">> "))) {
            const code = m.content.slice(2);

            try {
                const result = await eval(m.content.startsWith(">> ") ? `(async () => { ${code} })()` : code);

                return await ctx.reply(inspect(result));
            } catch (error) {
                console.error("Error:", error);
                return ctx.reply(`${bold("[ ! ]")} Se produjo un error: ${error.message}`);
            }
        }

        // Comando Exec: Ejecutar comandos de shell.
        if (m.content && m.content.startsWith && m.content.startsWith("$ ")) {
            const command = m.content.slice(2);

            try {
                const output = await execPromise(command);

                return await ctx.reply(output);
            } catch (error) {
                console.error("Error:", error);
                return ctx.reply(`${bold("[ ! ]")} Se produjo un error: ${error.message}`);
            }
        }
    }

    // Acciones específicas del grupo.
    if (isGroup) {
        // Manejo de antilink.
        const getAntilink = await db.get(`group.${groupNumber}.antilink`);
        const urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)\b/i;
        if (getAntilink && m.content && urlRegex.test(m.content)) {
            if ((await smpl.isAdmin(ctx)) === 1) return;

            await ctx.reply(`${bold("[ ! ]")} ¡No envíes enlaces!`);
            return await ctx.deleteMessage(m.key);
        }

        // Manejo de antispam.
        const getAntispam = await db.get(`group.${groupNumber}.antispam`);
        if (getAntispam) {
            if (await smpl.isAdmin(ctx)) return;

            const now = Date.now();
            let spam = await db.get(`group.${groupNumber}.spam`);

            if (!spam) {
                spam = {
                    user: senderNumber,
                    count: 0,
                    lastMessageTime: 0
                };
            }

            if (spam.user === senderNumber && now - spam.lastMessageTime < 3000) {
                spam.count++;
            } else {
                spam.user = senderNumber;
                spam.count = 1;
            }
            spam.lastMessageTime = now;

            if (spam.count < 4) {
                await db.set(`group.${groupNumber}.spam`, spam);
                return;
            } else if (spam.count <= 5) {
                await ctx.reply(`${bold("[ ! ]")} ¡No hagas spam! (Advertencia ${spam.count}/5)`);
            } else {
                await ctx.reply(`${bold("[ ! ]")} ¡Has sido expulsado por hacer spam!`);
                await ctx.group().kick([senderJid]);
            }

            await db.set(`group.${groupNumber}.spam`, spam);
        }
    }

    // Mensajes privados.
    if (isPrivate) {
        // Manejo de Menfess.
        const getMessageDataMenfess = await db.get(`menfess.${senderNumber}`);
        if (getMessageDataMenfess) {
            if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation === m.content) {
                const from = await db.get(`menfess.${senderNumber}.from`);
                try {
                    await sendMenfess(ctx, m, senderNumber, from);

                    return ctx.reply("¡Mensaje enviado con éxito!");
                } catch (error) {
                    console.error("Error:", error);
                    return ctx.reply(`${bold("[ ! ]")} Se produjo un error: ${error.message}`);
                }
            }
        }
    }
});

// Manejo de eventos cuando un usuario se une o deja un grupo
bot.ev.on(Events.UserJoin, (m) => {
    m.eventsType = "UserJoin";
    handleUserEvent(m);
});

bot.ev.on(Events.UserLeave, (m) => {
    m.eventsType = "UserLeave";
    handleUserEvent(m);
});

// Lanzar el bot.
bot.launch().catch((error) => console.error("Error:", error));

// Funciones de utilidad
async function execPromise(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(error.message));
            } else if (stderr) {
                reject(new Error(stderr));
            } else {
                resolve(stdout);
            }
        });
    });
}

async function sendMenfess(ctx, m, senderNumber, from) {
    await ctx.sendMessage(`${from}@s.whatsapp.net`, {
        text: `❖ ${bold("Menfess")}\n` +
            `Hola, soy ${global.bot.name}, Él (${senderNumber}) respondió al mensaje menfess que enviaste.\n` +
            "-----\n" +
            `${content}\n` +
            "-----\n" +
            "Si quieres responder, debes enviar el comando de nuevo.\n"
    }, {
        quoted: m.key
    });
}

async function handleUserEvent(m) {
    const {
        id,
        participants
    } = m;

    try {
        const getWelcome = await db.get(`group.${id.split("@")[0]}.welcome`);
        if (getWelcome) {
            const metadata = await bot.core.groupMetadata(id);

            for (const jid of participants) {
                let profile;
                try {
                    profile = await bot.core.profilePictureUrl(jid, "image");
                } catch {
                    profile = "https://qu.ax/gQpQ.webp";
                }

                const message = m.eventsType === "UserJoin" ? `Bienvenido @${jid.split("@")[0]} al grupo ${metadata.subject}!` : `@${jid.split("@")[0]} salió del grupo ${metadata.subject}.`;

                await bot.core.sendMessage(id, {
                    text: message,
                    contextInfo: {
                        mentionedJid: [jid],
                        externalAdReply: {
                            mediaType: 1,
                            previewType: 0,
                            mediaUrl: global.bot.groupChat,
                            title: m.eventsType === "UserJoin" ? "UNIRSE" : "SALIR",
                            body: null,
                            renderLargerThumbnail: true,
                            thumbnailUrl: profile,
                            sourceUrl: global.bot.groupChat
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error("Error:", error);
        return bot.core.sendMessage(id, {
            text: `${bold("[ ! ]")} Se produjo un error: ${error.message}`
        });
    }
        }
