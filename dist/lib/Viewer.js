import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import dayjs from "dayjs";
import { Skill, Activity, Boss } from "./OSRS.js";
function createEmbed(options) {
    const embed = new MessageEmbed();
    embed.color = 5814783;
    let nameStr = "";
    let levelStr = "";
    let xpBehindStr = "";
    let countStr = "";
    let rankStr = "";
    options.data[options.selected].forEach((player) => {
        nameStr += player.player.replace("d5-", "") + "\n";
        levelStr += player.level + "\n";
        if (player instanceof Skill) {
            if (player.xpBehind !== undefined)
                xpBehindStr += player.xpBehind.toLocaleString() + "\n";
            else
                xpBehindStr += " \n";
        }
        else if (player instanceof Activity || player instanceof Boss) {
            countStr += player.count + "\n";
            rankStr += player.rank + "\n";
        }
    });
    embed.title = options.selected;
    embed.addField("NAME", nameStr, true);
    if (options.data[options.selected][0] instanceof Skill) {
        embed.addField("LEVEL", levelStr, true);
        embed.addField("XP", xpBehindStr, true);
    }
    else if (options.data[options.selected][0] instanceof Activity ||
        options.data[options.selected][0] instanceof Boss) {
        embed.addField("COUNT", countStr, true);
        embed.addField("RANK", rankStr, true);
    }
    embed.setFooter({
        text: `Last updated ${dayjs(options.lastUpdated).format("M/D h:mm A")}`,
    });
    return embed;
}
function createAllButtons(stats) {
    const buttons = [];
    stats.forEach((stat) => {
        const button = new MessageButton();
        button.customId = stat;
        button.style = "PRIMARY";
        button.label = stat.toUpperCase();
        buttons.push(button);
    });
    return buttons;
}
function addNextPrevButtons(buttons, page) {
    const nextButton = new MessageButton();
    nextButton.customId = "next";
    nextButton.label = "NEXT";
    nextButton.style = "SUCCESS";
    if (page === 3)
        nextButton.disabled = true;
    const prevButton = new MessageButton();
    prevButton.customId = "prev";
    prevButton.label = "PREV";
    prevButton.style = "DANGER";
    if (page === 0)
        prevButton.disabled = true;
    buttons.push(prevButton);
    buttons.push(nextButton);
    return buttons;
}
function chunk(arr, limit) {
    const numChunks = Math.ceil(arr.length / limit);
    return Array.from({ length: numChunks }, (_, i) => arr.slice((i * arr.length) / numChunks, ((i + 1) * arr.length) / numChunks));
}
function createMessageComponents(stats, page) {
    const allButtons = createAllButtons(stats);
    const pageButtons = chunk(addNextPrevButtons(allButtons.splice(10 * page, 10), page), 5);
    return pageButtons.map((row) => new MessageActionRow().addComponents(row));
}
export function createUpdatedMessage(viewerOptions) {
    const embed = createEmbed(viewerOptions);
    const components = createMessageComponents(Object.keys(viewerOptions.data), viewerOptions.page);
    return { embeds: [embed], components };
}
