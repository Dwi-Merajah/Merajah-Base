# 🚀 @merajah/base

**@merajah/base** adalah framework WhatsApp Bot berbasis **CommonJS (CJS)** yang menggunakan library **@merajah/baileys**. Proyek ini mengedepankan arsitektur **plugin modular**, **hot-reload**, dan sistem **event handler** yang terstruktur dengan rapi.

Dirancang khusus untuk developer yang menginginkan bot dengan performa tinggi, fleksibilitas tinggi, dan kode yang mudah dikelola.

---

## ✨ Fitur Utama

* **⚡ Engine Modern**: Menggunakan versi optimasi dari `@merajah/baileys`.
* **🧩 Plugin System**: Arsitektur modular untuk Command & Event secara terpisah.
* **🔥 Hot Reload**: Perubahan pada file plugin akan langsung diterapkan tanpa perlu restart bot (via *Chokidar*).
* **🛠️ Handler Terpusat**: Alur pesan yang terkontrol dan tervalidasi.
* **📦 State Management**: Dilengkapi dengan cache store untuk group dan kontak.
* **🛡️ Akses Kontrol**: Validasi otomatis untuk Owner, Admin, Group, dan Private chat.
* **💻 Developer Friendly**: Dilengkapi *Eval*, *Exec (Shell)*, dan utilitas `Func` yang lengkap.

---

## 📦 Persyaratan Sistem

* **Node.js**: Versi 20 atau lebih tinggi.
* **WhatsApp Account**: Akun aktif untuk pairing via QR atau Kode.

---

## 📥 Panduan Instalasi

```bash
# Clone repository
git clone https://github.com/Dwi-Merajah/merajah-base.git

# Masuk ke direktori
cd merajah-base

# Install dependensi
npm install

# Jalankan bot
npm start

```

---

## 📂 Struktur Proyek

```text
.
├── index.js           # Entry point aplikasi
├── handler.js         # Pengelola alur pesan & command
├── config.js          # Konfigurasi global & kredensial
├── meta/              # Inti sistem (Internal)
│   ├── plugins.js     # Loader & Hot-reload logic
│   ├── function.js    # Global utility (Func)
│   └── extra.js       # Socket extender & store logic
├── plugins/           # Folder tempat menyimpan fitur
│   ├── menu.js        # Contoh plugin command
│   └── eval.js        # Alat bantu debug (Owner only)
└── sessions/          # Data autentikasi (Auto-generated)

```

---

## ⚙️ Konfigurasi Dasar

Edit file `config.js` untuk mengatur identitas bot:

```javascript
global.Func = require("./meta/function")
global.owner = ["6285133663664"]

global.status = Object.freeze({
   fail: Func.Styles('Failed to process the request.'),
   wait: Func.Styles('Please wait, processing...'),
   owner: Func.Styles('This command only for owner.'),
   group: Func.Styles('This command will only work in groups.'),
   botAdmin: Func.Styles('This command will work when I become an admin.'),
   admin: Func.Styles('This command only for group admin.'),
   private: Func.Styles('Use this command in private chat.')
})
```

---

## 🧠 Sistem Plugin

Sistem ini membedakan plugin menjadi dua kategori: **Command** (berdasarkan prefix) dan **Event** (dijalankan setiap ada pesan masuk).

### 🧩 Format Boilerplate Plugin (Wajib)

```javascript
module.exports = {
  meta: {
    name: 'plugin-name',      // Nama unik plugin
    command: ['help', 'menu'],// Trigger (kosongkan jika 'events: true')
    tag: ['main'],            // Kategori untuk menu
    owner: false,             // Akses owner saja?
    admin: false,             // Akses admin group?
    botadmin: false,          // Bot harus admin?
    group: false,             // Khusus grup?
    private: false,           // Khusus chat pribadi?
    events: false             // Set 'true' jika ingin jalan tanpa prefix
  },

  async execute(m, ctx) {
    // Tulis logika Anda di sini
    // m = message object, ctx = context helper
  }
}

```

---

## 🧪 Alat Debugging (Owner Only)

Gunakan prefix berikut langsung di WhatsApp untuk eksekusi cepat:

| Prefix | Fungsi | Contoh |
| --- | --- | --- |
| `=>` | Return Expression | `=> 1 + 1` |
| `>` | Async Eval | `> await sock.sendMessage(...)` |
| `$` | Shell Command | `$ ls` atau `$ screen -list` |

---

## 🗂️ Context (ctx) yang Tersedia

Di dalam fungsi `execute(m, ctx)`, Anda dapat mengakses objek berikut secara instan:

* `sock`: Instance koneksi WhatsApp.
* `body`: Isi teks pesan secara utuh.
* `prefix` & `command`: Prefix dan command yang digunakan.
* `args` & `text`: Argumen dalam bentuk array atau string mentah.
* `isROwner`, `isAdmin`, `isBotAdmin`: Boolean status akses user.
* `Func`: Library utilitas bawaan (Global helpers).

---

## 👤 Author & Lisensi

* **Developer**: Dwi Merajah
* **Base Framework**: `@merajah/base`
* **Engine**: `@merajah/baileys`
* **Group**: [GROUP](https://chat.whatsapp.com/KcFAwyGTo8RBhPv03LvoHZ?mode=wwt)
* **WhatsApp** [WA](https://wa.me/6285133663664)
* **Lisensi**: [MIT](https://opensource.org/licenses/MIT) - Bebas digunakan dan dikembangkan.

---
