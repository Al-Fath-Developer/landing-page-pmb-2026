# Manual Donation Input (Dashboard `/mieayam`)

- **Tanggal:** 2026-08-20
- **Status:** Approved
- **Scope:** Penambahan entri donasi manual oleh bendahara pada dashboard `/mieayam`. Tidak menyentuh payment flow Midtrans, webhook, QRIS, public donation page, maupun mekanisme donasi otomatis.

## 1. Tujuan

Bendahara dapat memasukkan transaksi donasi manual ke sistem karena integrasi otomatis (Midtrans) masih dalam proses approval. Transaksi manual:

- Tersimpan sebagai `status = paid` dan `payment_method = manual`.
- Langsung masuk ke KPI, daily summary, tabel transaksi, detail, dan export Excel.
- Mendukung upload bukti transfer opsional.
- Tidak memerlukan rekap terpisah oleh bendahara.

## 2. Field Transaksi (5 field per transaksi)

| Field | Wajib | Aturan |
|---|---|---|
| Nama | Opsional | Kosong → disimpan `"Donatur Anonim"`. Tidak menolak submission karena nama kosong. |
| Email | Opsional | Kosong → `NULL`. Valid format email jika diisi. |
| Tanggal | Wajib | Sumber `paid_at`. Input tanggal WIB (`Asia/Jakarta`) saja (tanpa jam). Jam mengikuti waktu input WIB oleh server. |
| Nominal | Wajib | Integer, mengikuti constraint `donations.amount` (`1000` s.d. `10.000.000`). Input memakai format Rupiah; dikirim sebagai integer. |
| Bukti Transfer | Opsional | Tidak ada file → `proof_storage_path = NULL`. Ada file → upload ke private bucket `donation-proofs` (JPG/PNG/WebP, maks 5MB). |

Tidak ada field `message`, `show_public_name`, atau `show_public_message` di UI.

## 3. Aturan Bisnis (Server)

Server menetapkan per transaksi:

- `status = "paid"`
- `payment_method = "manual"`
- `message = NULL`
- `show_public_name = (donor_name !== "Donatur Anonim")` → muncul di papan publik dengan nama bila diisi; anonim bila kosong.
- `show_public_message = false`
- `expires_at = paid_at` (kolom `NOT NULL`, tidak bermakna untuk donasi manual)
- `proof_storage_path = <path> | NULL`
- `order_id = M-IFEST26-<unix>s-<4char>` (konsisten dengan manual flow existing)

**Trigger `trg_after_donation_paid`** membuat row `public_donations` hanya pada transisi `pending → paid`. Maka pola insert: **insert `pending` → update `paid`** (dengan `paid_at` terisi). Tidak ada logika insert ganda.

## 4. API

`POST /api/mieayam/donations/manual` — **wajib session** (`getSession()`), server-side hanya.

Payload `multipart/form-data`:

```
meta = JSON.stringify([
  { donorName: string, donorEmail: string, date: "YYYY-MM-DD", amount: number, hasProof: boolean },
  ...
])
proof_0 = File    // hanya bila hasProof untuk indeks ke-0
proof_1 = File    // ...
```

Batas maksimal 50 transaksi per request.

Alur server:

1. Verifikasi session → 401 bila tidak valid.
2. Parse FormData: `meta` (JSON) + file `proof_<i>`.
3. Validasi seluruh transaksi (Zod) dan file (ukuran/format).
4. Generate `order_id` per transaksi.
5. Upload seluruh file bukti ke bucket `donation-proofs` (path `YYYY/MM/<orderId>/<uuid>.<ext>`). Kumpulkan `orderId → path`.
6. Insert seluruh row `pending` dalam satu `.insert([...])`.
7. Update seluruh row ke `paid` (`paid_at`) dalam satu `.update().in("order_id", ids).eq("status", "pending")`.
8. Return `{ success, count, totalAmount, orderIds }`.

### Payload sukses

```json
{
  "success": true,
  "count": 5,
  "totalAmount": 375000,
  "orderIds": ["M-IFEST26-..."]
}
```

## 5. Bulk Insertion & Atomicity

Semua-atau-tidak (atomic). Jika salah satu langkah gagal (upload, insert, update), seluruh transaksi dibatalkan:

- Hapus seluruh row yang terinsert: `delete().in("order_id", orderIds)`.
- Hapus seluruh file yang terupload: `storage.from("donation-proofs").remove(paths)`.

Duplicate `order_id` (probabilitas sangat rendah) ditangkap UNIQUE constraint dan masuk jalur rollback atomik.

## 6. UI

Modal Neo-Brutalist di tengah layar, mengikuti pola modal detail existing (`fixed inset-0 z-50 bg-[#121212]/80 backdrop-blur-sm`, container `max-w-3xl border-[4px] border-black bg-white shadow-shadow-large flex flex-col max-h-[90vh]`, header dengan tombol X, footer berbatas).

- Tombol **`+ INPUT DONASI MANUAL`** di area filter dashboard.
- Satu form transaksi saat modal dibuka; `+ TAMBAH TRANSAKSI` menambah form baru dalam modal yang sama; tombol trash menghapus form tertentu.
- Summary footer realtime: `N TRANSAKSI · TOTAL Rp X` (berubah saat nominal berubah / transaksi ditambah / dihapus).
- Tanggal default = hari ini (WIB).
- Nominal diketik dengan format Rupiah, di-parse ke integer.
- Submit: tombol disable + loading; cegah double submit; pada sukses tampilkan ringkasan, tutup modal, lalu `fetchDashboardData()` (refetch tanpa reload penuh).
- Konfirmasi sebelum menutup modal bila ada data belum disimpan; data input dipertahankan saat terjadi validation error.
- Body modal scroll internal (`overflow-y-auto`), halaman tidak ikut scroll.

## 7. Error Handling

| Failure | Tindakan |
|---|---|
| Session expired | 401; client meminta login ulang. |
| Upload gagal di tengah | `remove()` seluruh path yang sudah terupload. |
| Insert gagal | `remove()` seluruh path terupload. |
| Update ke paid gagal | `delete()` row terinsert + `remove()` seluruh file. |
| File >5MB / format salah / nominal invalid / email invalid / tanggal invalid | Error jelas per transaksi; tidak menyimpan sebagian. |

Cleanup best-effort dengan logging.

## 8. Database / Migration

**Tidak ada migration.** Kolom `payment_method`, `proof_storage_path`, enum status, bucket `donation-proofs`, dan trigger `public_donations` sudah tersedia.

## 9. File yang Dibuat / Dimodifikasi

**Dibuat:**
- `src/app/api/mieayam/donations/manual/route.ts`
- `src/lib/validation/dashboardManualDonation.ts`
- `src/components/mieayam/ManualDonationModal.tsx`

**Dimodifikasi:**
- `src/components/mieayam/Dashboard.tsx` (tombol + state modal + refetch)

**Tidak diubah:** route public `/api/donations/manual`, webhook Midtrans, list/detail/export dashboard, schema, RLS, komponen publik.

## 10. Testing Plan

- Single: 1 transaksi (tanpa email & tanpa bukti → `NULL`; nama kosong → "Donatur Anonim"; dengan bukti).
- Bulk: 2–5 transaksi, nominal berbeda, sebagian dengan bukti.
- Validasi: nominal kosong, tanggal kosong, email invalid, file >5MB, file format salah.
- Double submit.
- Reporting: masuk KPI, daily summary (`paid_at`), tabel, export Excel, detail + signed URL proof.
- Regresi: public donation page, webhook Midtrans, flow QRIS tidak berubah.

## 11. Acceptance Criteria

- Tombol `INPUT DONASI MANUAL` di dashboard.
- Modal di tengah; input 1 transaksi; `+ TAMBAH TRANSAKSI`; hapus per transaksi.
- Summary realtime.
- Validasi sebelum submit; feedback jelas per transaksi.
- `status=paid`, `payment_method=manual`, `paid_at` dari tanggal WIB, timezone benar.
- Upload bukti opsional; `proof_storage_path` benar; tanpa orphan file saat insert gagal.
- Muncul di dashboard, daily report, export Excel; detail bisa lihat bukti (signed URL).
- Auth `/mieayam` wajib; Midtrans flow & RLS tidak berubah.