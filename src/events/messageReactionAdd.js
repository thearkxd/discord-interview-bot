const { MessageEmbed } = require("discord.js");
const { Database } = require("ark.db");
const db = new Database();
const conf = require("../../config.json");
const moment = require("moment");
moment.locale("tr");

module.exports = async (reaction, user) => {
  if (user.bot || reaction.message.channel.id !== conf.log) return;
  if (reaction.emoji.name === conf.mark) {
    const data = db.get(`başvuran.${reaction.message.id}`);
    const date = db.get(`date.${reaction.message.id}`);
    const member = reaction.message.guild.members.cache.get(data);
    member.roles.add(conf.staff);

    const embed = new MessageEmbed()
      .setTitle("Onaylandı!")
      .setColor("GREEN")
      .setAuthor(member.user.username, member.user.avatarURL({ dynamic: true, size: 2048 }))
      .setThumbnail(member.user.avatarURL({ dynamic: true, size: 2048 }))
      .setDescription(`
Başvuru Sahibi: ${member.toString()} \`(${member.user.username} - ${member.user.id})\`
Başvurduğu tarih: ${moment(date).format("LLL")}
Onaylandığı Tarih: ${moment().format("LLL")}
Onaylayan: ${user.toString()} \`(${user.username} - ${user.id})\`
      `);
    reaction.message.edit(embed);
    reaction.message.reactions.removeAll();
    member.send(`${reaction.message.guild.name} sunucusundaki yetkili başvurun onaylandı!`).catch(() => {});
  } else if (reaction.emoji.name === conf.cross) {
    const data = db.get(`başvuran.${reaction.message.id}`);
    const date = db.get(`date.${reaction.message.id}`);
    const member = reaction.message.guild.members.cache.get(data);
    const embed = new MessageEmbed()
      .setTitle("Reddedildi!")
      .setColor("RED")
      .setAuthor(member.user.username, member.user.avatarURL({ dynamic: true, size: 2048 }))
      .setThumbnail(member.user.avatarURL({ dynamic: true, size: 2048 }))
      .setDescription(`
Başvuru Sahibi: ${member.toString()} \`(${member.user.username} - ${member.user.id})\`
Başvurduğu tarih: ${moment(date).format("LLL")}
Reddedildiği Tarih: ${moment().format("LLL")}
Reddeden: ${user.toString()} \`(${user.username} - ${user.id})\`
      `);
    reaction.message.edit(embed);
    reaction.message.reactions.removeAll();
    member.send(`${reaction.message.guild.name} sunucusundaki yetkili başvurun reddedildi!`).catch(() => {});
  }
}

module.exports.conf = {
  name: "messageReactionAdd"
};