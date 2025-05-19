const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Sadece GET isteği kabul edilir." });
    return;
  }

  const username = req.query.username;
  if (!username) {
    res.status(400).json({
      error: "username parametresi gerekli.",
      usage: "/api?username=RobloxKullaniciAdi"
    });
    return;
  }

  try {
    const searchResponse = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: true,
      }),
    });

    if (!searchResponse.ok) {
      res.status(500).json({ error: "Roblox API bağlantı hatası." });
      return;
    }

    const searchData = await searchResponse.json();

    if (!searchData.data || searchData.data.length === 0) {
      res.status(404).json({ error: "Kullanıcı bulunamadı." });
      return;
    }

    const userId = searchData.data[0].id;

    const detailsResponse = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    if (!detailsResponse.ok) {
      res.status(500).json({ error: "Roblox kullanıcı bilgileri alınamadı." });
      return;
    }
    const details = await detailsResponse.json();

    const avatarUrl = `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=150&height=150&format=png`;

    res.status(200).json({
      id: userId,
      username: details.name || username,
      display_name: details.displayName || details.name || username,
      created: details.created,
      description: details.description || null,
      avatar: avatarUrl,
    });

  } catch (error) {
    res.status(500).json({ error: `Hata oluştu: ${error.message}` });
  }
};
