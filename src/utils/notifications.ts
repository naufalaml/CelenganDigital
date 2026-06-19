import { LocalNotifications } from '@capacitor/local-notifications';

// List of 30 daily motivational money saving quotes in Indonesian
const MOTIVATIONAL_QUOTES = [
  "Mimpi besar dimulai dari celengan kecil. Yuk nabung pagi ini! 💻✈️",
  "Gaji masuk, tabungan dulu baru belanja. Sudah alokasikan tabungan targetmu hari ini? 😉",
  "Konsistensi adalah kunci kebebasan finansial. Yuk isi celenganmu malam ini! 💰",
  "Setetes demi setetes lama-lama jadi bukit. Sudah menabung hari ini? 📈",
  "Uang yang ditabung hari ini adalah pilihan hidup yang kamu miliki besok. 🌟",
  "Jangan menabung apa yang tersisa, tapi belanjakan apa yang tersisa setelah menabung. 🎯",
  "Hemat hari ini, tenang hari esok. Jangan lupa celengan digitalmu! 📱",
  "Setiap rupiah membawa kamu lebih dekat ke target impianmu. Semangat! 🏁",
  "Membeli barang tidak perlu membuat kita kehilangan barang impian. Pikirkan targetmu! 🛍️",
  "Menabung adalah bentuk cinta terbaik pada diri sendiri di masa depan. 💖",
  "Yuk sisihkan sedikit uang jajarmu hari ini untuk target tabungan! 🪙",
  "Kemudahan finansial di masa depan dibeli dengan konsistensi menabung hari ini. 🔑",
  "Mulai dari nominal kecil, konsistensi adalah kunci. Semangat menabung! 💪",
  "Apakah target impianmu sudah dekat? Yuk tambah tabunganmu hari ini! 📈",
  "Tabungan hari ini adalah payung saat hujan badai di masa depan. Tetap konsisten! ☔",
  "Jangan biarkan keinginan sesaat merusak rencana masa depanmu. Ayo menabung! 🛡️",
  "Setiap koin yang kamu simpan adalah bibit pohon kemakmuran finansialmu. 🌳",
  "Yuk tengok target tabunganmu siang ini. Sudah bertambah berapa persen? 📊",
  "Nabung itu bukan menyiksa diri, tapi mengamankan kenyamanan di masa depan. 🔒",
  "Hari baru, kesempatan baru untuk berhemat dan menambah saldo target! ☀️",
  "Kesenangan belanja hanya sesaat, tapi kebanggaan mencapai target itu selamanya. 🏆",
  "Punya target impian tapi belum nabung hari ini? Yuk isi celengan sekarang! 🎯",
  "Ayo buat diri kamu di masa depan bangga dengan konsistensi menabung malam ini. 🌙",
  "Sedikit demi sedikit, saldo targetmu pasti penuh. Jangan menyerah ya! 🔋",
  "Uang kas aman, target jalan terus. Yuk catat alokasi tabunganmu hari ini! 🧾",
  "Sebelum checkout keranjang belanjaan, pastikan tabungan target sudah diisi ya! 🛒",
  "Investasikan masa depanmu lewat celengan digital. Aman, praktis, dan terkontrol! 🔒",
  "Yuk jadikan menabung sebagai kebiasaan keren setiap pagi! ☕",
  "Menabung memberi kita kebebasan untuk memilih jalan hidup. Ayo isi targetmu! 🗺️",
  "Jangan tunggu kaya baru menabung, tapi menabunglah agar kebutuhan masa depan terjamin. 💎",
];

export const triggerWelcomeNotification = async () => {
  try {
    // Request permission just in case
    await LocalNotifications.requestPermissions();
    
    await LocalNotifications.schedule({
      notifications: [{
        id: 99, // Unique ID for welcome notification
        title: "CelenganDigital 🎉",
        body: "Halo! Selamat aplikasi sudah ter-install, jangan lupa rutin nabung ya! 😉",
        schedule: { at: new Date(Date.now() + 1000) }, // Trigger 1 second later
        sound: 'default'
      }]
    });
    console.log('Successfully scheduled welcome notification');
  } catch (error) {
    console.error('Error triggering welcome notification:', error);
  }
};

export const scheduleDailyNotifications = async () => {
  try {
    // 1. Request native permission if not granted
    const check = await LocalNotifications.checkPermissions();
    if (check.display !== 'granted') {
      const request = await LocalNotifications.requestPermissions();
      if (request.display !== 'granted') {
        console.log('Notification permission not granted');
        return;
      }
    }

    // 2. Cancel all pending notifications to prevent duplicates (exclude welcome notification ID 99)
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.filter(n => n.id !== 99).map(n => ({ id: n.id }))
      });
    }

    // 3. Schedule 3 notifications per day for the next 7 days (Total 21 notifications)
    const notificationsToSchedule = [];
    const today = new Date();
    
    // Define the 3 daily slots requested
    const slots = [
      { id: 0, hours: 7, minutes: 0, label: "Pagi ☀️" },
      { id: 1, hours: 13, minutes: 30, label: "Siang 🌤️" },
      { id: 2, hours: 20, minutes: 0, label: "Malam 🌙" }
    ];

    let notificationId = 1;
    
    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      for (const slot of slots) {
        const scheduleDate = new Date(today);
        scheduleDate.setDate(today.getDate() + dayOffset);
        scheduleDate.setHours(slot.hours, slot.minutes, 0, 0);

        // Select a unique quote based on the day offset and slot ID
        const quoteIndex = (today.getDate() * 3 + dayOffset * 3 + slot.id) % MOTIVATIONAL_QUOTES.length;
        const quote = MOTIVATIONAL_QUOTES[quoteIndex];

        notificationsToSchedule.push({
          id: notificationId++,
          title: `Waktunya Nabung! ${slot.label}`,
          body: quote,
          schedule: { at: scheduleDate },
          sound: 'default'
        });
      }
    }

    await LocalNotifications.schedule({
      notifications: notificationsToSchedule
    });
    console.log('Successfully scheduled 21 notifications (3x daily for 7 days)');
  } catch (error) {
    console.error('Error scheduling notifications:', error);
  }
};
