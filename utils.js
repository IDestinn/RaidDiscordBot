import "dotenv/config";
import { MessageComponentTypes, ButtonStyleTypes } from "discord-interactions";

export async function DiscordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = "https://discord.com/api/v10/" + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      "Content-Type": "application/json; charset=UTF-8",
      "User-Agent":
        "DiscordBot (https://github.com/IDestinn/RaidDiscordBot, 1.0.0)",
    },
    ...options,
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

export async function InstallGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await DiscordRequest(endpoint, { method: "PUT", body: commands });
  } catch (err) {
    console.error(err);
  }
}

export async function GenerateAnnouncement(
  messageId,
  user,
  group,
  raidName,
  raidImage,
  startTime,
  raidInfo,
  freeSlots
) {
  let users = "";

  for (let i = 0; i < group.length; i++) {
    users += `<@${group[i]}>`;

    if (i < group.length - 1) {
      users += "\n";
    }
  }
  return {
    embeds: [
      {
        title: `${raidName} | ${startTime}`,
        description: raidInfo,
        color: user.accent_color,
        author: {
          name: user.username,
          icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
        },
        fields: [
          {
            name: "Группа:",
            value: users,
            inline: true,
          },
        ],
        thumbnail: {
          url: raidImage,
          height: 360,
          width: 640,
        },
      },
    ],
    components: [
      {
        type: MessageComponentTypes.ACTION_ROW,
        custom_id: `raid_${messageId}`,
        components: [
          {
            type: MessageComponentTypes.BUTTON,
            custom_id: `registre_button_${messageId}`,
            label: freeSlots > 0 ? `+${freeSlots} ✅` : "Лобби полное 🚧",
            style:
              freeSlots > 0
                ? ButtonStyleTypes.SUCCESS
                : ButtonStyleTypes.DANGER,
            disabled: freeSlots <= 0,
          },
          {
            type: MessageComponentTypes.BUTTON,
            custom_id: `unregistre_button_${messageId}`,
            label: "Выйти из лобби 🚪🏃",
            style: ButtonStyleTypes.DANGER,
          },
        ],
      },
    ],
  };
}
