const {
    convertMsToDuration
} = require("./simple.js");
const package = require("../package.json");
const {
    bold,
    quote
} = require("@mengkodingan/ckptw");
const moment = require("moment-timezone");

/**
 * Genera un menú de comandos disponibles basado en el mapa de comandos y el contexto proporcionados.
 * @param {Object} ctx El objeto de contexto que contiene información sobre el contexto actual.
 * @returns {string} El texto del menú generado.
 */
exports.getMenu = (ctx) => {
    const commandsMap = ctx._self.cmd;
    const tags = {
        "main": "Principal",
        "ai": "IA",
        "game": "Juego",
        "converter": "Convertidor",
        "downloader": "Descargador",
        "fun": "Diversión",
        "group": "Grupo",
        "islamic": "Islámico",
        "internet": "Internet",
        "maker": "Creador",
        "tools": "Herramientas",
        "owner": "Propietario",
        "info": "Información",
        "": "Sin Categoría"
    };

    if (!commandsMap || commandsMap.size === 0) return `${bold("[ ! ]")} Se produjo un error: No se encontraron comandos.`;

    const sortedCategories = Object.keys(tags);

    const readmore = "\u200E".repeat(4001);

    let text =
        `Hola ${ctx._sender.pushName || "Amigo"}, ¡aquí tienes la lista de comandos disponibles!\n` +
        "\n" +
        `╭ ➲ Tiempo activo: ${convertMsToDuration(Date.now() - global.system.startTime) || "menos de un segundo."}\n` +
        `│ ➲ Fecha: ${moment.tz(global.system.timeZone).format("DD/MM/YY")}\n` +
        `│ ➲ Hora: ${moment.tz(global.system.timeZone).format("HH:mm:ss")}\n` +
        `│ ➲ Versión: ${package.version}\n` +
        `╰ ➲ Prefijo: ${ctx._used.prefix}\n` +
        "\n" +
        `${quote("¡No olvides donar para que el bot siga en línea!")}\n` +
        `${global.msg.readmore}\n`;

    for (const category of sortedCategories) {
        const categoryCommands = Array.from(commandsMap.values())
            .filter((command) => command.category === category)
            .map((command) => ({
                name: command.name,
                aliases: command.aliases
            }));

        if (categoryCommands.length > 0) {
            text += `╭─「 ${bold(tags[category])} 」\n`;

            if (category === "main") {
                text += `│ ➲ ${categoryCommands.map((cmd) => `${ctx._used.prefix || "/"}${cmd.name}${cmd.aliases ? `\n│ ➲ ${cmd.aliases.map((alias) => `${ctx._used.prefix || "/"}${alias}`).join("\n│ ➲ ")}` : ""}`).join("\n│ ➲ ")}\n`;
            } else {
                text += `│ ➲ ${categoryCommands.map((cmd) => `${ctx._used.prefix || "/"}${cmd.name}`).join("\n│ ➲ ")}\n`;
            }

            text +=
                "╰────\n" +
                "\n";
        }
    }

    text += global.msg.footer;

    return text;
};
