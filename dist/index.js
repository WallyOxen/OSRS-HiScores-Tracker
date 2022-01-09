var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import dotenv from "dotenv";
dotenv.config();
import { Client, Intents } from "discord.js";
import { updatePlayerData } from "./lib/OSRS.js";
import { createUpdatedMessage } from "./lib/Viewer.js";
import * as fs from "fs";
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_INTEGRATIONS],
});
const viewerOptions = {
    page: 0,
    selected: "OVERALL",
    playerNames: [],
    data: {},
    lastUpdated: new Date().getTime(),
    pageTimer: 0,
};
client.once("ready", () => __awaiter(void 0, void 0, void 0, function* () {
    // Get channel from .env file and ensure it's a text channel
    if (!process.env.CHANNEL_ID)
        process.exit(987);
    const channel = yield client.channels.fetch(process.env.CHANNEL_ID);
    if (!channel)
        process.exit(988);
    if (!channel.isText())
        process.exit(989);
    // Get data JSON object for players
    if (!process.env.PLAYER_LIST)
        process.exit(990);
    viewerOptions.playerNames = JSON.parse(process.env.PLAYER_LIST);
    viewerOptions.data = yield updatePlayerData(viewerOptions.playerNames);
    viewerOptions.lastUpdated = new Date().getTime();
    fs.writeFile("test.json", JSON.stringify(viewerOptions.data, null, 2), (err) => {
        if (err)
            throw err;
    });
    const message = createUpdatedMessage(viewerOptions);
    channel.send(message);
    console.log("Ready");
}));
client.on("interactionCreate", (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (!interaction.isButton())
        return;
    console.log(`${interaction.user.username} clicked ${interaction.customId}`);
    // Check for last updated. If more than an hour update again
    let deferred = false;
    if (new Date().getTime() - viewerOptions.lastUpdated > 1000 * 60 * 60) {
        yield interaction.deferUpdate();
        deferred = true;
        viewerOptions.data = yield updatePlayerData(viewerOptions.playerNames);
        viewerOptions.lastUpdated = new Date().getTime();
    }
    if (interaction.customId === "next") {
        viewerOptions.page++;
        if (viewerOptions.pageTimer) {
            clearTimeout(viewerOptions.pageTimer);
            viewerOptions.pageTimer = 0;
        }
        if (viewerOptions.page !== 0) {
            setTimeout(() => {
                viewerOptions.page = 0;
                viewerOptions.pageTimer = 0;
                const message = createUpdatedMessage(viewerOptions);
                interaction.editReply(message);
            }, 30000);
        }
    }
    else if (interaction.customId === "prev") {
        viewerOptions.page--;
        if (viewerOptions.pageTimer) {
            clearTimeout(viewerOptions.pageTimer);
            viewerOptions.pageTimer = 0;
        }
        if (viewerOptions.page !== 0) {
            setTimeout(() => {
                viewerOptions.page = 0;
                viewerOptions.pageTimer = 0;
                const message = createUpdatedMessage(viewerOptions);
                interaction.editReply(message);
            }, 30000);
        }
    }
    else if (Object.keys(viewerOptions.data)
        .map((stat) => stat.toUpperCase())
        .includes(interaction.customId)) {
        viewerOptions.selected = interaction.customId;
    }
    else {
        const content = `Unable to find function for ${interaction.customId}`;
        interaction.reply({
            content,
            ephemeral: true,
        });
        console.error(content);
        return;
    }
    const message = createUpdatedMessage(viewerOptions);
    if (deferred) {
        interaction.editReply(message);
    }
    else {
        interaction.update(message);
    }
}));
client.login(process.env.DISCORD_TOKEN);
