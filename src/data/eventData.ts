/**
 * @file    src/data/eventData.ts
 * @brief   Centralized configuration data for PMB I-FEST 2026 event details and mock statistics
 * @author  ray
 * @created 2026-08-07
 * @todo    - Replace campaignStats with real Supabase query integration
 */

export interface EventHighlight {
  title: string;
  value: string;
  description: string;
}

export interface TimelineItem {
  step: string;
  title: string;
  subtitle?: string;
  description: string;
  date: string;
}

export interface MascotInfo {
  name: string;
  imagePath: string;
  philosophy: string;
}

export interface CampaignStats {
  targetAmount: number;
}

export interface EventData {
  title: string;
  organizer: string;
  university: string;
  themeName: string;
  tagline: string;
  startDate: string;
  venue: string;
  description: string;
  timeline: TimelineItem[];
  mascots: {
    arjuna: MascotInfo;
    srikandi: MascotInfo;
  };
  campaignStats: CampaignStats;
}

export const eventData: EventData = {
  title: "PMB I-FEST 2026",
  organizer: "LDK Al-Fath",
  university: "Telkom University",
  themeName: "Harmoni Nusantara",
  tagline: "Tumbuh Bersama, Mengukir Karya.",
  startDate: "[ TANGGAL ACARA ]",
  venue: "[ LOKASI ACARA ]",
  description: "PMB I-FEST 2026 hadir mendampingi langkah awalmu menyusuri dunia kampus yang sarat potensi. Temukan keseimbangan akademik, sosial, dan spiritual dalam ekosistem islami yang suportif dan inklusif.",
  timeline: [
    {
      step: "01",
      title: "PRA-EVENT",
      subtitle: "Qomarul 'Ulum",
      description: "Langkah awal mengenal Masjid TULT sebagai ruang aman dan pusat spiritual mahasiswa baru selama masa adaptasi. Dikemas hangat melalui diskusi interaktif, sharing alumni, dan kebersamaan bersama Al-Qur'an.",
      date: "Juli - Agustus 2026"
    },
    {
      step: "02",
      title: "SYIAR PELAYANAN",
      description: "Pusat informasi dan pelayanan bagi mahasiswa baru untuk membantu mengenal lingkungan kampus, menjawab kebutuhan informasi, serta menemani proses adaptasi dengan pelayanan yang tulus.",
      date: "Agustus 2026"
    },
    {
      step: "03",
      title: "BINA ROHANI",
      description: "[ DESKRIPSI BINA ROHANI — MENUNGGU COPY RESMI ]",
      date: "Agustus 2026"
    },
    {
      step: "04",
      title: "STUDENT FAIR",
      description: "Ruang untuk mengenal lebih dekat berbagai lembaga dan komunitas islami di Telkom University. Temukan ruang bertumbuh, belajar, dan mengembangkan minat serta bakat bersama.",
      date: "Agustus 2026"
    },
    {
      step: "05",
      title: "I-FEST",
      subtitle: "Islamic Festival",
      description: "Puncak perjalanan menyambut mahasiswa baru melalui Teater Inspiratif, Talkshow Alumni, dan Expo Wajihah. Sebuah ruang untuk menemukan inspirasi, membangun perspektif, dan memulai langkah baru.",
      date: "September 2026"
    }
  ],
  mascots: {
    arjuna: {
      name: "Arjuna",
      imagePath: "/ARJUNA.webp",
      philosophy: "Merepresentasikan ketangguhan dalam belajar, sikap ramah dalam berinteraksi, keterbukaan menghadapi hal baru, dan keberanian melangkah menghadapi tantangan."
    },
    srikandi: {
      name: "Srikandi",
      imagePath: "/SRIKANDI.webp",
      philosophy: "Merepresentasikan ketulusan, rasa empati yang mendalam, sifat meneduhkan, serta menghadirkan rasa aman dan kenyamanan dalam perjalanan bersama."
    }
  },
  campaignStats: {
    targetAmount: 28000000
  }
};
