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

async function getRandomChampionByClass(championData, chosenClass){
        let champion = await getRandomChampion(championData);
        while(!Object.values(champion.tags).includes(chosenClass)){
            champion = await getRandomChampion(championData);
        }
        return champion;
        
    
}

async function getRandomChampion(championData){
    let Keys = Object.keys(championData);
    let randomNumber = getRandomNumber(Keys.length);
    return championData[Keys[randomNumber]];
}

async function createEmbed(name, classes, imageName){
    const embed = new EmbedBuilder()
    .setColor(0xFFFFFF)
    .setTitle(name)
    .setDescription(String(classes))
    .setImage(imageName);
    return embed;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomchampbyclass')
        .setDescription('Gives you a random League of Legends champion based on the provided class')
        .addStringOption((option) => {
            option.setName('class')
                .setDescription("Champion Class")
                .addChoices({name: 'Tank', value: 'Tank'})
                .addChoices({name: 'Mage', value: 'Mage'})
                .addChoices({name: 'Support', value: 'Support'})
                .addChoices({name: 'Fighter', value: 'Fighter'})
                .addChoices({name: 'Markman', value: 'Marksman'})
                .addChoices({name: 'Assassin', value: 'Assassin'})
                .setRequired(true)
                return option;
        }),
    async execute(client, interaction) {
        response = await getHTML();
        let JSONresponse = JSON.parse(response)
        let championData = JSONresponse['data'];
        let chosenClass = interaction.options.getString('class', true);
        let rndChampion = await getRandomChampionByClass(championData, chosenClass);
        if(typeof(rndChampion) === 'string'){
            await interaction.editReply('That is not a class.')    
        }
        let name  = rndChampion.name;
        let classes = rndChampion.tags;
        let imageLink = `http://ddragon.leagueoflegends.com/cdn/13.14.1/img/champion/${rndChampion.image.full}`;
        embed = await createEmbed(name, classes, imageLink);
        await interaction.editReply({
            embeds: [embed]
        });
    },
};