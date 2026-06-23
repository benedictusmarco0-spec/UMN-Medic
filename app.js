const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const illnessCategories = [
        {
          id: "batuk-flu",
          label: "Batuk / Flu",
          examples: "batuk, pilek, hidung tersumbat, sakit tenggorokan",
        },
        {
          id: "pusing-demam",
          label: "Pusing / Demam",
          examples: "sakit kepala, demam, meriang, badan lemas",
        },
        {
          id: "maag-mual",
          label: "Maag / Mual",
          examples: "nyeri lambung, mual, muntah ringan, begah",
        },
        {
          id: "nyeri-mens",
          label: "Nyeri Menstruasi",
          examples: "kram perut, nyeri haid, tidak nyaman saat menstruasi",
        },
        {
          id: "diare",
          label: "Diare",
          examples: "BAB cair, dehidrasi ringan, sakit perut",
        },
        {
          id: "alergi-gatal",
          label: "Alergi / Gatal",
          examples: "ruam, gatal, biduran ringan",
        },
        {
          id: "luka-ringan",
          label: "Luka Ringan",
          examples: "lecet, luka kecil, iritasi kulit",
        },
        {
          id: "kelelahan-stres",
          label: "Kelelahan / Stres",
          examples: "kurang tidur, lemas, cemas ringan",
        },
        {
          id: "lainnya",
          label: "Lainnya",
          examples: "keluhan lain yang perlu dicatat manual",
        },
      ];

      const state = {
        page: "landing",
        currentUser: null,
        activeAdminTab: "admission",
        selectedAdmissionId: "",
        error: "",
        success: "",
        mobileOpen: false,
        isLoading: true,
        users: [],
        admissions: [],
        medicines: [],
        beds: [],
        feedbacks: [],
        data: {
          patient: {
            admissions: [],
            feedbacks: [],
          },
          admin: {
            summary: null,
            inventory: {
              medicines: [],
              beds: [],
            },
            queue: {
              items: [],
              meta: null,
            },
            records: {
              items: [],
              meta: null,
              selectedId: "",
              detail: null,
            },
            feedback: {
              items: [],
              meta: null,
            },
            reports: {
              summary: null,
            },
          },
        },
        summary: {
          activeAdmissions: 0,
          completedAdmissions: 0,
          totalAdmissions: 0,
          totalBeds: 0,
          occupiedBeds: 0,
          availableMaleBeds: 0,
          availableFemaleBeds: 0,
          lowStock: 0,
          expiringMedicines: 0,
          totalMedicines: 0,
        },
        adminAdmissions: [],
        adminAdmissionMeta: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 1,
          query: "",
        },
        recordAdmissions: [],
        recordMeta: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 1,
          query: "",
        },
        selectedAdmissionDetail: null,
        feedbackList: [],
        feedbackMeta: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 1,
          query: "",
        },
        csrfToken: "",
        requestId: "",
        security: {
          csrfEnabled: false,
          requestId: "",
          sessionTimeoutMinutes: 30,
        },
        reportSummary: {
          totalAdmissions: 0,
          completedAdmissions: 0,
          triages: [],
          categories: [],
          medicineUsage: {},
        },
      };
      const defaultAdminSummary = {
        activeAdmissions: 0,
        completedAdmissions: 0,
        totalAdmissions: 0,
        totalBeds: 0,
        occupiedBeds: 0,
        availableMaleBeds: 0,
        availableFemaleBeds: 0,
        lowStock: 0,
        expiringMedicines: 0,
        totalMedicines: 0,
      };

      const defaultReportSummary = {
        totalAdmissions: 0,
        completedAdmissions: 0,
        triages: [],
        categories: [],
        medicineUsage: {},
      };

      function getCurrentUser() {
        return state.currentUser;
      }

      function isAdminUser() {
        return getCurrentUser()?.role === "admin";
      }

      function isPatientUser() {
        return getCurrentUser()?.role === "pasien";
      }

      function getPatientAdmissions() {
        return state.data?.patient?.admissions || [];
      }

      function getPatientFeedbacks() {
        return state.data?.patient?.feedbacks || [];
      }

      function getAdminSummaryState() {
        return state.data?.admin?.summary || state.summary || defaultAdminSummary;
      }

      function getInventorySnapshot() {
        return state.data?.admin?.inventory || {
          medicines: state.medicines || [],
          beds: state.beds || [],
        };
      }

      function getAdminQueueState() {
        return state.data?.admin?.queue || {
          items: state.adminAdmissions || [],
          meta: state.adminAdmissionMeta || { page: 1, limit: 10, total: 0, pages: 1, query: "" },
        };
      }

      function getAdminRecordsState() {
        return state.data?.admin?.records || {
          items: state.recordAdmissions || [],
          meta: state.recordMeta || { page: 1, limit: 10, total: 0, pages: 1, query: "" },
          selectedId: state.selectedAdmissionId || "",
          detail: state.selectedAdmissionDetail || null,
        };
      }

      function getAdminFeedbackState() {
        return state.data?.admin?.feedback || {
          items: state.feedbackList || [],
          meta: state.feedbackMeta || { page: 1, limit: 10, total: 0, pages: 1, query: "" },
        };
      }

      function getReportSummaryState() {
        return state.data?.admin?.reports?.summary || state.reportSummary || defaultReportSummary;
      }

      function resetAdminDataStore() {
        state.data.admin = {
          summary: { ...defaultAdminSummary },
          inventory: {
            medicines: state.medicines || [],
            beds: state.beds || [],
          },
          queue: {
            items: [],
            meta: { ...state.adminAdmissionMeta },
          },
          records: {
            items: [],
            meta: { ...state.recordMeta },
            selectedId: "",
            detail: null,
          },
          feedback: {
            items: [],
            meta: { ...state.feedbackMeta },
          },
          reports: {
            summary: { ...defaultReportSummary },
          },
        };
      }

      function resetPatientDataStore() {
        state.data.patient = {
          admissions: [],
          feedbacks: [],
        };
      }



      const API_URL = "/api";
      const UMN_LOGO_SRC = "data:image/png;base64,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";

      async function apiRequest(action, payload = {}) {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            ...(state.csrfToken ? { "X-CSRF-Token": state.csrfToken } : {}),
          },
          credentials: "same-origin",
          cache: "no-store",
          body: JSON.stringify({ action, ...payload }),
        });
        let result;
        try {
          result = await response.json();
        } catch (error) {
          throw new Error(
            "Respons server tidak valid. Pastikan aplikasi sudah terhubung ke API Vercel dan database PostgreSQL.",
          );
        }
        if (result.csrfToken) state.csrfToken = result.csrfToken;
        if (result.requestId) state.requestId = result.requestId;
        if (!result.ok)
          throw new Error(result.error || "Terjadi kesalahan pada server.");
        return result;
      }

      
function applyServerData(data) {
        state.currentUser = data.currentUser || null;
        state.users = data.users || [];
        state.admissions = data.admissions || [];
        state.medicines = data.medicines || [];
        state.beds = data.beds || [];
        state.feedbacks = data.feedbacks || [];
        state.summary = {
          ...defaultAdminSummary,
          ...(data.summary || {}),
        };
        state.security = {
          ...state.security,
          ...(data.security || {}),
        };
        if (data.csrfToken) state.csrfToken = data.csrfToken;
        if (data.security?.requestId) state.requestId = data.security.requestId;

        state.data.admin.summary = { ...state.summary };
        state.data.admin.inventory = {
          medicines: state.medicines || [],
          beds: state.beds || [],
        };

        if (isPatientUser()) {
          state.data.patient = {
            admissions: state.admissions || [],
            feedbacks: state.feedbacks || [],
          };
          resetAdminDataStore();
        } else {
          resetPatientDataStore();
          if (!isAdminUser()) {
            resetAdminDataStore();
          }
        }

        const patientAdmissions = getPatientAdmissions();
        const activeAdmission = patientAdmissions.find(
          (a) => a.status !== "Selesai",
        );

        if (
          !state.selectedAdmissionId &&
          (activeAdmission || patientAdmissions[0])
        ) {
          state.selectedAdmissionId = (
            activeAdmission || patientAdmissions[0]
          ).id;
        }
        if (
          state.selectedAdmissionId &&
          !patientAdmissions.some((a) => a.id === state.selectedAdmissionId)
        ) {
          state.selectedAdmissionId =
            (activeAdmission || patientAdmissions[0])?.id || "";
        }
      }
      async function loadData() {
        state.isLoading = true;
        render();
        try {
          const result = await apiRequest("bootstrap");
          applyServerData(result.data);
          state.isLoading = false;
          state.error = "";

          if (state.currentUser?.role === "admin") {
            await hydrateAdminPage(true);
          }
        } catch (error) {
          state.isLoading = false;
          state.error = error.message;
        }
        render();
      }
      async function refreshData() {
        const result = await apiRequest("bootstrap");
        applyServerData(result.data);
        if (state.currentUser?.role === "admin") {
          await loadAdminSummary();
        }
      }

      async function runAction(action, payload, successMessage) {
        try {
          const result = await apiRequest(action, payload);
          if (result.data) applyServerData(result.data);
          else await refreshData();

          if (state.currentUser?.role === "admin") {
            await syncAdminAfterMutation(action);
          }

          state.error = "";
          state.success = successMessage || "Data berhasil disimpan.";
          render();
          setTimeout(() => {
            state.success = "";
            render();
          }, 1800);
        } catch (error) {
          state.error = error.message;
          render();
        }
      }

      
async function loadAdminSummary() {
        const result = await apiRequest("getAdminSummary");
        state.summary = {
          ...defaultAdminSummary,
          ...(result.summary || {}),
        };
        state.data.admin.summary = { ...state.summary };
      }

      
async function loadAdmissionQueue(resetPage = false) {
        if (resetPage) state.adminAdmissionMeta.page = 1;
        const result = await apiRequest("listAdmissions", {
          page: state.adminAdmissionMeta.page,
          limit: state.adminAdmissionMeta.limit,
          query: state.adminAdmissionMeta.query,
          includeCompleted: false,
        });
        state.adminAdmissions = result.items || [];
        state.adminAdmissionMeta = {
          ...state.adminAdmissionMeta,
          ...(result.meta || {}),
          query: state.adminAdmissionMeta.query,
        };
        state.data.admin.queue = {
          items: state.adminAdmissions,
          meta: { ...state.adminAdmissionMeta },
        };
      }

      
async function loadRecordList(resetPage = false) {
        if (resetPage) state.recordMeta.page = 1;
        const result = await apiRequest("listAdmissions", {
          page: state.recordMeta.page,
          limit: state.recordMeta.limit,
          query: state.recordMeta.query,
          includeCompleted: true,
        });
        state.recordAdmissions = result.items || [];
        state.recordMeta = {
          ...state.recordMeta,
          ...(result.meta || {}),
          query: state.recordMeta.query,
        };

        const fallbackId =
          state.selectedAdmissionId ||
          state.recordAdmissions[0]?.id ||
          "";
        if (fallbackId) {
          state.selectedAdmissionId = fallbackId;
          await loadSelectedAdmissionDetail(fallbackId);
        } else {
          state.selectedAdmissionDetail = null;
        }

        state.data.admin.records = {
          items: state.recordAdmissions,
          meta: { ...state.recordMeta },
          selectedId: state.selectedAdmissionId,
          detail: state.selectedAdmissionDetail,
        };
      }

      
async function loadSelectedAdmissionDetail(id) {
        if (!id) {
          state.selectedAdmissionDetail = null;
          state.data.admin.records.detail = null;
          return;
        }
        const result = await apiRequest("getAdmissionDetail", { id });
        state.selectedAdmissionDetail = result.item || null;
        state.data.admin.records.detail = state.selectedAdmissionDetail;
        if (state.selectedAdmissionDetail) {
          window.__medFilter =
            window.__medFilter ||
            state.selectedAdmissionDetail.illnessCategory ||
            "semua";
        }
      }

      
async function loadFeedbackPage(resetPage = false) {
        if (resetPage) state.feedbackMeta.page = 1;
        const result = await apiRequest("listFeedbacks", {
          page: state.feedbackMeta.page,
          limit: state.feedbackMeta.limit,
          query: state.feedbackMeta.query,
        });
        state.feedbackList = result.items || [];
        state.feedbackMeta = {
          ...state.feedbackMeta,
          ...(result.meta || {}),
          query: state.feedbackMeta.query,
        };
        state.data.admin.feedback = {
          items: state.feedbackList,
          meta: { ...state.feedbackMeta },
        };
      }

      
async function loadReportSummary() {
        const result = await apiRequest("getReportSummary");
        state.reportSummary = result.summary || { ...defaultReportSummary };
        state.data.admin.reports.summary = {
          ...defaultReportSummary,
          ...(state.reportSummary || {}),
        };
      }

      async function loadAdminTabData(tab, { resetPage = false } = {}) {
        if (tab === "admission") {
          await loadAdmissionQueue(resetPage);
          return;
        }
        if (tab === "records") {
          await loadRecordList(resetPage);
          return;
        }
        if (tab === "feedback") {
          await loadFeedbackPage(resetPage);
          return;
        }
        if (tab === "reports") {
          await loadReportSummary();
        }
      }

      async function hydrateAdminPage(resetPage = false) {
        await loadAdminSummary();
        await loadAdminTabData(state.activeAdminTab, { resetPage });
      }

      async function syncAdminAfterMutation(action) {
        await loadAdminSummary();

        if (state.activeAdminTab === "reports") {
          await loadReportSummary();
          return;
        }

        if (
          [
            "updateAdmission",
            "completeAdmission",
            "assignBed",
            "releaseBed",
            "deleteAdmission",
          ].includes(action)
        ) {
          await loadAdmissionQueue(false);
        }

        if (
          ["saveRecord", "giveMedicine", "saveReferral", "completeAdmission"].includes(
            action,
          ) ||
          state.activeAdminTab === "records"
        ) {
          await loadRecordList(false);
        }

        if (state.activeAdminTab === "feedback") {
          await loadFeedbackPage(false);
        }
      }

      function setListPage(type, page) {
        const nextPage = Math.max(1, Number(page || 1));
        if (type === "admission") {
          state.adminAdmissionMeta.page = nextPage;
          loadAdmissionQueue(false).then(render).catch((error) => {
            state.error = error.message;
            render();
          });
          return;
        }
        if (type === "records") {
          state.recordMeta.page = nextPage;
          loadRecordList(false).then(render).catch((error) => {
            state.error = error.message;
            render();
          });
          return;
        }
        if (type === "feedback") {
          state.feedbackMeta.page = nextPage;
          loadFeedbackPage(false).then(render).catch((error) => {
            state.error = error.message;
            render();
          });
        }
      }

      function renderPagination(type, meta) {
        if (!meta || Number(meta.pages || 1) <= 1) return "";
        return `
          <div class="actions" style="margin-top:18px; justify-content:space-between; align-items:center;">
            <div class="item-meta">Halaman ${meta.page} dari ${meta.pages} • Total ${meta.total} data</div>
            <div class="actions" style="margin-top:0">
              <button class="btn secondary" ${meta.hasPrev ? "" : "disabled"} onclick="setListPage('${type}', ${Math.max(1, Number(meta.page) - 1)})">← Sebelumnya</button>
              <button class="btn secondary" ${meta.hasNext ? "" : "disabled"} onclick="setListPage('${type}', ${Number(meta.page) + 1})">Berikutnya →</button>
            </div>
          </div>
        `;
      }
      function escapeHtml(value) {
        return String(value ?? "").replace(
          /[&<>"']/g,
          (char) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#039;",
            })[char],
        );
      }
      function parseDateOnly(value) {
        if (!value) return null;
        const date = new Date(`${value}T00:00:00`);
        return Number.isNaN(date.getTime()) ? null : date;
      }
      function toDateInputValue(date = today) {
        const localDate = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000,
        );
        return localDate.toISOString().slice(0, 10);
      }
      function formatDate(value) {
        const parsed = parseDateOnly(value) || new Date(value);
        if (!value || Number.isNaN(parsed.getTime())) return "-";
        return parsed.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
      function formatDateTime(value) {
        const parsed = new Date(value);
        if (!value || Number.isNaN(parsed.getTime())) return "-";
        return parsed.toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      function daysUntil(value) {
        const date = parseDateOnly(value);
        if (!date) return 99999;
        return Math.ceil((date - today) / (1000 * 60 * 60 * 24));
      }
      function isBeforeToday(value) {
        const date = parseDateOnly(value);
        return date ? date < today : false;
      }
      function isAfterToday(value) {
        const date = parseDateOnly(value);
        return date ? date > today : false;
      }
      function categoryLabel(id) {
        return illnessCategories.find((c) => c.id === id)?.label || "Lainnya";
      }
      function categoryExamples(id) {
        return (
          illnessCategories.find((c) => c.id === id)?.examples ||
          "keluhan lain yang perlu dicatat manual"
        );
      }
      function triageTone(triage) {
        if (triage === "Merah") return "rose";
        if (triage === "Kuning") return "amber";
        if (triage === "Hijau") return "emerald";
        return "slate";
      }
      function stockStatus(medicine) {
        const low = Number(medicine.stock) <= Number(medicine.minStock);
        const days = daysUntil(medicine.expired);
        if (days < 0) return "Kedaluwarsa, keluarkan";
        if (days <= 30) return "Prioritas keluarkan";
        if (low && days <= 60) return "Restock & cek kedaluwarsa";
        if (low) return "Stok rendah";
        if (days <= 60) return "Dekat kedaluwarsa";
        return "Aman";
      }
      function stockTone(status) {
        if (status === "Aman") return "emerald";
        if (status === "Kedaluwarsa, keluarkan") return "rose";
        if (status === "Prioritas keluarkan" || status === "Dekat kedaluwarsa")
          return "amber";
        return "amber";
      }
      function medsByCategory(categoryId) {
        if (!categoryId || categoryId === "semua") return state.medicines;
        return state.medicines.filter((m) => m.categoryId === categoryId);
      }
      function availableBeds(gender) {
        return state.beds.filter(
          (bed) => bed.gender === gender && !bed.occupiedBy,
        );
      }
      function completedAdmissionsByUser(userId) {
        return state.admissions
          .filter((a) => a.patientId === userId && a.status === "Selesai")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      function badge(text, tone = "slate") {
        return `<span class="badge ${tone}">${escapeHtml(text)}</span>`;
      }
      function categoryOptions(selected, includeAll = false) {
        return (
          `${includeAll ? `<option value="semua" ${selected === "semua" ? "selected" : ""}>Semua kategori</option>` : ""}` +
          illnessCategories
            .map(
              (c) =>
                `<option value="${c.id}" ${selected === c.id ? "selected" : ""}>${escapeHtml(c.label)}</option>`,
            )
            .join("")
        );
      }
      function responsibleCategoryOptions(selected = "Suster") {
        const options = ["Staff", "Suster"];
        return options
          .map(
            (option) =>
              `<option value="${option}" ${selected === option ? "selected" : ""}>${option}</option>`,
          )
          .join("");
      }
      function setPage(page) {
        if (state.page === page) return;
        state.page = page;
        state.error = "";
        state.success = "";
        state.mobileOpen = false;
        render();
      }
      async function setAdminTab(tab) {
        state.activeAdminTab = tab;
        state.error = "";
        state.success = "";
        render();
        if (state.currentUser?.role === "admin") {
          try {
            await loadAdminTabData(tab, { resetPage: true });
          } catch (error) {
            state.error = error.message;
          }
          render();
        }
      }
      function normalizeSearch(value) {
        return String(value || "")
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();
      }
      function matchesSearch(text, query) {
        const q = normalizeSearch(query);
        if (!q) return true;
        const target = normalizeSearch(text);
        if (target.includes(q)) return true;
        const keywords = [
          ...new Set(q.split(" ").filter((word) => word.length > 1)),
        ];
        return keywords.length
          ? keywords.every((word) => target.includes(word))
          : true;
      }
      function updateSearchBar(type, input) {
        const value = input.value;
        if (type === "feedback") {
          state.feedbackMeta.query = value;
          state.feedbackMeta.page = 1;
        } else if (type === "records") {
          state.recordMeta.query = value;
          state.recordMeta.page = 1;
        } else {
          state.adminAdmissionMeta.query = value;
          state.adminAdmissionMeta.page = 1;
        }

        window.__activeSearchInput = {
          id: input.id,
          start: input.selectionStart ?? input.value.length,
          end: input.selectionEnd ?? input.value.length,
        };

        clearTimeout(window.__searchRenderTimer);
        window.__searchRenderTimer = setTimeout(async () => {
          try {
            await loadAdminTabData(state.activeAdminTab, { resetPage: false });
          } catch (error) {
            state.error = error.message;
          }
          render();
        }, 220);
      }

      function forceSearchRender(event) {
        if (event.key !== "Enter") return;
        event.preventDefault();
        clearTimeout(window.__searchRenderTimer);
        loadAdminTabData(state.activeAdminTab, { resetPage: false })
          .then(render)
          .catch((error) => {
            state.error = error.message;
            render();
          });
      }
      function restoreSearchFocus() {
        const focus = window.__activeSearchInput;
        if (!focus?.id) return;
        const input = document.getElementById(focus.id);
        if (!input) return;
        input.focus({ preventScroll: true });
        const length = input.value.length;
        const start = Math.min(focus.start ?? length, length);
        const end = Math.min(focus.end ?? start, length);
        try {
          input.setSelectionRange(start, end);
        } catch (error) {}
      }
      function showSuccess(message) {
        state.success = message;
        render();
        setTimeout(() => {
          state.success = "";
          render();
        }, 1800);
      }

      function uiIcon(name) {
        const icons = {
          phone:
            '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.6 10.8c1.6 3.1 3.5 5 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.3 1.3.4 2.6.6 4 .6.7 0 1.2.5 1.2 1.2v3.5c0 .7-.5 1.2-1.2 1.2C10.4 22 2 13.6 2 3.4 2 2.7 2.5 2.2 3.2 2.2h3.5c.7 0 1.2.5 1.2 1.2 0 1.4.2 2.7.6 4 .1.4 0 .9-.3 1.2l-1.6 2.2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          message:
            '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5.5h16v11H8l-4 3v-14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          login:
            '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 17l5-5-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
          map: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-4.7 7-11a7 7 0 1 0-14 0c0 6.3 7 11 7 11Z" fill="currentColor" opacity=".2"/><path d="M12 21s7-4.7 7-11a7 7 0 1 0-14 0c0 6.3 7 11 7 11Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 10.5h.01" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>',
          clock:
            '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="2"/><path d="M12 7.5v5l3.5 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          mail: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16v12H4V6Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="m4 7 8 6 8-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
          edit: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 20h4l10.5-10.5-4-4L4 16v4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M13.5 6.5l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
          shield:
            '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 5 6v6c0 4.4 2.8 7.4 7 9 4.2-1.6 7-4.6 7-9V6l-7-3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="m8.5 12.2 2.2 2.2 4.8-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        };
        return icons[name] || "";
      }

      function socialIcon(name) {
        const icons = {
          whatsapp:
            '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.3 19.7 5.4 16A8 8 0 1 1 8 18.6l-3.7 1.1Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 8.8c.2-.5.4-.6.8-.6h.6c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.4.5c.8 1.3 1.8 2.3 3.1 3.1l.6-.5c.2-.2.4-.2.7-.1l1.6.8c.3.1.4.3.4.6v.5c0 .4-.2.7-.6.8-.8.3-2.6.2-4.8-1.1-2.5-1.5-4.1-3.8-4.2-5.4 0-.5.2-1 .6-1.3Z" fill="currentColor"/></svg>',
          youtube:
            '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 8.2s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C15.2 5 12 5 12 5h0s-3.2 0-6.1.2c-.4.1-1.3.1-2.1.9C3.2 6.7 3 8.2 3 8.2S2.8 10 2.8 11.8v.4C2.8 14 3 15.8 3 15.8s.2 1.5.8 2.1c.8.8 1.8.8 2.3.9 1.7.2 5.9.2 5.9.2s3.2 0 6.1-.2c.4-.1 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1s.2-1.8.2-3.6v-.4c0-1.8-.2-3.6-.2-3.6Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m10.2 9.2 4.7 2.8-4.7 2.8V9.2Z" fill="currentColor"/></svg>',
          instagram:
            '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3.5" stroke="currentColor" stroke-width="2"/><circle cx="17" cy="7" r="1.2" fill="currentColor"/></svg>',
          twitter:
            '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.8 6.2c-.6.3-1.2.5-1.9.6.7-.4 1.1-1 1.4-1.8-.6.4-1.3.7-2.1.8A3.2 3.2 0 0 0 12.7 8c0 .3 0 .5.1.7A9.1 9.1 0 0 1 6.2 5.4a3.2 3.2 0 0 0 1 4.3c-.5 0-1-.2-1.4-.4v.1c0 1.6 1.1 2.9 2.6 3.2-.3.1-.6.1-.9.1-.2 0-.4 0-.6-.1.4 1.3 1.6 2.2 3 2.2A6.5 6.5 0 0 1 5 16.2 9.1 9.1 0 0 0 9.9 17.6c5.9 0 9.1-4.9 9.1-9.1v-.4c.7-.5 1.2-1.1 1.8-1.9Z" fill="currentColor"/></svg>',
        };
        return icons[name] || "";
      }

      function renderHeader() {
        const nav = [
          ["landing", "Beranda"],
          ["contact", "Saran"],
        ];
        const authButton = state.currentUser
          ? `<button class="system-btn" onclick="setPage('${state.currentUser.role === "admin" ? "admin" : "patient"}')">${uiIcon("login")} Dashboard</button><button onclick="logout()">Keluar</button>`
          : `<button class="system-btn" onclick="setPage('auth')">${uiIcon("login")} Masuk Sistem</button>`;

        return `
        <header class="header">
          <div class="container nav-wrap">
            <button class="brand" onclick="setPage('landing')" aria-label="UMN Medic Home">
              <span class="logo-mark" aria-hidden="true"><img src="${UMN_LOGO_SRC}" alt=""></span>
              <span>
                <span class="brand-title">UMN Medic</span>
                <span class="brand-subtitle">Campus Health Admission System</span>
              </span>
            </button>
            <nav class="nav">
              ${nav.map(([id, label]) => `<button class="${state.page === id ? "active" : ""}" onclick="setPage('${id}')">${label}</button>`).join("")}
              ${authButton}
            </nav>
            <button class="hamburger" onclick="toggleMobile()">☰</button>
          </div>
          <div class="container mobile-nav ${state.mobileOpen ? "show" : ""}">
            ${nav.map(([id, label]) => `<button onclick="setPage('${id}')">${label}</button>`).join("")}
            ${state.currentUser ? `<button onclick="setPage('${state.currentUser.role === "admin" ? "admin" : "patient"}')">Dashboard</button><button onclick="logout()">Keluar</button>` : `<button onclick="setPage('auth')">Masuk Sistem</button>`}
          </div>
        </header>
      `;
      }

      function renderLanding() {
        const activeCount =
          Number(state.summary?.activeAdmissions || 0) ||
          state.admissions.filter((a) => a.status !== "Selesai").length;

        return `
        <main>
          <section class="hero">
            <div class="hero-orb hero-orb-one"></div>
            <div class="hero-orb hero-orb-two"></div>
            <div class="container hero-grid">
              <div>
                <span class="eyebrow">Sistem admisi klinik kampus</span>
                <h1>Layanan UMN Medic yang lebih cepat, ramah, dan terdokumentasi.</h1>
                <p class="lead">Platform digital untuk pendaftaran pasien, laporan keluhan, triage, manajemen ranjang, rekam medis, inventori obat, rujukan eksternal, dan laporan operasional bulanan.</p>
                <div class="actions">
                  <button class="btn primary" onclick="setPage('auth')">＋ Mulai Pendaftaran</button>
                </div>
                <div class="quick-stats">
                  <div class="mini-stat"><strong>99,9%</strong><span>target uptime operasional</span></div>
                  <div class="mini-stat"><strong>L/P</strong><span>monitor ranjang terpisah</span></div>
                  <div class="mini-stat"><strong>PDF</strong><span>rujukan eksternal</span></div>
                </div>
              </div>
              <div class="card">
                <div class="board-header">
                  <div>
                    <p style="color: var(--emerald-700); font-weight: 900; font-size: 14px;">Live Admission Board</p>
                    <h2>Prioritas Triage Hari Ini</h2>
                  </div>
                  <div class="icon-box">⌁</div>
                </div>
                <div class="triage-list">
                  ${[
                    ["Merah", "Nyeri dada / sesak", "Segera", "rose"],
                    ["Kuning", "Demam tinggi / pusing", "Dalam observasi", "amber"],
                    ["Hijau", "Keluhan ringan", "Menunggu", "emerald"],
                  ]
                    .map(
                      ([triage, desc, status, tone]) => `
                        <div class="triage-row">
                          <div><p class="item-title"><span class="dot ${tone}"></span>Triage ${triage}</p><p class="item-meta">${desc}</p></div>
                          ${badge(status, tone)}
                        </div>
                      `,
                    )
                    .join("")}
                </div>
                <div class="quick-stats">
                  <div class="mini-stat"><strong>${availableBeds("L").length}/3</strong><span>ranjang laki-laki tersedia</span></div>
                  <div class="mini-stat"><strong>${availableBeds("P").length}/3</strong><span>ranjang perempuan tersedia</span></div>
                  <div class="mini-stat"><strong>${activeCount}</strong><span>kunjungan aktif</span></div>
                </div>
              </div>
            </div>
          </section>
        </main>
      `;
      }
      function renderContact() {
        const completedAdmissions = state.currentUser
          ? completedAdmissionsByUser(state.currentUser.id)
          : [];
        return `
        <main class="contact-page">
          <div class="container contact-layout feedback-only">
            <section class="contact-panel feedback-panel only-feedback">
              <span class="eyebrow">${uiIcon("message")} Masukan Pengguna</span>
              <div class="feedback-head">
                <div>
                  <h2>Kritik dan Saran</h2>
                  <p class="feedback-desc">Sampaikan kritik atau saran untuk membantu UMN Medic meningkatkan mutu layanan, fasilitas, dan pengalaman pengguna. Informasi kontak klinik sudah dipindahkan ke bagian bawah website.</p>
                </div>
                <div class="feedback-illustration" aria-hidden="true">
                  <span class="chat-dot one"></span>
                  <span class="chat-dot two"></span>
                  <span class="chat-dot three"></span>
                </div>
              </div>
              ${
                state.currentUser
                  ? completedAdmissions.length
                    ? `
                <form onsubmit="submitFeedback(event)" class="form-grid">
                  <div class="form-grid two">
                    <label><span>Nama</span><input id="feedback-name" value="${escapeHtml(getCurrentUser().name)}" readonly /></label>
                    <label><span>Email</span><input id="feedback-email" type="email" placeholder="nama@email.com" /></label>
                  </div>
                  <label><span>Layanan yang Sudah Selesai</span>
                    <select id="feedback-admission" required>
                      ${completedAdmissions.map((a) => `<option value="${a.id}" ${a.id === window.__feedbackAdmissionId ? "selected" : ""}>${escapeHtml(a.id)} — ${formatDateTime(a.createdAt)} — ${escapeHtml(categoryLabel(a.illnessCategory))}</option>`).join("")}
                    </select>
                  </label>
                  <label><span>Kategori Masukan</span>
                    <select id="feedback-category">
                      <option>Pelayanan klinik</option>
                      <option>Proses pendaftaran</option>
                      <option>Fasilitas</option>
                      <option>Sistem admisi</option>
                      <option>Lainnya</option>
                    </select>
                  </label>
                  <label><span>Kritik</span><textarea id="feedback-critique" required placeholder="Tuliskan kendala atau hal yang perlu diperbaiki..."></textarea></label>
                  <label><span>Saran</span><textarea id="feedback-suggestion" required placeholder="Tuliskan usulan perbaikan yang Anda harapkan..."></textarea></label>
                  <button class="btn primary contact-login-btn" type="submit">${uiIcon("edit")} <span>Kirim Masukan</span></button>
                  ${state.success ? `<div class="success">${escapeHtml(state.success)}</div>` : ""}
                </form>
              `
                    : `
                <div class="feedback-rule">
                  <div class="feedback-rule-icon">${uiIcon("shield")}</div>
                  <p class="feedback-rule-text">Kritik dan saran hanya dapat dikirim setelah pasien menyelesaikan layanan.</p>
                </div>
                <div class="actions" style="margin-top:22px">
                  <button class="btn secondary" onclick="setPage('patient')">Lihat Dashboard Pasien</button>
                </div>
              `
                  : `
                <div class="feedback-rule">
                  <div class="feedback-rule-icon">${uiIcon("edit")}</div>
                  <p class="feedback-rule-text">Kritik dan saran hanya dapat dikirim oleh pengguna yang sudah login dan sudah menyelesaikan layanan.</p>
                </div>
                <button class="btn primary contact-login-btn" onclick="setPage('auth')">${uiIcon("login")} <span>Login untuk Mengisi</span></button>
              `
              }
            </section>
          </div>
        </main>
      `;
      }

      function renderAuth() {
        const mode = window.__authMode || "login";
        return `
        <main class="dashboard">
          <div class="container grid-2">
            <div>
              <span class="eyebrow">Akses sistem</span>
              <h1>Masuk sebagai pasien atau admin.</h1>
              <p class="lead">Silakan login menggunakan akun yang sudah dibuat. Pasien baru dapat mendaftarkan akun langsung dari halaman ini.</p>
              <div class="grid-2" style="margin-top:22px">
                <div class="card"><h3>✓ Role Pasien</h3><p class="item-text">Daftar akun, login, lapor keluhan, lihat riwayat.</p></div>
                <div class="card"><h3>◎ Role Admin</h3><p class="item-text">Triage, rekam medis, obat, rujukan, laporan.</p></div>
              </div>
            </div>
            <div class="card">
              <div class="pill-tabs" style="background:var(--slate-100); padding:5px; border-radius:18px; margin-bottom:18px;">
                <button class="btn ${mode === "login" ? "primary" : "ghost"}" style="flex:1" onclick="window.__authMode='login'; render()">Login</button>
                <button class="btn ${mode === "register" ? "primary" : "ghost"}" style="flex:1" onclick="window.__authMode='register'; render()">Daftar Pasien</button>
              </div>
              ${state.error ? `<div class="error">${escapeHtml(state.error)}</div>` : ""}
              ${
                mode === "login"
                  ? `
                <form onsubmit="login(event)" class="form-grid">
                  <label><span>Username</span><input id="login-username" autocomplete="username" /></label>
                  <label><span>Password</span><input id="login-password" type="password" autocomplete="current-password" /></label>
                  <button class="btn primary" type="submit">↪ Masuk</button>
                </form>
              `
                  : `
                <form onsubmit="registerPatient(event)" class="form-grid two">
                  <label><span>Nama Lengkap</span><input id="reg-name" required /></label>
                  <label><span>NIM/NIK</span><input id="reg-nim" required /></label>
                  <label><span>Jenis Kelamin</span><select id="reg-gender"><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></label>
                  <label><span>Tanggal Lahir</span><input id="reg-birth" type="date" /></label>
                  <label><span>Username</span><input id="reg-username" autocomplete="username" required /></label>
                  <label><span>Password</span><input id="reg-password" type="password" autocomplete="new-password" required /></label>
                  <button class="btn primary" style="grid-column:1/-1" type="submit">＋ Buat Akun Pasien</button>
                </form>
              `
              }
            </div>
          </div>
        </main>
      `;
      }
      
function renderPatient() {
        if (!isPatientUser()) return renderAuth();
        const currentUser = getCurrentUser();
        const myAdmissions = [...getPatientAdmissions()].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        const myFeedbacks = getPatientFeedbacks();
        const selectedCat = window.__complaintCategory || "batuk-flu";
        return `
        <main class="dashboard">
          <div class="container">
            <div class="dash-head">
              <div>
                <span class="eyebrow">Dashboard Pasien</span>
                <h1>Halo, ${escapeHtml(currentUser.name)}</h1>
                <p class="item-text">Laporkan keluhan dan pilih kategori penyakit agar admin bisa menyiapkan penanganan dan obat yang sesuai.</p>
              </div>
              ${badge("NIM/NIK: " + currentUser.nim_nik, "sky")}
            </div>
            <div class="grid-2">
              <div class="card">
                <h2>Laporkan Keluhan</h2>
                <p class="item-text">Kategori dipakai untuk mengelompokkan keluhan umum mahasiswa seperti batuk, pusing, flu, maag, nyeri menstruasi, diare, alergi, dan keluhan lainnya.</p>
                <form onsubmit="submitComplaint(event)" class="form-grid" style="margin-top:18px">
                  <label><span>Kategori Keluhan</span><select id="complaint-category" onchange="window.__complaintCategory=this.value; render()">${categoryOptions(selectedCat)}</select></label>
                  <div class="hint">Contoh kategori ini: ${escapeHtml(categoryExamples(selectedCat))}.</div>
                  <label><span>Keluhan Kesehatan</span><textarea id="complaint-text" placeholder="Contoh: sakit kepala sejak pagi, mual, demam..." required></textarea></label>
                  <button class="btn primary" type="submit">+ Kirim Laporan</button>
                </form>
                ${state.success ? `<div class="success">${escapeHtml(state.success)}</div>` : ""}
              </div>
              <div class="card">
                <h2>Riwayat Pemeriksaan</h2>
                <div class="list">
                  ${
                    myAdmissions
                      .map(
                        (item) => `
                    <div class="list-item">
                      <div class="item-head">
                        <div><p class="item-title">${escapeHtml(item.id)}</p><p class="item-meta">${formatDateTime(item.createdAt)}</p></div>
                        <div>${badge(categoryLabel(item.illnessCategory), "emerald")} ${badge(item.triage, triageTone(item.triage))} ${badge(item.status, "sky")}</div>
                      </div>
                      <p class="item-text"><b>Keluhan:</b> ${escapeHtml(item.complaint)}</p>
                      ${item.diagnosis ? `<p class="item-text"><b>Diagnosis:</b> ${escapeHtml(item.diagnosis)}</p>` : ""}
                      ${item.treatment ? `<p class="item-text"><b>Tindakan:</b> ${escapeHtml(item.treatment)}</p>` : ""}
                      ${item.responsibleOfficer || item.responsibleCategory ? `<p class="item-text"><b>Pengurus:</b> ${escapeHtml(item.responsibleCategory || "-")}${item.responsibleOfficer ? ` - ${escapeHtml(item.responsibleOfficer)}` : ""}</p>` : ""}
                      ${item.medicines?.length ? `<p class="item-text"><b>Obat:</b> ${item.medicines.map((m) => `${escapeHtml(m.name)} (${m.qty})${m.officer || m.responsibleOfficer ? ` oleh ${escapeHtml(m.officer || m.responsibleOfficer)}` : ""}`).join(", ")}</p>` : ""}
                      ${item.referral ? `<p class="item-text" style="color:var(--rose-600)"><b>Rujukan:</b> ${escapeHtml(item.referral.hospital)} — ${escapeHtml(item.referral.reason)}${item.referral.officer ? ` • PJ: ${escapeHtml(item.referral.officer)}` : ""}</p>` : ""}
                      ${item.status === "Selesai" ? (myFeedbacks.some((f) => f.admissionId === item.id) ? `<p class="item-text" style="color:var(--emerald-700);margin-top:12px">✓ Kritik &amp; saran sudah dikirim.</p>` : `<div class="actions" style="margin-top:12px"><button class="btn secondary" onclick="window.__feedbackAdmissionId='${item.id}'; setPage('contact')">✎ Isi Kritik &amp; Saran</button></div>`) : ""}
                    </div>
                  `,
                      )
                      .join("") ||
                    `<p class="item-text">Belum ada riwayat pemeriksaan.</p>`
                  }
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
      }

      
function renderAdmin() {
        if (!isAdminUser()) return renderAuth();
        const currentUser = getCurrentUser();
        const active = state.activeAdminTab;
        const adminSummary = getAdminSummaryState();
        return `
        <main class="dashboard">
          <div class="container">
            <div class="dash-head">
              <div>
                <span class="eyebrow">Dashboard Admin</span>
                <h1>Halo, ${escapeHtml(currentUser.name)}</h1>
                <p class="item-text">Tahap 2 aktif: flow admin dan pasien dipisah, state dashboard dibagi per domain, dan statistik ringan dirender dari summary yang sudah diringkas.</p>
              </div>
              <div class="tabs">
                ${[
                  ["admission", "⌁ Admisi & Triage"],
                  ["records", "▤ Rekam Medis"],
                  ["inventory", "◉ Inventori Obat"],
                  ["feedback", "✎ Kritik & Saran"],
                  ["reports", "☷ Laporan"],
                ]
                  .map(
                    ([id, label]) =>
                      `<button class="btn ${active === id ? "primary" : "secondary"}" onclick="setAdminTab('${id}')">${label}</button>`,
                  )
                  .join("")}
              </div>
            </div>
            <div class="stat-grid">
              <div class="card stat"><span>Kunjungan aktif</span><strong>${Number(adminSummary.activeAdmissions || 0)}</strong><small>belum selesai</small></div>
              <div class="card stat"><span>Ranjang terpakai</span><strong>${Number(adminSummary.occupiedBeds || 0)}/${Number(adminSummary.totalBeds || 0)}</strong><small>monitor L/P</small></div>
              <div class="card stat"><span>Stok rendah</span><strong>${Number(adminSummary.lowStock || 0)}</strong><small>perlu restock</small></div>
              <div class="card stat"><span>Dekat kedaluwarsa</span><strong>${Number(adminSummary.expiringMedicines || 0)}</strong><small>≤ 60 hari</small></div>
            </div>
            ${active === "admission" ? renderAdmissionTab() : ""}
            ${active === "records" ? renderRecordsTab() : ""}
            ${active === "inventory" ? renderInventoryTab() : ""}
            ${active === "feedback" ? renderFeedbackTab() : ""}
            ${active === "reports" ? renderReportsTab() : ""}
          </div>
        </main>
      `;
      }
      function renderAdmissionTab() {
        const admissions = getAdminQueueState().items || [];
        return `
        <div class="admin-grid">
          <div class="card">
            <div class="search-row">
              <h2>Antrian Triage</h2>
              <input id="admission-search" class="search-input" type="search" autocomplete="off" spellcheck="false" placeholder="Cari pasien/NIM/kategori/keluhan" value="${escapeHtml(state.adminAdmissionMeta.query || "")}" oninput="updateSearchBar('admission', this)" onkeydown="forceSearchRender(event)" />
            </div>
            <div class="list">
              ${
                admissions.length
                  ? admissions
                      .map(
                        (item) => `
                <div class="list-item" data-admission-id="${item.id}">
                  <div class="item-head">
                    <div>
                      <p class="item-title">${escapeHtml(item.patientName)} ${badge(item.gender === "L" ? "Laki-laki" : "Perempuan", "sky")} ${badge(categoryLabel(item.illnessCategory), "emerald")} ${badge(item.triage, triageTone(item.triage))}</p>
                      <p class="item-meta">${escapeHtml(item.id)} • ${formatDateTime(item.createdAt)}</p>
                      <p class="item-text">${escapeHtml(item.complaint)}</p>
                    </div>
                    <div class="admission-actions">
                      <select onchange="updateAdmission('${item.id}', { triage: this.value, status: this.value === 'Belum dinilai' ? 'Laporan diterima' : 'Menunggu pemeriksaan' })">
                        ${["Belum dinilai", "Hijau", "Kuning", "Merah"].map((t) => `<option ${item.triage === t ? "selected" : ""}>${t}</option>`).join("")}
                      </select>
                      <select onchange="handleAdmissionStatusChange('${item.id}', this.value)">
                        ${["Laporan diterima", "Menunggu pemeriksaan", "Dalam observasi", "Selesai"].map((s) => `<option ${item.status === s ? "selected" : ""}>${s}</option>`).join("")}
                      </select>
                      <button class="btn ${item.bedId ? "danger" : "secondary"}" onclick="${item.bedId ? `releaseBed('${item.id}')` : `assignBed('${item.id}')`}">${item.bedId ? `Lepas ${item.bedId}` : "Assign Ranjang"}</button>
                      <button class="btn dark" onclick="completeAdmission('${item.id}')">Selesai</button>
                      <button class="btn danger" style="grid-column:1/-1" onclick="deleteAdmission('${item.id}')">Hapus Antrian</button>
                    </div>
                  </div>
                </div>
              `,
                      )
                      .join("")
                  : `<p class="item-text">Tidak ada admisi aktif pada halaman ini.</p>`
              }
            </div>
            ${renderPagination("admission", getAdminQueueState().meta || state.adminAdmissionMeta)}
          </div>
          ${renderBedPanel()}
        </div>
      `;
      }
      function renderBedPanel() {
        return `
        <div class="card">
          <h2>Manajemen Ranjang L/P</h2>
          <p class="item-text">Status ranjang diperbarui ketika admin melakukan assign atau release pasien.</p>
          ${["L", "P"]
            .map((gender) => {
              const beds = (getInventorySnapshot().beds || []).filter((b) => b.gender === gender);
              const free = beds.filter((b) => !b.occupiedBy).length;
              return `
              <div class="bed-group">
                <div class="item-head"><h3>${gender === "L" ? "Laki-laki" : "Perempuan"}</h3>${badge(`${free}/${beds.length} tersedia`, free ? "emerald" : "rose")}</div>
                <div class="bed-grid">
                  ${beds.map((b) => `<div class="bed ${b.occupiedBy ? "occupied" : "available"}">▣<br>${b.id}<br><small>${b.occupiedBy ? "Terisi" : "Kosong"}</small></div>`).join("")}
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      `;
      }

      function renderRecordsTab() {
        const recordState = getAdminRecordsState();
        const admissions = recordState.items || [];
        const item =
          recordState.detail ||
          admissions.find((a) => a.id === (recordState.selectedId || state.selectedAdmissionId)) ||
          admissions[0];

        if (!item) {
          return `
            <div class="card">
              <div class="search-row">
                <h2>Rekam Medis</h2>
                <input id="records-search" class="search-input" type="search" autocomplete="off" spellcheck="false" placeholder="Cari pasien/NIM/keluhan" value="${escapeHtml((getAdminRecordsState().meta || state.recordMeta).query || "")}" oninput="updateSearchBar('records', this)" onkeydown="forceSearchRender(event)" />
              </div>
              <p class="item-text">Tidak ada data admisi untuk ditampilkan.</p>
            </div>
          `;
        }

        state.selectedAdmissionId = item.id;
        const medFilter = window.__medFilter || item.illnessCategory || "semua";
        const medOptions = medsByCategory(medFilter);

        return `
        <div class="grid-2">
          <div class="card">
            <div class="search-row">
              <h2>Pilih Pasien</h2>
              <input id="records-search" class="search-input" type="search" autocomplete="off" spellcheck="false" placeholder="Cari pasien/NIM/keluhan" value="${escapeHtml((getAdminRecordsState().meta || state.recordMeta).query || "")}" oninput="updateSearchBar('records', this)" onkeydown="forceSearchRender(event)" />
            </div>
            <div class="list">
              ${admissions
                .map(
                  (a) => `
                <button class="list-item" style="text-align:left; ${a.id === item.id ? "border-color: var(--emerald-600); background: var(--emerald-50);" : ""}" onclick="selectAdmission('${a.id}')">
                  <p class="item-title">${escapeHtml(a.patientName)} ${badge(categoryLabel(a.illnessCategory), "emerald")}</p>
                  <p class="item-meta">${escapeHtml(a.id)} • ${formatDateTime(a.createdAt)}</p>
                  <p class="item-text">${escapeHtml(a.complaint)}</p>
                </button>
              `,
                )
                .join("")}
            </div>
            ${renderPagination("records", getAdminRecordsState().meta || state.recordMeta)}
          </div>
          <div class="card">
            <div class="item-head">
              <div><h2>Rekam Medis & Obat</h2><p class="item-meta">${escapeHtml(item.patientName)} • ${escapeHtml(item.nim_nik)}</p></div>
              ${badge(item.status, item.status === "Selesai" ? "emerald" : "amber")}
            </div>
            ${state.success ? `<div class="success">${escapeHtml(state.success)}</div>` : ""}
            <form onsubmit="saveRecord(event)" class="form-grid three" style="margin-top:18px">
              <label><span>Kategori Keluhan</span><select id="record-category" onchange="window.__medFilter=this.value; render()">${categoryOptions(item.illnessCategory)}</select></label>
              <label><span>Suhu (°C)</span><input id="record-temp" value="${escapeHtml(item.vitals?.temp || "")}" /></label>
              <label><span>Tekanan Darah</span><input id="record-bp" value="${escapeHtml(item.vitals?.bp || "")}" /></label>
              <label><span>Heart Rate (bpm)</span><input id="record-pulse" value="${escapeHtml(item.vitals?.pulse || "")}" /></label>
              <label><span>Kategori Pengurus</span><select id="record-responsible-category">${responsibleCategoryOptions(item.responsibleCategory || "Suster")}</select></label>
              <label style="grid-column: span 2"><span>Penanggung Jawab Pemeriksaan</span><input id="record-officer" value="${escapeHtml(item.responsibleOfficer || item.medicalOfficer || state.currentUser.name)}" placeholder="Nama petugas/admin" /></label>
              <label style="grid-column:1/-1"><span>Diagnosis</span><textarea id="record-diagnosis">${escapeHtml(item.diagnosis || "")}</textarea></label>
              <label style="grid-column:1/-1"><span>Tindakan / Catatan Pemeriksaan</span><textarea id="record-treatment">${escapeHtml(item.treatment || "")}</textarea></label>
              <button class="btn primary" type="submit">▤ Simpan Rekam Medis</button>
            </form>
            <div class="list-item" style="margin-top:20px">
              <h3>Pemberian Obat Berdasarkan Kategori</h3>
              <p class="item-text">Filter obat mengikuti kategori keluhan, tetapi admin tetap bisa memilih semua kategori bila dibutuhkan.</p>
              <div class="form-grid two" style="margin-top:14px">
                <label><span>Filter Kategori</span><select id="med-filter" onchange="window.__medFilter=this.value; render()">${categoryOptions(medFilter, true)}</select></label>
                <label><span>Obat</span><select id="med-id" onchange="syncMedQtyLimit()">${medOptions.map((m) => `<option value="${m.id}">${escapeHtml(m.name)} — stok ${m.stock}</option>`).join("")}</select></label>
                <label><span>Jumlah Obat</span><input id="med-qty" type="number" min="1" step="1" value="1" placeholder="1, 3, 4, 10" /></label>
                <label><span>Penanggung Jawab Obat</span><input id="med-officer" value="${escapeHtml(getCurrentUser().name)}" placeholder="Nama petugas/admin" /></label>
                <button class="btn secondary" onclick="giveMedicine(event)">◉ Catat Obat & Selesaikan</button>
              </div>
              ${item.medicines?.length ? `<p class="item-text"><b>Sudah diberikan:</b> ${item.medicines.map((m) => `${escapeHtml(m.name)} (${m.qty})${m.officer || m.responsibleOfficer ? ` oleh ${escapeHtml(m.officer || m.responsibleOfficer)}` : ""}`).join(", ")}</p>` : ""}
            </div>
            <div class="list-item" style="margin-top:16px; background:var(--amber-50)">
              <h3>Rujukan Eksternal</h3>
              <div class="form-grid two" style="margin-top:14px">
                <label><span>RS / Klinik Tujuan</span><input id="ref-hospital" value="${escapeHtml(item.referral?.hospital || "")}" placeholder="Contoh: RS Mitra Keluarga" /></label>
                <label><span>Alasan Rujukan</span><input id="ref-reason" value="${escapeHtml(item.referral?.reason || "")}" placeholder="Butuh pemeriksaan lanjutan" /></label>
                <label style="grid-column:1/-1"><span>Penanggung Jawab Rujukan</span><input id="ref-officer" value="${escapeHtml(item.referral?.officer || state.currentUser.name)}" placeholder="Nama petugas/admin" /></label>
              </div>
              ${item.referral?.officer ? `<p class="item-text"><b>PJ Rujukan:</b> ${escapeHtml(item.referral.officer)}</p>` : ""}
              <div class="actions"><button class="btn secondary" onclick="saveReferral()">Simpan Rujukan</button><button class="btn dark" onclick="printReferral()">⇩ Cetak / Simpan PDF</button></div>
            </div>
          </div>
        </div>
      `;
      }
      function renderInventoryTab() {
        return `
        <div class="grid-2">
          <div class="card">
            <h2>Inventori Obat</h2>
            <p class="item-text">Kategori obat disusun berdasarkan keluhan/penyakit yang sering dialami mahasiswa, bukan hanya kategori farmakologis.</p>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Obat</th><th>Kategori Keluhan</th><th>Stok</th><th>Tanggal Masuk</th><th>Kedaluwarsa</th><th>Status</th><th>Tambah Stok</th></tr></thead>
                <tbody>
                  ${(getInventorySnapshot().medicines || [])
                    .map((m) => {
                      const status = stockStatus(m);
                      return `
                      <tr>
                        <td><b>${escapeHtml(m.name)}</b></td>
                        <td>${badge(categoryLabel(m.categoryId), "emerald")}</td>
                        <td><b>${m.stock}</b></td>
                        <td>${formatDate(m.receivedAt || m.receivedDate || m.createdAt)}</td>
                        <td>${formatDate(m.expired)}</td>
                        <td>${badge(status, stockTone(status))}</td>
                        <td>
                          <div class="stock-inline">
                            <input id="stock-add-${m.id}" type="number" min="1" step="1" placeholder="1, 3, 10" />
                            <button class="btn secondary" onclick="addStock('${m.id}')">Tambah</button>
                          </div>
                        </td>
                      </tr>
                    `;
                    })
                    .join("")}
                </tbody>
              </table>
            </div>
          </div>
          <div class="card">
            <h2>Tambah Obat</h2>
            <form onsubmit="addMedicine(event)" class="form-grid" style="margin-top:18px">
              <label><span>Nama Obat</span><input id="new-med-name" required /></label>
              <label><span>Kategori Keluhan</span><select id="new-med-category">${categoryOptions("pusing-demam")}</select></label>
              <label><span>Stok Awal</span><input id="new-med-stock" type="number" min="0" step="1" value="0" /></label>
              <label><span>Minimal Stok</span><input id="new-med-min" type="number" min="0" step="1" value="10" /></label>
              <label><span>Tanggal Masuk Obat</span><input id="new-med-received" type="date" max="${toDateInputValue()}" value="${toDateInputValue()}" required /></label>
              <label><span>Tanggal Kedaluwarsa</span><input id="new-med-expired" type="date" min="${toDateInputValue()}" required /></label>
              <div class="hint">Tanggal kedaluwarsa tidak boleh lebih kecil dari hari ini. Obat yang sudah kedaluwarsa atau mendekati kedaluwarsa akan diberi status prioritas keluarkan.</div>
              <button class="btn primary" type="submit">+ Tambah ke Inventori</button>
            </form>
          </div>
        </div>
      `;
      }

      function renderFeedbackTab() {
        const feedbackState = getAdminFeedbackState();
        const feedbacks = feedbackState.items || [];
        const categoryCounts = feedbacks.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {});
        return `
        <div class="grid-2">
          <div class="card">
            <div class="search-row">
              <div>
                <h2>Kritik & Saran Pasien</h2>
                <p class="item-text">Daftar ini dimuat dari server per halaman dan hanya menampilkan masukan dari layanan yang sudah selesai.</p>
              </div>
              <input id="feedback-search" class="search-input" type="search" autocomplete="off" spellcheck="false" placeholder="Cari nama/NIM/kategori/isi masukan" value="${escapeHtml((getAdminFeedbackState().meta || state.feedbackMeta).query || "")}" oninput="updateSearchBar('feedback', this)" onkeydown="forceSearchRender(event)" />
            </div>
            <div class="list">
              ${
                feedbacks.length
                  ? feedbacks
                      .map(
                        (item) => `
                <div class="list-item">
                  <div class="item-head">
                    <div>
                      <p class="item-title">${escapeHtml(item.name)} ${badge(item.category, "emerald")}</p>
                      <p class="item-meta">${escapeHtml(item.nim_nik || "-")} • ${escapeHtml(item.admissionId)} • Layanan: ${formatDateTime(item.serviceDate)} • Masuk: ${formatDateTime(item.createdAt)}</p>
                      ${item.email ? `<p class="item-meta">Email: ${escapeHtml(item.email)}</p>` : ""}
                    </div>
                    ${badge("Layanan selesai", "sky")}
                  </div>
                  <p class="item-text"><b>Kritik:</b> ${escapeHtml(item.critique)}</p>
                  <p class="item-text"><b>Saran:</b> ${escapeHtml(item.suggestion)}</p>
                </div>
              `,
                      )
                      .join("")
                  : `<p class="item-text">Belum ada kritik dan saran pada halaman ini.</p>`
              }
            </div>
            ${renderPagination("feedback", getAdminFeedbackState().meta || state.feedbackMeta)}
          </div>
          <div class="card">
            <h2>Ringkasan Masukan</h2>
            <div class="stat-grid" style="grid-template-columns:repeat(2,1fr); margin-top:18px">
              <div class="card stat"><span>Total masukan</span><strong>${Number((getAdminFeedbackState().meta || state.feedbackMeta).total || 0)}</strong><small>hasil pencarian server</small></div>
              <div class="card stat"><span>Pasien selesai</span><strong>${Number(getAdminSummaryState().completedAdmissions || 0)}</strong><small>riwayat layanan</small></div>
            </div>
            <div class="list-item" style="margin-top:16px; background:var(--emerald-50)">
              <h3>Kategori Masukan (halaman ini)</h3>
              <div class="list">
                ${
                  Object.entries(categoryCounts)
                    .map(
                      ([category, count]) =>
                        `<div class="list-item" style="background:#fff"><div class="item-head"><span>${escapeHtml(category)}</span><b>${count}</b></div></div>`,
                    )
                    .join("") || `<p class="item-text">Belum ada kategori masukan.</p>`
                }
              </div>
            </div>
            <div class="hint" style="margin-top:16px">
              Search feedback sekarang diproses di server, bukan filter semua data di browser. Ini membuat halaman admin lebih ringan saat data masukan bertambah besar.
            </div>
          </div>
        </div>
      `;
      }
      function renderReportsTab() {
        const summary = getReportSummaryState();
        const total = Number(summary.totalAdmissions || 0);
        const triages = summary.triages || [];
        const categories = summary.categories || [];
        const medUsed = summary.medicineUsage || {};

        return `
        <div class="grid-2">
          <div class="card">
            <div class="item-head">
              <div><h2>Laporan Operasional Bulanan</h2><p class="item-meta">Ringkasan ini dihitung di server agar dashboard tetap ringan.</p></div>
              <button class="btn primary no-print" onclick="window.print()">⇩ Cetak</button>
            </div>
            <div class="stat-grid" style="grid-template-columns:repeat(2,1fr); margin-top:18px">
              <div class="card stat"><span>Total kunjungan</span><strong>${total}</strong><small>data admisi</small></div>
              <div class="card stat"><span>Selesai</span><strong>${Number(summary.completedAdmissions || 0)}</strong><small>pemeriksaan selesai</small></div>
              <div class="card stat"><span>Jenis obat</span><strong>${(getInventorySnapshot().medicines || []).length}</strong><small>terdaftar</small></div>
              <div class="card stat"><span>Okupansi ranjang</span><strong>${Number(getAdminSummaryState().occupiedBeds || 0)}/${Number(getAdminSummaryState().totalBeds || 0)}</strong><small>real-time</small></div>
            </div>
            <div class="list-item" style="margin-top:16px">
              <h3>Distribusi Triage</h3>
              <div class="list">
                ${triages.map((t) => `<div><div class="item-head"><span>${escapeHtml(t.label)}</span><b>${Number(t.count || 0)}</b></div><div class="progress"><div class="bar" style="width:${total ? (Number(t.count || 0) / total) * 100 : 0}%"></div></div></div>`).join("")}
              </div>
            </div>
            <div class="list-item" style="margin-top:16px; background:var(--emerald-50)">
              <h3>Kategori Keluhan Terbanyak</h3>
              <div class="list">
                ${categories.map((c) => `<div class="list-item" style="background:#fff"><div class="item-head"><span>${escapeHtml(categoryLabel(c.label) || c.label)}</span><b>${Number(c.count || 0)}</b></div></div>`).join("") || `<p class="item-text">Belum ada kategori keluhan.</p>`}
              </div>
            </div>
          </div>
          <div class="card">
            <h2>Observasi Obat</h2>
            <div class="list">
              ${(getInventorySnapshot().medicines || [])
                .map((m) => {
                  const status = stockStatus(m);
                  return `<div class="list-item"><div class="item-head"><div><p class="item-title">${escapeHtml(m.name)}</p><p class="item-meta">${categoryLabel(m.categoryId)} • Digunakan bulan ini: ${Number(medUsed[m.name] || 0)}</p></div>${badge(status, stockTone(status))}</div></div>`;
                })
                .join("")}
            </div>
          </div>
        </div>
      `;
      }
      function renderFooter() {
        return `
        <footer class="footer" id="kontak-klinik">
          <div class="container">
            <div class="footer-grid">
              <div>
                <div class="footer-brand">
                  <span class="footer-logo" aria-hidden="true"><img src="${UMN_LOGO_SRC}" alt=""></span>
                  <div>
                    <h3 style="margin:0">UMN Medic</h3>
                    <p style="margin-top:4px">Campus Health Admission System</p>
                  </div>
                </div>
                <div class="social-row" aria-label="Media sosial UMN Medic">
                  <a class="social-link" href="https://wa.me/6281234567890" target="_blank" rel="noopener" aria-label="WhatsApp UMN Medic">${socialIcon("whatsapp")}</a>
                  <a class="social-link" href="https://www.youtube.com/" target="_blank" rel="noopener" aria-label="YouTube UMN Medic">${socialIcon("youtube")}</a>
                  <a class="social-link" href="https://www.instagram.com/" target="_blank" rel="noopener" aria-label="Instagram UMN Medic">${socialIcon("instagram")}</a>
                  <a class="social-link" href="https://twitter.com/" target="_blank" rel="noopener" aria-label="Twitter UMN Medic">${socialIcon("twitter")}</a>
                </div>
              </div>
              <div>
                <h3>Hubungi Kami</h3>
                <div class="footer-contact-item">${uiIcon("phone")}<p><strong>Kontak WA:</strong><br><a class="footer-link" href="https://wa.me/6281234567890" target="_blank" rel="noopener">+62 812-3456-7890</a></p></div>
                <div class="footer-contact-item">${uiIcon("mail")}<p><strong>Email:</strong><br><a class="footer-link" href="mailto:medic@umn.ac.id">medic@umn.ac.id</a></p></div>
              </div>
              <div>
                <h3>Lokasi</h3>
                <div class="footer-contact-item">${uiIcon("map")}<p>Area kampus UMN di Gedung A</p></div>
              </div>
              <div>
                <h3>Jam operasional</h3>
                <div class="footer-contact-item">${uiIcon("clock")}<p>Hari kerja 08.00 - 17.00<br>Sabtu 08.00 - 11.00</p></div>
              </div>
              <div>
                <h3>Navigasi</h3>
                <ul>
                  <li><a class="footer-link" href="javascript:void(0)" onclick="setPage('landing')">Beranda</a></li>
                  <li><a class="footer-link" href="javascript:void(0)" onclick="setPage('contact')">Kritik dan Saran</a></li>
                  <li><a class="footer-link" href="javascript:void(0)" onclick="setPage('auth')">Masuk Sistem</a></li>
                </ul>
              </div>
            </div>
            <div class="footer-bottom">
              <span>© 2026 UMN Medic Admission System Prototype</span>
              <span>Database XAMPP • Bahasa Indonesia • PHP MySQL</span>
            </div>
          </div>
        </footer>
      `;
      }

      function render() {
        let content = "";
        if (state.isLoading) {
          content = `<main class="dashboard"><div class="container"><div class="card"><h2>Menghubungkan ke database XAMPP...</h2><p class="item-text">Pastikan Apache dan MySQL aktif.</p></div></div></main>`;
        } else if (state.error && !state.currentUser && state.page !== "auth") {
          content = `<main class="dashboard"><div class="container"><div class="card"><h2>Koneksi database perlu diperiksa</h2><div class="error">${escapeHtml(state.error)}</div><p class="item-text">Jalankan melalui <b>http://localhost/umn-medic-pengurus/</b>. Pastikan Apache dan MySQL XAMPP aktif. Jika database belum otomatis terbaca, import file database_umn_medic_revisi_lengkap.sql di phpMyAdmin.</p></div></div></main>`;
        } else {
          if (state.page === "landing") content = renderLanding();
          if (state.page === "contact") content = renderContact();
          if (state.page === "auth") content = renderAuth();
          if (state.page === "patient") content = renderPatient();
          if (state.page === "admin") content = renderAdmin();
          if (state.error && state.page !== "auth") {
            content = content.replace(
              '<div class="container">',
              `<div class="container"><div class="error">${escapeHtml(state.error)}</div>`,
            );
          }
        }
        const app = document.getElementById("app");
        const softPages = ["landing", "contact"];
        const pageClass = softPages.includes(state.page)
          ? "page-view soft-enter"
          : "page-view";
        app.innerHTML =
          renderHeader() +
          `<div class="${pageClass}" data-page="${state.page}">${content}</div>` +
          renderFooter();
        requestAnimationFrame(() => {
          initPageEffects();
          restoreSearchFocus();
        });
      }

      function initPageEffects() {
        const app = document.getElementById("app");
        if (!app) return;
        const currentPage = app.querySelector(".page-view")?.dataset.page || "";
        const revealSelector =
          currentPage === "landing"
            ? ".hero .card, .quick-stats .mini-stat, .section .feature"
            : currentPage === "contact"
              ? ".contact-panel"
              : "";
        const revealTargets = revealSelector
          ? app.querySelectorAll(revealSelector)
          : [];
        revealTargets.forEach((el, index) => {
          el.classList.add("reveal");
          el.style.setProperty(
            "--reveal-delay",
            `${Math.min(index * 24, 120)}ms`,
          );
        });

        if (revealTargets.length && "IntersectionObserver" in window) {
          const observer = new IntersectionObserver(
            (entries, obs) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add("in-view");
                  obs.unobserve(entry.target);
                }
              });
            },
            { threshold: 0.08 },
          );
          revealTargets.forEach((el) => observer.observe(el));
        } else {
          revealTargets.forEach((el) => el.classList.add("in-view"));
        }

        app.querySelectorAll("button, .btn").forEach((button) => {
          button.addEventListener("click", createTapEffect, { passive: true });
        });

        if (
          ["landing"].includes(
            app.querySelector(".page-view")?.dataset.page || "",
          )
        ) {
          animateStatNumbers(app);
        }
      }

      function createTapEffect(event) {
        const target = event.currentTarget;
        if (!target) return;
        target.classList.remove("tap-bounce");
        void target.offsetWidth;
        target.classList.add("tap-bounce");
        window.setTimeout(() => target.classList.remove("tap-bounce"), 280);
      }

      function animateStatNumbers(root) {
        const targets = root.querySelectorAll(
          ".stat strong, .mini-stat strong",
        );
        targets.forEach((el) => {
          const original = el.textContent.trim();
          const wholeNumber = original.match(/^\d+$/);
          const fraction = original.match(/^(\d+)\/(\d+)$/);
          if (!wholeNumber && !fraction) return;

          const end = wholeNumber ? Number(original) : Number(fraction[1]);
          const suffix = wholeNumber ? "" : `/${fraction[2]}`;
          const startTime = performance.now();
          const duration = 650;
          const tick = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = `${Math.round(end * eased)}${suffix}`;
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = original;
          };
          requestAnimationFrame(tick);
        });
      }

      function toggleMobile() {
        state.mobileOpen = !state.mobileOpen;
        render();
      }

      async function login(event) {
        event.preventDefault();
        const username = document.getElementById("login-username").value.trim();
        const password = document.getElementById("login-password").value;
        try {
          const result = await apiRequest("login", { username, password });
          applyServerData(result.data);
          state.currentUser = result.user || state.currentUser;
          state.error = "";
          state.page =
            state.currentUser?.role === "admin" ? "admin" : "patient";

          if (state.currentUser?.role === "admin") {
            await hydrateAdminPage(true);
          }

          render();
        } catch (error) {
          state.error = error.message;
          render();
        }
      }
      async function logout() {
        try {
          await apiRequest("logout");
        } catch (error) {
          /* tetap keluar di sisi tampilan */
        }
        state.currentUser = null;
        state.page = "landing";
        state.error = "";
        state.adminAdmissions = [];
        state.recordAdmissions = [];
        state.feedbackList = [];
        state.selectedAdmissionDetail = null;
        await loadData();
      }
      async function registerPatient(event) {
        event.preventDefault();
        await runAction(
          "registerPatient",
          {
            name: document.getElementById("reg-name").value.trim(),
            nim_nik: document.getElementById("reg-nim").value.trim(),
            gender: document.getElementById("reg-gender").value,
            birthDate: document.getElementById("reg-birth").value,
            username: document.getElementById("reg-username").value.trim(),
            password: document.getElementById("reg-password").value,
          },
          "Pendaftaran berhasil.",
        );
        if (state.currentUser) state.page = "patient";
        render();
      }
      async function submitComplaint(event) {
        event.preventDefault();
        const complaint = document
          .getElementById("complaint-text")
          .value.trim();
        const category = document.getElementById("complaint-category").value;
        if (!complaint) return;
        window.__complaintCategory = "batuk-flu";
        await runAction(
          "createAdmission",
          { complaint, category },
          "Laporan berhasil dikirim.",
        );
      }

      async function submitFeedback(event) {
        event.preventDefault();
        if (!state.currentUser) {
          state.page = "auth";
          render();
          return;
        }
        const completedAdmissions = completedAdmissionsByUser(
          state.currentUser.id,
        );
        if (!completedAdmissions.length) {
          alert(
            "Kritik dan saran hanya dapat dikirim setelah layanan selesai.",
          );
          return;
        }
        await runAction(
          "submitFeedback",
          {
            admissionId: document.getElementById("feedback-admission").value,
            email: document.getElementById("feedback-email").value.trim(),
            category: document.getElementById("feedback-category").value,
            critique: document.getElementById("feedback-critique").value.trim(),
            suggestion: document
              .getElementById("feedback-suggestion")
              .value.trim(),
          },
          "Kritik dan saran berhasil dikirim.",
        );
      }

      async function updateAdmission(id, updates) {
        await runAction(
          "updateAdmission",
          { id, updates },
          "Status admisi berhasil diperbarui.",
        );
      }

      async function handleAdmissionStatusChange(id, status) {
        if (status === "Selesai") {
          await completeAdmission(id);
          return;
        }
        await updateAdmission(id, { status });
      }

      async function completeAdmission(id) {
        const row = document.querySelector(`[data-admission-id="${id}"]`);
        if (row) row.classList.add("admission-completing");
        window.setTimeout(
          async () => {
            await runAction(
              "completeAdmission",
              { id },
              "Layanan selesai. Data dipindahkan dari antrian aktif.",
            );
          },
          row ? 220 : 0,
        );
      }

      async function assignBed(id) {
        await runAction("assignBed", { id }, "Ranjang berhasil ditetapkan.");
      }

      async function releaseBed(id) {
        await runAction("releaseBed", { id }, "Ranjang berhasil dilepas.");
      }

      async function deleteAdmission(id) {
        const admission = state.admissions.find((a) => a.id === id);
        if (!admission) return;
        const confirmed = confirm(
          `Hapus antrian triage ${admission.patientName}? Gunakan fitur ini bila pasien batal menggunakan layanan.`,
        );
        if (!confirmed) return;
        await runAction(
          "deleteAdmission",
          { id },
          "Antrian triage berhasil dihapus.",
        );
      }

      async function selectAdmission(id) {
        state.selectedAdmissionId = id;
        const admission = state.recordAdmissions.find((a) => a.id === id);
        window.__medFilter = admission?.illnessCategory || "semua";
        render();
        try {
          await loadSelectedAdmissionDetail(id);
        } catch (error) {
          state.error = error.message;
        }
        render();
      }
      async function saveRecord(event) {
        event.preventDefault();
        const item = state.selectedAdmissionDetail;
        if (!item) return;

        await runAction(
          "saveRecord",
          {
            id: item.id,
            category: document.getElementById("record-category").value,
            temp: document.getElementById("record-temp").value,
            bp: document.getElementById("record-bp").value,
            pulse: document.getElementById("record-pulse").value,
            diagnosis: document.getElementById("record-diagnosis").value,
            treatment: document.getElementById("record-treatment").value,
            officer: document.getElementById("record-officer").value.trim(),
            responsibleOfficer: document
              .getElementById("record-officer")
              .value.trim(),
            responsibleCategory: document.getElementById(
              "record-responsible-category",
            ).value,
          },
          "Rekam medis tersimpan.",
        );
      }
      function syncMedQtyLimit() {
        const medId = document.getElementById("med-id")?.value;
        const qtyInput = document.getElementById("med-qty");
        const med = state.medicines.find((m) => m.id === medId);
        if (!qtyInput || !med) return;
        qtyInput.max = String(med.stock);
        const current = Number(qtyInput.value || 1);
        if (current > Number(med.stock)) qtyInput.value = med.stock;
      }
      async function giveMedicine(event) {
        event.preventDefault();
        const item = state.selectedAdmissionDetail;
        const medId = document.getElementById("med-id")?.value;
        const qty = Number(document.getElementById("med-qty")?.value || 0);
        const officer =
          document.getElementById("med-officer")?.value.trim() ||
          state.currentUser?.name ||
          "Admin";
        const med = state.medicines.find((m) => m.id === medId);
        if (!item || !medId || !med)
          return alert(
            "Tidak ada obat pada kategori ini. Pilih kategori lain atau tambahkan obat di inventori.",
          );
        if (!Number.isInteger(qty) || qty < 1)
          return alert("Jumlah obat harus berupa angka bulat minimal 1.");
        if (qty > Number(med.stock))
          return alert(
            `Jumlah obat melebihi stok tersedia. Stok ${med.name} saat ini ${med.stock}.`,
          );

        try {
          let result = await apiRequest("giveMedicine", {
            admissionId: item.id,
            medicineId: medId,
            qty,
            officer,
            responsibleOfficer: officer,
          });
          if (result.data) applyServerData(result.data);

          result = await apiRequest("completeAdmission", { id: item.id });
          if (result.data) applyServerData(result.data);

          await syncAdminAfterMutation("completeAdmission");
          state.error = "";
          state.success =
            "Pemberian obat berhasil dicatat. Pasien otomatis dipindahkan dari antrian aktif.";
          render();
          setTimeout(() => {
            state.success = "";
            render();
          }, 2200);
        } catch (error) {
          state.error = error.message;
          render();
        }
      }
      async function saveReferral() {
        const item = state.selectedAdmissionDetail;
        const hospital = document.getElementById("ref-hospital").value.trim();
        const reason = document.getElementById("ref-reason").value.trim();
        const officer =
          document.getElementById("ref-officer")?.value.trim() ||
          state.currentUser?.name ||
          "Admin";
        if (!item) return;
        if (!hospital || !reason)
          return alert("Lengkapi RS tujuan dan alasan rujukan.");
        await runAction(
          "saveReferral",
          {
            id: item.id,
            hospital,
            reason,
            officer,
            responsibleOfficer: officer,
          },
          "Rujukan tersimpan.",
        );
      }
      function printReferral() {
        const item = state.selectedAdmissionDetail;
        if (!item) return;
        const hospital =
          document.getElementById("ref-hospital").value.trim() ||
          item.referral?.hospital ||
          "-";
        const reason =
          document.getElementById("ref-reason").value.trim() ||
          item.referral?.reason ||
          "-";
        const officer =
          document.getElementById("ref-officer")?.value.trim() ||
          item.referral?.officer ||
          state.currentUser?.name ||
          "-";
        const referral = item.referral || {
          hospital,
          reason,
          diagnosis: item.diagnosis,
          date: new Date().toISOString(),
          officer,
        };
        const win = window.open("", "_blank");
        if (!win)
          return alert(
            "Popup diblokir browser. Izinkan popup untuk mencetak PDF rujukan.",
          );
        win.document.write(
          `<!doctype html><html><head><title>Rujukan ${escapeHtml(item.id)}</title><style>body{font-family:Arial,sans-serif;padding:40px;line-height:1.6;color:#0f172a}.box{border:1px solid #d1d5db;border-radius:16px;padding:24px}h1{text-align:center}table{width:100%;border-collapse:collapse;margin-top:20px}td{padding:8px;border-bottom:1px solid #e5e7eb}.sign{margin-top:60px;text-align:right}</style></head><body><h1>Surat Rujukan Eksternal UMN Medic</h1><div class="box"><table><tr><td>ID Admisi</td><td>${escapeHtml(item.id)}</td></tr><tr><td>Nama Pasien</td><td>${escapeHtml(item.patientName)}</td></tr><tr><td>NIM/NIK</td><td>${escapeHtml(item.nim_nik)}</td></tr><tr><td>Diagnosis</td><td>${escapeHtml(referral.diagnosis || item.diagnosis || "-")}</td></tr><tr><td>RS / Klinik Tujuan</td><td>${escapeHtml(hospital)}</td></tr><tr><td>Alasan Rujukan</td><td>${escapeHtml(reason)}</td></tr><tr><td>Tanggal</td><td>${formatDateTime(referral.date)}</td></tr><tr><td>Penanggung Jawab</td><td>${escapeHtml(officer)}</td></tr></table><div class="sign"><p>Petugas UMN Medic</p><br><br><p>${escapeHtml(officer)}</p></div></div></body></html>`,
        );
        win.document.close();
        win.focus();
        win.print();
      }
      async function updateStock(id, delta) {
        await runAction(
          "updateStock",
          { id, delta },
          "Stok obat berhasil diperbarui.",
        );
      }

      async function addStock(id) {
        const input = document.getElementById(`stock-add-${id}`);
        const qty = Number(input?.value || 0);
        if (!Number.isInteger(qty) || qty < 1)
          return alert("Masukkan jumlah stok berupa angka bulat minimal 1.");
        await runAction(
          "updateStock",
          { id, delta: qty },
          "Stok obat berhasil ditambahkan.",
        );
      }

      async function addMedicine(event) {
        event.preventDefault();
        const stock = Number(
          document.getElementById("new-med-stock").value || 0,
        );
        const minStock = Number(
          document.getElementById("new-med-min").value || 0,
        );
        const receivedAt = document.getElementById("new-med-received").value;
        const expired = document.getElementById("new-med-expired").value;
        if (!Number.isInteger(stock) || stock < 0)
          return alert("Stok awal harus berupa angka bulat minimal 0.");
        if (!Number.isInteger(minStock) || minStock < 0)
          return alert("Minimal stok harus berupa angka bulat minimal 0.");
        if (isAfterToday(receivedAt))
          return alert("Tanggal masuk obat tidak boleh melebihi hari ini.");
        if (isBeforeToday(expired))
          return alert(
            "Tanggal kedaluwarsa tidak boleh tanggal yang sudah lewat. Masukkan tanggal hari ini atau tanggal setelah hari ini.",
          );
        await runAction(
          "addMedicine",
          {
            name: document.getElementById("new-med-name").value.trim(),
            categoryId: document.getElementById("new-med-category").value,
            stock,
            minStock,
            receivedAt,
            receivedDate: receivedAt,
            expired,
          },
          "Obat baru berhasil ditambahkan.",
        );
      }

      function runSelfTests() {
        console.assert(
          availableBeds("L").length === 2,
          "Test gagal: ranjang L tersedia harus 2",
        );
        console.assert(
          availableBeds("P").length === 3,
          "Test gagal: ranjang P tersedia harus 3",
        );
        console.assert(
          triageTone("Merah") === "rose",
          "Test gagal: tone triage merah",
        );
        console.assert(
          categoryLabel("batuk-flu") === "Batuk / Flu",
          "Test gagal: label kategori",
        );
        console.assert(
          medsByCategory("maag-mual").length >= 1,
          "Test gagal: filter obat kategori maag",
        );
        console.assert(
          stockStatus({ stock: 5, minStock: 10, expired: "2027-01-01" }) ===
            "Stok rendah",
          "Test gagal: stok rendah",
        );
      }

      async function initApp() {
        render();
        await loadData();
        if (!state.error) runSelfTests();
      }

      initApp();