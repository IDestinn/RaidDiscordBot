import "dotenv/config";
import { InstallGlobalCommands } from "./utils.js";

const RAID_LIST = [
  { name: "Грань спасения", value: "Грань спасения" },
  { name: "Крах кроты", value: "Крах кроты" },
  { name: "Истребитель кошмаров", value: "Истребитель кошмаров" },
  { name: "Гибель короля", value: "Гибель короля" },
  { name: "Клятва послушника", value: "Клятва послушника" },
  { name: "Хрустальный чертог", value: "Хрустальный чертог" },
  { name: "Склеп Глубокого камня", value: "Склеп Глубокого камня" },
  { name: "Сад спасения", value: "Сад спасения" },
  { name: "Последнее желание", value: "Последнее желание" },
];

// Command containing options
const RAID_COMMAND = {
  name: "raid",
  description: "Команда для создания объевления на сбор рейда",
  options: [
    {
      type: 3,
      name: "рейд",
      description: "Рейд, на который объевляется сбор",
      required: true,
      choices: RAID_LIST,
    },
    {
      type: 3,
      name: "когда",
      description: "День и время начала рейда",
      required: true,
    },
    {
      type: 3,
      name: "инфо",
      description: "Дополнительная информация о рейде\nНапример мастер рейд",
      required: false,
    },
    {
      type: 3,
      name: "размер",
      description: "Размер группы которую вы хотите собрать (по умолчанию 6)",
      required: false,
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

const ALL_COMMANDS = [RAID_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
