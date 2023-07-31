const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

const headers = {
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
}

async function getResponse(url){
    return fetch(url, {
        method: "GET",
        headers,
    });
}

async function getHTML(){
    response = await getResponse(new URL(`http://ddragon.leagueoflegends.com/cdn/13.14.1/data/en_US/champion.json`));
    return response.text();
}

function getRandomNumber(max){
    let rand = Math.floor(Math.random() * max);
    return rand;
}

async function getRandomChampion(championData){
    let Keys = Object.keys(championData);
    let randomNumber = getRandomNumber(Keys.length);
    return championData[Keys[randomNumber]];
}

async function createEmbed(name, imageName){
    const embed = new EmbedBuilder()
    .setColor(0xFFFFFF)
    .setTitle(name)
    .setImage(imageName);
    return embed;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomchamp')
        .setDescription('Gives you a random League of Legends champion'),
    async execute(client, interaction) {
        response = await getHTML();
        let JSONresponse = JSON.parse(response)
        let championData = JSONresponse['data'];
        let rndChampion = await getRandomChampion(championData);
        let name  = rndChampion.name;
        let imageLink = `http://ddragon.leagueoflegends.com/cdn/13.14.1/img/champion/${rndChampion.image.full}`;
        embed = await createEmbed(name, imageLink);
        await interaction.editReply({
            embeds: [embed]
        });
    },
};