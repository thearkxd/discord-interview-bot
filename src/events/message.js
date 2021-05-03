const { MessageEmbed } = require("discord.js");
const { Database } = require("ark.db");
const db = new Database();
const conf = require("../configs/config.json");

module.exports = async (message) => {
  if (message.author.bot || message.channel.id !== conf.channel) return;
  if (message.content !== conf.command) return message.delete();
  if (message.guild.channels.cache.filter((x) => x.parentID === conf.parent).size >= 7) {
    message.react(conf.cross);
    return message.channel.send(` ${message.author.toString()}, üzgünüm ama şu anki başvuru kapasitem dolu! Daha sonra tekrar dener misin?`).then((x) => x.delete({ timeout: 20000 }));
  }

  message.react(conf.mark);
  message.channel.send(`
${message.author.toString()}, başvurun için sol tarafta sana özel bir kanal açıldı!
O kanaldan botun sorduğu soruları cevaplayarak yetkili başvurusunda bulunabilirsin!
  `).then((x) => x.delete({ timeout: 10000 }));

  const regex = /[a-zA-Z0-9]{1,20}/g;
  const username = message.author.username.match(regex)[0];
  const newChannel = await message.guild.channels.create(username, {
    type: "text",
    parent: message.channel.parent,
    permissionOverwrites: [{ id: message.author.id, allow: ["VIEW_CHANNEL"], deny: ["SEND_MESSAGES"] }]
  });
  const newMessage = await newChannel.send(`
Hoş Geldin ${message.author.toString()}
Eğer Başvuruya Devam Etmek İstiyorsan, ✅ Emojisine Tıkla!
Tıkladıktan Sonra Botun Soracağı Soruları Cevaplamalısın!
\`Not: Başvuru Yaparken Tek Mesaj Halinde Cevap Veriniz. Bütün Soruları Cevaplamak İçin 5 Dakikanız Var\`
  `);
  await newMessage.react(conf.mark);
  await newMessage.react(conf.cross);

  const dewamke = newMessage.createReactionCollector((reaction, user) => reaction.emoji.name === conf.mark && user.id === message.author.id, { time: 1000 * 60 * 5 });
  const iptalke = newMessage.createReactionCollector((reaction, user) => reaction.emoji.name === conf.cross && user.id === message.author.id, { time: 1000 * 60 * 5 });

  dewamke.on("collect", async () => {
    newChannel.overwritePermissions([{ id: message.author.id, allow: ["SEND_MESSAGES"] }]);
    newMessage.delete();
    await newChannel.send("Öncelikle adını söyler misin?");
    const name = await newChannel.awaitMessages((m) => m.author.id === message.author.id, {
      max: 1,
      time: 1000 * 60 * 5,
      errors: ["time"]
    }).catch(() => newChannel.delete());
    await newChannel.send(`Memnun oldum ${name.first().content}, şimdi de yaşını öğrenebilir miyim?`);
    const age = await newChannel.awaitMessages((m) => m.author.id === message.author.id, {
      max: 1,
      time: 1000 * 60 * 5,
      errors: ["time"]
    }).catch(() => newChannel.delete());
    await newChannel.send(`Teşekkür ederim ${name.first().content}, Peki şimdi de Discord'da yaklaşık kaç saat aktif olduğunu söyler misin?`);
    const activity = await newChannel.awaitMessages((m) => m.author.id === message.author.id, {
      max: 1,
      time: 1000 * 60 * 5,
      errors: ["time"]
    }).catch(() => newChannel.delete());
    await newChannel.send(`Peki günlük kaç invite yapabilirsin? Ya da yapabilir misin?`);
    const invite = await newChannel.awaitMessages((m) => m.author.id === message.author.id, {
      max: 1,
      time: 1000 * 60 * 5,
      errors: ["time"]
    }).catch(() => newChannel.delete());
    await newChannel.send(`Başvurun başarıyla alındı ${isim.first().content}, Yetkililer en kısa sürede başvurunu inceleyip geri döneceklerdir! İyi günler.`);
    const embed = new MessageEmbed()
      .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true, size: 2048 }))
      .setThumbnail(message.author.avatarURL({ dynamic: true, size: 2048 }))
      .setTitle("Cevap Bekliyor...")
      .setColor("BLUE")
      .setDescription(`
**Başvuruda bulunan:** ${message.member.toString()} \`(${message.author.username} - ${message.author.id})\`
**Başvuru tarihi:** ${moment().format("LLL")}
**İsim:** ${name.first().content}
**Yaş:** ${age.first().content}
**Aktiflik Süresi:** ${activity.first().content}
**Günlük İnvite Durumu:** ${invite.first().content}
      `);
    await message.guild.channels.cache.get(conf.log).send(embed);
    await x.react(conf.mark);
    await x.react(conf.cross);
    db.set(`başvuran.${x.id}`, message.author.id);
    db.set(`date.${x.id}`, Date.now());
    setTimeout(() => {
      newChannel.delete();
    }, 10000);
  });

  iptalke.on("collect", () => newChannel.delete());

  dewamke.on("end", (collected) => {
    if (collected.size !== 0) return;
    newChannel.delete();
  });
};

module.exports.conf = {
  name: "message"
};
