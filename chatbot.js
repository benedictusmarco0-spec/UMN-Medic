

      const CHATBOT_STORAGE_KEY = "umnMedicChatbotHistoryV1";
      const CHATBOT_OPEN_KEY = "umnMedicChatbotOpenV1";
      let chatbotMessages = [];

      function loadChatbotMessages() {
        try {
          const saved = JSON.parse(
            localStorage.getItem(CHATBOT_STORAGE_KEY) || "[]",
          );
          chatbotMessages =
            Array.isArray(saved) && saved.length
              ? saved
              : [
                  {
                    role: "bot",
                    text: "Halo, saya chatbot UMN Medic. Saya bisa bantu info pendaftaran pasien, jam layanan, kontak, rujukan, rekam medis, obat, dan kritik saran.",
                  },
                ];
        } catch (error) {
          chatbotMessages = [
            {
              role: "bot",
              text: "Halo, saya chatbot UMN Medic. Saya bisa bantu info pendaftaran pasien, jam layanan, kontak, rujukan, rekam medis, obat, dan kritik saran.",
            },
          ];
        }
      }

      function saveChatbotMessages() {
        try {
          localStorage.setItem(
            CHATBOT_STORAGE_KEY,
            JSON.stringify(chatbotMessages.slice(-40)),
          );
        } catch (error) {}
      }

      function chatbotMedicineStockInfo() {
        if (!state.medicines.length) {
          return "Data obat belum tersedia. Pastikan database sudah aktif dan data inventori obat sudah masuk.";
        }
        const list = [...state.medicines]
          .sort((a, b) => String(a.name).localeCompare(String(b.name), "id"))
          .map((m, index) => `${index + 1}. ${m.name}: ${m.stock} stok`);
        return `Jumlah obat yang tersedia saat ini:\n${list.join("\n")}`;
      }

      function chatbotReply(message) {
        const text = normalizeSearch(message);
        if (!text) return "Silakan tulis pertanyaan dulu.";
        if (
          /darurat|gawat|pingsan|sesak|nyeri dada|pendarahan|kejang|kecelakaan|emergency/.test(
            text,
          )
        ) {
          return "Jika kondisi darurat, segera datang ke klinik/IGD terdekat atau hubungi petugas kampus. Untuk sistem ini, admin dapat memberi triage Merah agar pasien diprioritaskan.";
        }
        if (
          /daftar|pendaftaran|registrasi|buat akun|akun|login|masuk/.test(text)
        ) {
          return "Cara daftar pasien: buka menu Masuk Sistem, pilih daftar pasien, isi nama, NIM/NIK, kontak, lalu login. Setelah itu pasien dapat mengisi keluhan kesehatan.";
        }
        if (/keluhan|admisi|antri|antrian|periksa|pemeriksaan/.test(text)) {
          return "Untuk membuat admisi, pasien login lalu isi form keluhan. Admin akan melihat data di dashboard, menentukan triage, memilih ranjang bila perlu, lalu menyimpan pemeriksaan.";
        }
        if (/jam|buka|layanan|operasional|hari/.test(text)) {
          return "Jam layanan UMN Medic: hari kerja 08.00–17.00 dan Sabtu 08.00–11.00.";
        }
        if (/kontak|telepon|email|alamat|lokasi/.test(text)) {
          return "Kontak UMN Medic: email medic@umn.ac.id, lokasi area kampus UMN di Gedung A. Jam operasional hari kerja 08.00–17.00 dan Sabtu 08.00–11.00.";
        }
        if (/saran|kritik|masukan|feedback|komentar/.test(text)) {
          return "Kritik dan saran bisa dikirim melalui menu Saran. Pasien perlu login dan memilih layanan yang sudah selesai agar masukan tercatat dengan rapi.";
        }
        if (/rujuk|rujukan|rumah sakit|rs|klinik luar/.test(text)) {
          return "Rujukan eksternal dibuat oleh admin dari dashboard. Admin mengisi RS tujuan, alasan rujukan, diagnosis, dan petugas penanggung jawab, lalu bisa mencetak surat rujukan.";
        }
        if (
          /obat|stok|inventori|kedaluwarsa|expired|jumlah obat|daftar obat/.test(
            text,
          )
        ) {
          return chatbotMedicineStockInfo();
        }
        if (/rekam medis|riwayat|diagnosis|catatan medis/.test(text)) {
          return "Rekam medis dibuat setelah pemeriksaan. Pasien hanya dapat melihat riwayat miliknya sendiri, sedangkan admin mengelola data pemeriksaan melalui dashboard.";
        }
        if (/admin|dashboard|triage|ranjang|bed/.test(text)) {
          return "Dashboard admin berisi antrian admisi, triage, ranjang laki-laki/perempuan, inventori obat, rujukan, laporan, dan data kritik saran.";
        }
        if (/search|cari|pencarian|bar/.test(text)) {
          return "Search bar sudah diperbaiki agar bisa mengetik atau paste teks panjang. Gunakan kata kunci nama, NIM/NIK, kategori, atau isi keluhan.";
        }
        return "Saya belum menemukan jawaban yang pas. Coba pakai kata kunci: daftar pasien, jam layanan, kontak, keluhan, rujukan, obat, rekam medis, kritik saran, atau admin.";
      }

      function renderChatbot() {
        const root = document.getElementById("chatbot-root");
        if (!root) return;
        const isOpen = localStorage.getItem(CHATBOT_OPEN_KEY) === "1";
        root.innerHTML = `
        <div class="chatbot-widget ${isOpen ? "open" : ""}" id="chatbot-widget">
          <div class="chatbot-panel" role="dialog" aria-label="Chatbot UMN Medic">
            <div class="chatbot-head">
              <div class="chatbot-title">
                <span class="chatbot-avatar">💬</span>
                <span>Chatbot UMN Medic<small>Asisten bantuan cepat</small></span>
              </div>
              <button class="chatbot-close" type="button" onclick="toggleChatbot(false)" aria-label="Tutup chatbot">×</button>
            </div>
            <div class="chatbot-messages" id="chatbot-messages">
              ${chatbotMessages.map((msg) => `<div class="chatbot-msg ${msg.role === "user" ? "user" : "bot"}">${escapeHtml(msg.text)}</div>`).join("")}
            </div>
            <div>
              <div class="chatbot-quick">
                <button type="button" class="chatbot-chip" onclick="sendChatbotQuick('Cara daftar pasien')">Cara daftar</button>
                <button type="button" class="chatbot-chip" onclick="sendChatbotQuick('Jam layanan')">Jam layanan</button>
                <button type="button" class="chatbot-chip" onclick="sendChatbotQuick('Kontak klinik')">Kontak</button>
                <button type="button" class="chatbot-chip" onclick="sendChatbotQuick('Rujukan eksternal')">Rujukan</button>
                <button type="button" class="chatbot-chip" onclick="sendChatbotQuick('Jumlah stok obat')">Stok obat</button>
              </div>
              <form class="chatbot-form" onsubmit="sendChatbotMessage(event)">
                <textarea id="chatbot-input" class="chatbot-input" rows="1" placeholder="Tulis pertanyaan..." onkeydown="chatbotKeydown(event)"></textarea>
                <button class="chatbot-send" type="submit">Kirim</button>
                <div class="chatbot-note">Enter untuk kirim, Shift+Enter untuk baris baru.</div>
              </form>
            </div>
          </div>
          <button class="chatbot-toggle" type="button" onclick="toggleChatbot()" aria-label="Buka chatbot">💬</button>
        </div>
      `;
        scrollChatbotToBottom();
      }

      function toggleChatbot(force) {
        const widget = document.getElementById("chatbot-widget");
        if (!widget) return;
        const shouldOpen =
          typeof force === "boolean"
            ? force
            : !widget.classList.contains("open");
        widget.classList.toggle("open", shouldOpen);
        try {
          localStorage.setItem(CHATBOT_OPEN_KEY, shouldOpen ? "1" : "0");
        } catch (error) {}
        if (shouldOpen) {
          setTimeout(() => {
            document.getElementById("chatbot-input")?.focus();
            scrollChatbotToBottom();
          }, 40);
        }
      }

      function scrollChatbotToBottom() {
        const box = document.getElementById("chatbot-messages");
        if (box) box.scrollTop = box.scrollHeight;
      }

      function pushChatbotMessage(role, text) {
        chatbotMessages.push({ role, text });
        chatbotMessages = chatbotMessages.slice(-40);
        saveChatbotMessages();
        renderChatbot();
      }

      function sendChatbotQuick(text) {
        pushChatbotMessage("user", text);
        setTimeout(() => pushChatbotMessage("bot", chatbotReply(text)), 180);
      }

      function sendChatbotMessage(event) {
        event.preventDefault();
        const input = document.getElementById("chatbot-input");
        const text = input?.value.trim() || "";
        if (!text) return;
        if (input) input.value = "";
        pushChatbotMessage("user", text);
        setTimeout(() => pushChatbotMessage("bot", chatbotReply(text)), 180);
      }

      function chatbotKeydown(event) {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          sendChatbotMessage(event);
        }
      }

      function initChatbot() {
        loadChatbotMessages();
        renderChatbot();
      }

      initChatbot();
