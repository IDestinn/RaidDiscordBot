import "dotenv/config";
import express from "express";
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from "discord-interactions";
import { DiscordRequest, GenerateAnnouncement } from "./utils.js";

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

const raidThumbnails = [
  {
    name: "Грань спасения",
    value: "https://destiny.wiki.gallery/images/3/36/Salvation%27s_Edge.png",
  },
  {
    name: "Крах кроты",
    value: "https://destiny.wiki.gallery/images/a/a4/Crota_End_Team.jpg",
  },
  {
    name: "Истребитель кошмаров",
    value: "https://destiny.wiki.gallery/images/d/d7/Root_of_Nightmares.jpg",
  },
  {
    name: "Гибель короля",
    value: "https://destiny.wiki.gallery/images/f/f5/Kings_Fall_Team.jpg",
  },
  {
    name: "Клятва послушника",
    value: "https://destiny.wiki.gallery/images/0/0e/Vow_of_the_Disciple.jpg",
  },
  {
    name: "Хрустальный чертог",
    value: "https://destiny.wiki.gallery/images/b/b6/Vault_of_Glass_Team.jpg",
  },
  {
    name: "Склеп Глубокого камня",
    value: "https://destiny.wiki.gallery/images/6/67/DestinyTaniks1.jpg",
  },
  {
    name: "Сад спасения",
    value:
      "https://destiny.wiki.gallery/images/7/75/GardenofSalvationStart.jpg",
  },
  {
    name: "Последнее желание",
    value: "https://destiny.wiki.gallery/images/7/76/Riven_Raid.jpg",
  },
];

const raidAnnouncement = {};

app.post(
  "/interactions",
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  async function (req, res) {
    // Interaction type and data
    const { type, id, data } = req.body;

    if (type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }

    if (type === InteractionType.APPLICATION_COMMAND) {
      const { name } = data;

      if (name === "raid" && id) {
        const context = req.body.context;

        const requestId = req.body.id;
        const user = context === 0 ? req.body.member.user : req.body.user;

        const raidName = req.body.data.options[0].value;

        const raidImage = raidThumbnails.find(
          (raid) => raid.name === raidName
        ).value;

        const startTime = req.body.data.options[1].value;

        const raidInfo = req.body.data.options[2]?.value;

        const value = req.body.data.options[3]?.value;
        const freeSlots = value !== undefined && value !== null ? value - 1 : 5;

        raidAnnouncement[requestId] = {
          requestId,
          user,
          group: [user.id],
          raidName,
          raidImage,
          startTime,
          raidInfo,
          freeSlots,
        };

        const response = {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: await GenerateAnnouncement(
            requestId,
            user,
            [user.id],
            raidName,
            raidImage,
            startTime,
            raidInfo,
            freeSlots
          ),
        };

        return res.send(response);
      }

      console.error(`unknown command: ${name}`);
      return res.status(400).json({ error: "unknown command" });
    }

    if (type === InteractionType.MESSAGE_COMPONENT) {
      const componentId = data.custom_id;
      const user = req.body.member.user;

      if (componentId.startsWith("unregistre_button_")) {
        const endpoint = `channels/${req.body.channel.id}/messages/${req.body.message.id}`;

        const requestId = componentId.replace("unregistre_button_", "");

        if (raidAnnouncement[requestId]) {
          var index = raidAnnouncement[requestId].group.indexOf(user.id);
          if (index > -1) {
            raidAnnouncement[requestId].group.splice(index, 1);
          } else {
            console.error("not in lobby");
            return res.status(409).json({ error: "not in lobby" });
          }

          raidAnnouncement[requestId].freeSlots += 1;

          const response = {
            method: "PATCH",
            body: await GenerateAnnouncement(
              requestId,
              raidAnnouncement[requestId].user,
              raidAnnouncement[requestId].group,
              raidAnnouncement[requestId].raidName,
              raidAnnouncement[requestId].raidImage,
              raidAnnouncement[requestId].startTime,
              raidAnnouncement[requestId].raidInfo,
              raidAnnouncement[requestId].freeSlots
            ),
          };

          try {
            await DiscordRequest(endpoint, response);
          } catch (err) {
            console.error("Error sending message:", err);
          }
        }
      } else if (componentId.startsWith("registre_button_")) {
        const endpoint = `channels/${req.body.channel.id}/messages/${req.body.message.id}`;

        const requestId = componentId.replace("registre_button_", "");

        if (raidAnnouncement[requestId]) {
          // Если пользователь уже в участниках
          var index = raidAnnouncement[requestId].group.indexOf(user.id);
          if (index > -1) {
            console.error("already in lobby");
            return res.status(409).json({ error: "already in lobby" });
          }

          raidAnnouncement[requestId].freeSlots -= 1;
          raidAnnouncement[requestId].group.push(user.id);

          const response = {
            method: "PATCH",
            body: await GenerateAnnouncement(
              requestId,
              raidAnnouncement[requestId].user,
              raidAnnouncement[requestId].group,
              raidAnnouncement[requestId].raidName,
              raidAnnouncement[requestId].raidImage,
              raidAnnouncement[requestId].startTime,
              raidAnnouncement[requestId].raidInfo,
              raidAnnouncement[requestId].freeSlots
            ),
          };

          try {
            await DiscordRequest(endpoint, response);
          } catch (err) {
            console.error("Error sending message:", err);
          }
        }
      }
    }

    console.error("unknown interaction type", type);
    return res.status(400).json({ error: "unknown interaction type" });
  }
);

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
