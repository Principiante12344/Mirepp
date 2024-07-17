const package = require("./package.json");
const {
    bold,
    quote
} = require("@mengkodingan/ckptw");

// Bot.
global.bot = {
    name: "𝙀𝙨𝙘𝙖𝙣𝙤𝙧 𝙗𝙤𝙩",
    prefix: /^[°•π÷×¶∆£¢€¥®™+✓_=|/~!?@#%^&.©^]/i,
    phoneNumber: "", // Ignorar si usas código QR para autenticación.
    thumbnail: "https://qu.ax/gQpQ.webp",
    groupChat: "https://whatsapp.com/channel/0029VakC2At0bIdob9gHGp1d" // ¡No olvides unirte, amigos!
};

// MSG (Mensaje).
global.msg = {
    // Acceso a comandos.
    admin: `¡Comando solo accesible por administradores del grupo!`,
    banned: `¡No se puede procesar porque estás baneado!`,
    botAdmin: `El bot no es administrador, ¡no puede usar comandos!`,
    coin: `¡No tienes suficientes monedas!`,
    group: `¡Comando solo accesible en grupos!`,
    owner: `¡Comando solo accesible por el propietario!`,
    premium: `¡No eres un usuario Premium!`,
    private: `¡Comando solo accesible en chat privado!`,

    // Interfaz de comando.
    watermark: `${package.name}@^${package.version}`,
    footer: quote("Creado por mistik."),
    readmore: "\u200E".repeat(4001),

    // Proceso de comando.
    argument: `¡Introduce argumentos!`,
    wait: `Espera un momento...`,

    // Proceso de comando (Error).
    notFound: `¡No se encontró nada!`,
    urlInvalid: `¡URL no válida!`
};

// Propietario y Copropietario.
global.owner = {
    name: "mistik",
    number: "525628360643",
    organization: "mistik.io",
    co: ["525628360643"]
};

// Sticker.
global.sticker = {
    packname: "Este sticker fue hecho por",
    author: "𝙀𝙨𝙘𝙖𝙣𝙤𝙧 𝙗𝙤𝙩"
};

// Sistema.
global.system = {
    startTime: null,
    timeZone: "Asia/Jakarta",
    useCoin: false,
    usePairingCode: true
};
