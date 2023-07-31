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

async function getHTML(url){
    response = await getResponse(new URL(url));
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

async function getRandomLegendaryItem(itemData){
    let keys = Object.keys(itemData);
    let currentItemID;
    let MythRegex = /Mythic Passive/;
    while(true){
        currentItemID = keys[getRandomNumber(keys.length)];
        if(itemData[currentItemID]['depth'] == 3 && itemData[currentItemID]['description'].search(MythRegex) < 0 
        && itemData[currentItemID]['maps']['11'] && !itemData[currentItemID]['into']){
            return itemData[currentItemID];
        }
    }
}

async function getRandomBoots(itemData){
    let keys = Object.keys(itemData);
    let currentItemID;
    while(true){
        currentItemID = keys[getRandomNumber(keys.length)];
        if(itemData[currentItemID]['depth'] == 2 && !itemData[currentItemID]['into'] && itemData[currentItemID]['maps']['11'] && itemData[currentItemID]['gold']['total'] <= 1100 
        && itemData[currentItemID]['gold']['total'] >= 900 && itemData[currentItemID]['gold']['purchasable']){ //HOLY FUCK
            return itemData[currentItemID];
        }
    }
}

async function getRandomMythicItem(itemData){
    let keys = Object.keys(itemData);
    let currentItemID;
    let MythRegex = /Mythic Passive/;
    let OrnnRegex = /ornnBonus/;
    while(true){
        currentItemID = keys[getRandomNumber(keys.length)];
        if(itemData[currentItemID]['description'].search(MythRegex) > 0 && itemData[currentItemID]['maps']['11'] && itemData[currentItemID]['description'].search(OrnnRegex) < 0){
            return itemData[currentItemID];
        }
    }
}

async function getRandomBuild(itemData){
    let build = [];
    build.push(await getRandomMythicItem(itemData));
    build.push(await getRandomBoots(itemData));
    for(i = 0; i < 4; i++){
        build.push(await getRandomLegendaryItem(itemData));
    }
    return build;
}

async function createEmbed(name, imageName, build){
    let itemNameList = [];
    for(item of build){
        itemNameList.push(item['name']);
    }

    const embed = new EmbedBuilder()
    .setColor(0xFFFFFF)
    .setTitle(name)
    .addFields(
        
        {name: '1', value: itemNameList[0]},
        {name: '2', value: itemNameList[1]},
        {name: '3', value: itemNameList[2]},
        {name: '4', value: itemNameList[3]},
        {name: '5', value: itemNameList[4]},
        {name: '6', value: itemNameList[5]}
    )
    .setImage(imageName);
    return embed;
}

module.exports = { 
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Gives you a completely randomized build for a random champion'),

    async execute(client, interaction) {
        items = await getHTML(`http://ddragon.leagueoflegends.com/cdn/13.14.1/data/en_US/item.json`);
        champions = await getHTML(`http://ddragon.leagueoflegends.com/cdn/13.14.1/data/en_US/champion.json`);
        let JSONchampions = JSON.parse(champions);
        let JSONitems = JSON.parse(items);
        let championData = JSONchampions['data'];
        let itemData = JSONitems['data'];
        let build = await getRandomBuild(itemData);
        let rndChampion = await getRandomChampion(championData);
        let name  = rndChampion.name;
        let imageLink = `http://ddragon.leagueoflegends.com/cdn/13.14.1/img/champion/${rndChampion.image.full}`;
        embed = await createEmbed(name, imageLink, build);
        // console.log(build);
        // await interaction.editReply('test');
        await interaction.editReply({
            embeds: [embed] //kys
        });
    },
}; 