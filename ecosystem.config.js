module.exports = {
    apps: [{
        name: "escanorbot",
        script: "./index.js",
        watch: true,
        ignore_watch: ["database.json", "node_modules", "state"],
        cron_restart: "*/30 * * * *"
    }]
};
