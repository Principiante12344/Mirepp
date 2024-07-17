require("./config.js");
const package = require("./package.json");
const CFonts = require("cfonts");

console.log("Iniciando...");

// Mostrar título usando CFonts.
CFonts.say(package.name, {
    font: "chrome",
    align: "center",
    gradient: ["red", "magenta"],
});

// Muestra información del paquete.
const authorName = package.author.name || package.author;
CFonts.say(
    `'${package.description}'\n` +
    `Por ${authorName}`, {
        font: "console",
        align: "center",
        gradient: ["red", "magenta"],
    });

// Importar y ejecutar el módulo principal.
require("./main.js");
