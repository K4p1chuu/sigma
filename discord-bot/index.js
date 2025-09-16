const { Client, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch');

// --- KONFIGURACJA ---
// WAŻNE: Wklej tutaj swój poprawny i zresetowany token bota
const BOT_TOKEN = 'MTQxMTI2OTA5NDUyNjY4MTExOQ.Gk2oOt.VZrJ_P10jo7DPQnGrZWJf-qbyPi16-YkIpckNA'; 
// WAŻNE: Wklej tutaj ID kanału, na którym bot ma nasłuchiwać wiadomości o badaniach technicznych
const INSPECTION_CHANNEL_ID = '1412119165208363068'; 
// WAŻNE: Zmień na adres URL swojego hostingu
const API_ENDPOINT = 'https://wisconsinstatepatrolmdt.pl/api/vehicle-inspection'; 

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`Zalogowano jako ${client.user.tag}! Bot jest gotowy do pracy.`);
});

async function parseAndPostInspection(message) {
    console.log(`[BOT] Otrzymano nową wiadomość na kanale badań. Próbuję przetworzyć...`);
    const content = message.content;
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);

    const data = {};

    lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.startsWith('właściciel pojazdu:')) data.owner = line.substring(line.indexOf(':') + 1).trim();
        if (lowerLine.startsWith('rodzaj nadwozia:')) data.bodyType = line.substring(line.indexOf(':') + 1).trim();
        if (lowerLine.startsWith('marka:')) data.make = line.substring(line.indexOf(':') + 1).trim();
        if (lowerLine.startsWith('model:')) data.model = line.substring(line.indexOf(':') + 1).trim();
        if (lowerLine.startsWith('trim:')) data.trim = line.substring(line.indexOf(':') + 1).trim();
        if (lowerLine.startsWith('rok produkcji:')) data.year = line.substring(line.indexOf(':') + 1).trim();
        if (lowerLine.startsWith('numery rejestracyjne, stan:')) {
            const plateAndState = line.substring(line.indexOf(':') + 1).trim().split(',');
            data.plate = plateAndState[0]?.trim();
            data.state = plateAndState[1]?.trim();
        }
        if (lowerLine.startsWith('historia pojazdu:')) data.history = line.substring(line.indexOf(':') + 1).trim();
        if (lowerLine.startsWith('data następnego badania technicznego:')) data.nextInspectionDate = line.split('**')[1]?.trim();
        if (lowerLine.startsWith('wynik badania:')) data.result = line.includes('Pozytywny') ? 'Pozytywny' : 'Negatywny';
        if (lowerLine.startsWith('powód:')) data.reason = line.substring(line.indexOf(':') + 1).trim();
        if (lowerLine.startsWith('numer skp:')) data.station = line.split('**')[1]?.trim();
    });
    
    const ownerIdMatch = data.owner?.match(/<@(\d+)>/);
    data.ownerId = ownerIdMatch ? ownerIdMatch[1] : null;

    console.log('[BOT] Wyodrębnione dane:', data);

    if (!data.ownerId || !data.plate || !data.result) {
        console.log('[BOT] BŁĄD: Wiadomość nie zawierała kluczowych danych (Właściciel, Rejestracja, Wynik). Ignoruję.');
        return;
    }

    try {
        console.log(`[BOT] Wysyłanie danych do API: ${API_ENDPOINT}`);
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, rawMessage: content })
        });

        if (response.ok) {
            console.log(`[BOT] SUKCES: Dane dla pojazdu ${data.plate} zostały pomyślnie zapisane w MDT.`);
        } else {
            const errorText = await response.text();
            console.error(`[BOT] BŁĄD API: Serwer odpowiedział statusem ${response.status}. Odpowiedź: ${errorText}`);
        }
    } catch (error) {
        console.error('[BOT] KRYTYCZNY BŁĄD: Nie udało się połączyć z API serwera MDT.', error);
    }
}

client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

  if (message.channel.id === INSPECTION_CHANNEL_ID) {
    await parseAndPostInspection(message);
  }
});

client.login(BOT_TOKEN);