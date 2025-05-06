require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const express = require("express");

// Criando o bot do Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const DATA_FILE = "respostas.json";

// Carrega os dados ou inicializa
let respostas = [];
if (fs.existsSync(DATA_FILE)) {
    respostas = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

// Função para salvar no arquivo
function salvarDados() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(respostas, null, 2));
}

// Comando para registrar "Sim" ou "Não"
client.on("messageCreate", (message) => {
    if (message.author.bot) return;
    const resposta = message.content.toLowerCase();

    if (resposta === "sim" || resposta === "não" || resposta === "nao") {
        respostas.push(resposta);
        salvarDados();
        message.reply(
            `Resposta "${resposta}" registrada! Dias contados: ${respostas.length}/15`,
        );

        // Se atingir 15 respostas, exibe o resultado e reseta
        if (respostas.length === 15) {
            let totalSim = respostas.filter((r) => r === "sim").length;
            let totalNao = respostas.filter(
                (r) => r === "não" || r === "nao",
            ).length;
            message.reply(
                `🔹 **Resultado dos últimos 15 dias:**\n✅ Sim: ${totalSim}\n❌ Não: ${totalNao}`,
            );

            // Reseta contagem
            respostas = [];
            salvarDados();
            message.reply(
                "📢 **A contagem foi reiniciada para os próximos 15 dias!**",
             );
        }
    }

    // ✅ NOVO BLOCO ADICIONADO PARA RESET MANUAL
    if (resposta === "reset") {
        respostas = [];
        salvarDados();
        message.reply("🔁 Contagem manualmente reiniciada!");
    }
});

// Login do bot no Discord
client.login(process.env.DISCORD_TOKEN);

// 🔹 Servidor Express para manter o bot online no Replit
const app = express();

app.get("/", (req, res) => {
    res.send("Bot está rodando!");
});

app.listen(3000, () => {
    console.log("Servidor Express rodando na porta 3000");
});
