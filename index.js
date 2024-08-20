const { Client, GatewayIntentBits, WebhookClient, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cron = require('node-cron');

const authToken = '';
const webhookUrl = 'https://discord.com/api/webhooks/...';
const botToken = '';

const webhookClient = new WebhookClient(
    { 
        url: webhookUrl,
        avatarURL: 'https://jinxscript.dev/img/favicon.png',
        name: 'DDoS attack detected'
    }
);

let isFirstRun = true;
let previousAttackStatuses = {};

const fetchApiData = async () => {
    try {
        const response = await axios.get('https://shield.royalehosting.net/api/v2/attacks?chunk=0', {
            headers: { token: authToken }
        });

        if (response.status < 200 || response.status > 299) {
            console.log('PollApiData Request did not succeed, returning...');
            return;
        }

        const attacks = response.data.data.attacks;

        for (const attackJson of attacks) {
            const attack = {
                AttackId: attackJson.attack_id,
                Status: attackJson.status,
                IpAddress: attackJson.dest,
                StartTime: attackJson.start_time,
                Duration: attackJson.duration,
                MaxPeak: attackJson.mbps,
                Pps: attackJson.pps,
                Volume: attackJson.volume,
                Description: attackJson.description
            };
            const channel = client.channels.cache.get('1238442612323516436');
            if (isFirstRun) {
                previousAttackStatuses[attack.AttackId] = attack.Status;

                if (attack.Status !== 'end') {
                    await sendDiscordEmbed(attack, channel);
                }
            } else {
                if (!previousAttackStatuses[attack.AttackId] || previousAttackStatuses[attack.AttackId] !== attack.Status) {
                    previousAttackStatuses[attack.AttackId] = attack.Status;
                    await sendDiscordEmbed(attack, channel);
                }
            }
        }

        isFirstRun = false;
    } catch (error) {
        console.error(`Error fetching API data: ${error.message}`);
    }
};

const attackColors = {
    start: '#DBAA24',
    ongoing: '#FF0000',
    end: '#00ff77'
}

async function sendDiscordEmbed(attack) {
    if (attack.Status == 'ongoing') return;
    const embed = new EmbedBuilder()
        .setTitle('Attack Monitoring')
        .setTimestamp()
        .setColor(attackColors[attack.Status] || '#FF0000')
        .setTitle('Attack Detected')
        .setDescription(`**Attack ID:** ${attack.AttackId}`)
        .addFields({ name: 'Targeted IP', value: attack.IpAddress })
        .addFields({ name: 'Status', value: attack.Status })
        .addFields({ name: 'Start Time', value: attack.StartTime })
        .addFields({ name: 'Attack Duration', value: `${attack.Duration} seconds` })
        .addFields({ name: 'Attack Vector', value: attack.Description })
   if (attack.Status == 'end') {
        embed.setTitle('Attack Ended\n\nDetails:')
        embed.addFields({ name: 'Attack Stats', value: `Max Peak: ${attack.MaxPeak} Mbps / ${attack.MaxPeak / 1000} Gbps & ${attack.Pps} PPS\nAttack Traffic Volume: ${attack.Volume} MB` })
    }

    try {
        webhookClient.send({ embeds: [embed] });
    } catch (error) {
        console.error(`Error during sending Attack Webhook: ${error.message}`);
    }
};

const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,     
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildIntegrations,
  
    ],
  });
client.once('ready', () => {
    console.log('Attack Monitor Started!');

    cron.schedule('* * * * *', fetchApiData); 

    fetchApiData();
});

client.login(botToken);
