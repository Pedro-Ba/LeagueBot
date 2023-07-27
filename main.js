const Discord = require("discord.js")
const dotenv = require("dotenv")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const fs = require("fs")

dotenv.config()
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const LOAD_SLASH = process.argv[2] == "load"

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildVoiceStates
    ]
})

client.slashcommands = new Discord.Collection();

let commands = []

const slashFiles = fs.readdirSync("./slash").filter(file => file.endsWith(".js"))
for (const file of slashFiles){
    const slashcmd = require(`./slash/${file}`)
    client.slashcommands.set(slashcmd.data.name, slashcmd)
    if (LOAD_SLASH) commands.push(slashcmd.data.toJSON())
}

//not sure if I like LOAD_SLASH, I might turn this into a separate file to be ran individually later
if (LOAD_SLASH) {
    const rest = new REST({ version: "10" }).setToken(TOKEN)
    console.log("Deploying slash commands")
    rest.put(Routes.applicationCommands(CLIENT_ID), {body: commands})
    .then(() => {
        console.log("Successfully loaded")
        process.exit(0)
    })
    .catch((err) => {
        if (err){
            console.log(err)
            process.exit(1)
        }
    })
}
else {
    client.on("ready", () => {
        console.log(`Logged in as ${client.user.tag}`)
    })
    client.on("interactionCreate", (interaction) => {
        async function handleCommand() {
            if (!interaction.isCommand()) return

            const slashcmd = client.slashcommands.get(interaction.commandName);
            if (!slashcmd) interaction.reply("Not a valid slash command");
            await interaction.deferReply();
            await slashcmd.execute(client, interaction);
        }
        handleCommand()
    })
    client.login(TOKEN)
}

