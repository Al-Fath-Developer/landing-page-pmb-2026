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
      description: "Memulai perjalanan dengan membangun ruang aman bagi mahasiswa baru muslim untuk saling mengenal, berbagi, dan bertumbuh. Melalui sholat berjamaah, Ngabers, Coffee Break with Kating, serta Bukber dan Kajian Senin-Kamis, TULT dihidupkan sebagai ruang kebersamaan dan pusat dakwah sebelum perjalanan berlanjut ke MSU.",
      date: "Juli - Agustus 2026"
    },
    {
      step: "02",
      title: "SYIAR PELAYANAN",
      description: "Hadir di awal langkah mahasiswa baru untuk membantu proses check-in asrama, mengenalkan lingkungan kampus, menjawab kebutuhan informasi, sekaligus memperkenalkan rangkaian perjalanan PMB I-FEST. Sebuah bentuk pelayanan sederhana untuk memastikan setiap langkah pertama terasa lebih mudah.",
      date: "Agustus 2026"
    },
    {
      step: "03",
      title: "BINA ROHANI",
      description: "Menumbuhkan kebiasaan baik melalui pengalaman beribadah bersama. Bina Rohani hadir melalui mobilisasi Sholat Dzuhur bersama PKKMB Universitas serta Gerakan Sholat Subuh Berjamaah menjelang PKKMB, mengajak mahasiswa baru muslim untuk menjadikan ibadah sebagai bagian dari perjalanan mereka di lingkungan kampus.",
      date: "Agustus 2026"
    },
    {
      step: "04",
      title: "STUDENT FAIR",
      description: "Mengenal lebih dekat ruang untuk berkontribusi dan berkembang di Telkom University. Student Fair menjadi kesempatan bagi mahasiswa baru untuk menemukan komunitas, mengenal Al-Fath, serta melihat berbagai ruang yang dapat menjadi tempat mereka menyalurkan minat, bakat, dan semangat berorganisasi.",
      date: "Agustus 2026"
    },
    {
      step: "05",
      title: "I-FEST",
      subtitle: "Islamic Festival",
      description: "Menutup rangkaian PMB dengan sebuah ruang untuk berhenti sejenak, menemukan perspektif baru, dan memulai perjalanan perkuliahan dengan semangat yang lebih berarti. Melalui Talkshow Alumni, Talkshow Wajihah, dan tayangan drama inspiratif, I-FEST mengajak mahasiswa baru untuk menemukan inspirasi, mengenal lebih banyak ruang untuk bertumbuh, dan menyadari bahwa mereka tidak berjalan sendirian.",
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
