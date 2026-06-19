import { LocalNotifications } from '@capacitor/local-notifications';

// List of daily motivational money saving quotes in Indonesian
const MOTIVATIONAL_QUOTES = [
  "Setetes demi setetes, lama-lama jadi bukit. Yuk alokasikan tabunganmu hari ini! 💰",
  "Disiplin hari ini adalah kebebasan finansial di masa depan. Sudah menabung? 😉",
  "Uang yang kamu tabung hari ini adalah pilihan hidup yang kamu miliki besok. 🌟",
  "Jangan menabung apa yang tersisa, tapi habiskan apa yang tersisa setelah menabung. 🎯",
  "Mimpi besar dimulai dari tabungan kecil. Yuk wujudkan impianmu! 💻✈️",
  "Kemakmuran bukan tentang seberapa banyak uang yang dihasilkan, tapi yang disimpan. 🛡️",
  "Hemat hari ini, tenang hari esok. Jangan lupa isi celengan digitalmu! 📱",
  "Setiap rupiah yang kamu tabung membawa kamu selangkah lebih dekat ke target impian. 🏁",
  "Membeli barang yang tidak perlu hari ini membuat kita kehilangan barang impian besok. 🛍️",
  "Menabung adalah bentuk cinta terbaik pada diri sendiri di masa depan. 💖",
  "Yuk sisihkan sedikit uang jajarmu hari ini untuk tabungan target! 🪙",
  "Kemudahan finansial di masa depan dibeli dengan konsistensi menabung hari ini. 🔑",
  "Mulai dari nominal kecil, konsistensi adalah kunci. Semangat menabung! 💪",
  "Apakah target impianmu sudah dekat? Yuk tambah tabunganmu hari ini! 📈",
  "Tabungan hari ini adalah payung saat hujan badai di masa depan. Tetap konsisten! ☔",
];

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

    // 2. Cancel all pending notifications to prevent duplicates
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map(n => ({ id: n.id }))
      });
    }

    // 3. Schedule daily notifications for the next 7 days
    const notificationsToSchedule = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const scheduleDate = new Date(today);
      scheduleDate.setDate(today.getDate() + i);
      // Schedule at 20:00 (8 PM) every day
      scheduleDate.setHours(20, 0, 0, 0);

      // Select quote based on the day index to ensure variety
      const quoteIndex = (today.getDate() + i) % MOTIVATIONAL_QUOTES.length;
      const quote = MOTIVATIONAL_QUOTES[quoteIndex];

      notificationsToSchedule.push({
        id: i, // Notification ID
        title: "Waktunya Nabung! 🪙",
        body: quote,
        schedule: { at: scheduleDate },
        sound: 'default'
      });
    }

    await LocalNotifications.schedule({
      notifications: notificationsToSchedule
    });
    console.log('Successfully scheduled 7 daily motivational notifications');
  } catch (error) {
    console.error('Error scheduling notifications:', error);
  }
};
