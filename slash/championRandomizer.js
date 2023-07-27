const { SlashCommandBuilder } = require('discord.js');

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
    let rand = floor(Math.random() * (max+1));
    return rand;
}

async function getRandomChampion(championData){
    let Keys = Object.keys(championData);
    let randomNumber = getRandomNumber(Keys.length);
    return championData[Keys[randomNumber]].name;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rndChamp')
        .setDescription('Gives you a random League of Legends champion'),
    async execute(client, interaction) {
        response = await getHTML();
        let JSONresponse = JSON.parse(response)
        let championData = JSONresponse['data'];
        let championName = await getRandomChampion(championData);
        interaction.editReply(championName);
    },
};