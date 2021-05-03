const penals = require("../schemas/penals");
const { GuildMember, TextChannel } = require("discord.js");

module.exports = async (client) => {
  TextChannel.prototype.wsend = async function (message) {
	  const hooks = await this.fetchWebhooks();
	  let webhook = hooks.find(a => a.name === client.user.username && a.owner.id === client.user.id);
	  if (webhook) return hook.send(message);
    else {
      webhook = await this.createWebhook(client.user.username, { avatar: client.user.avatarURL() });
      return webhook.send(message);
    };
  };

  Array.prototype.random = function () {
    return this[Math.floor((Math.random() * this.length))];
  };
};
