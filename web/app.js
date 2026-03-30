const STORE_KEY = "hanji_hospital_system_v1";

const state = {
  data: loadData(),
  billPreview: null,
  lastRegistrationId: "",
  lastBillingId: ""
};

function loadData() {
  const raw = localStorage.getItem(STORE_KEY);
  if (raw) {
    try {
      return normalizeData(JSON.parse(raw));
    } catch (_err) {
      return createSeedData();
    }
  }
  const seed = createSeedData();
  localStorage.setItem(STORE_KEY, JSON.stringify(seed));
  return seed;
}

function normalizeData(data) {
  const safe = { ...createSeedData(), ...data };
  safe.patients = (safe.patients || []).map((p) => ({
    healthCardNo: "",
    ...p
  }));
  return safe;
}

function saveData() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state.data));
}

function createSeedData() {
  const departments = [
    { id: "d1", name: "內科" },
    { id: "d2", name: "外科" },
    { id: "d3", name: "皮膚科" },
    { id: "d4", name: "眼科" },
    { id: "d5", name: "牙科" },
    { id: "d6", name: "小兒科" },
    { id: "d7", name: "婦產科" }
  ];

  const timeSlots = [
    { id: "t1", name: "上午 (09:00-12:00)" },
    { id: "t2", name: "下午 (14:00-17:00)" },
    { id: "t3", name: "晚上 (18:30-21:30)" }
  ];

  const doctors = [
    { id: "doc1", name: "趙一 (內科)", departmentId: "d1" },
    { id: "doc2", name: "錢二 (內科)", departmentId: "d1" },
    { id: "doc3", name: "孫三 (外科)", departmentId: "d2" },
    { id: "doc4", name: "李四 (外科)", departmentId: "d2" },
    { id: "doc5", name: "周五 (皮膚科)", departmentId: "d3" },
    { id: "doc6", name: "吳六 (皮膚科)", departmentId: "d3" },
    { id: "doc7", name: "鄭七 (眼科)", departmentId: "d4" },
    { id: "doc8", name: "王八 (眼科)", departmentId: "d4" },
    { id: "doc9", name: "馮九 (牙科)", departmentId: "d5" },
    { id: "doc10", name: "陳十 (牙科)", departmentId: "d5" },
    { id: "doc11", name: "黃十一 (小兒科)", departmentId: "d6" },
    { id: "doc12", name: "張十二 (小兒科)", departmentId: "d6" },
    { id: "doc13", name: "林十三 (婦產科)", departmentId: "d7" },
    { id: "doc14", name: "劉十四 (婦產科)", departmentId: "d7" }
  ];

  const doctorSchedules = [];
  doctors.forEach((doc) => {
    timeSlots.forEach((slot) => {
      doctorSchedules.push({
        id: uid("sch"),
        doctorId: doc.id,
        timeSlotId: slot.id
      });
    });
  });

  return {
    meta: { appName: "憨吉聯合大醫院系統", version: "1.0.0" },
    config: { beginNumber: 1, preLimit: 99, totalLimit: 99, numberMethod: "1" },
    campuses: [
      { id: "cp1", name: "中央院區" },
      { id: "cp2", name: "介仁院區" },
      { id: "cp3", name: "建國院區" }
    ],
    cities: [
      { id: "c1", name: "臺北市", districts: ["中正區", "大同區", "中山區", "松山區", "大安區", "信義區"] },
      { id: "c2", name: "新北市", districts: ["板橋區", "三重區", "中和區", "永和區", "新莊區", "新店區"] },
      { id: "c3", name: "桃園市", districts: ["桃園區", "中壢區", "平鎮區", "八德區"] },
      { id: "c4", name: "臺中市", districts: ["中區", "東區", "南區", "西區", "北區", "西屯區", "南屯區"] },
      { id: "c5", name: "臺南市", districts: ["東區", "南區", "中西區", "北區", "安平區"] },
      { id: "c6", name: "高雄市", districts: ["鹽埕區", "鼓山區", "左營區", "楠梓區", "三民區", "新興區"] }
    ],
    departments,
    timeSlots,
    doctors,
    doctorSchedules,
    scheduleRules: [],
    patients: [],
    registrations: [],
    orders: [],
    billings: [],
    announcements: [],
    events: []
  };
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(input) {
  return String(input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function byId(id) {
  return document.getElementById(id);
}

function hasId(id) {
  return Boolean(byId(id));
}

function setOptions(selectEl, options, placeholder = "請選擇") {
  if (!selectEl) return;
  const html = [`<option value="">${placeholder}</option>`]
    .concat(options.map((o) => `<option value="${o.value}">${escapeHtml(o.label)}</option>`))
    .join("");
  selectEl.innerHTML = html;
}

function formatDate(date = new Date()) {
  return new Date(date).toISOString().slice(0, 10);
}

function showToast(message) {
  const el = byId("toast");
  el.textContent = message;
  el.style.display = "block";
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    el.style.display = "none";
  }, 2000);
}

function logEvent(type, detail) {
  state.data.events.unshift({
    id: uid("evt"),
    type,
    detail,
    timestamp: new Date().toISOString()
  });
  state.data.events = state.data.events.slice(0, 5000);
}

function resolvePatient(registration) {
  return state.data.patients.find((p) => p.id === registration.patientId);
}

function resolveDoctor(id) {
  return state.data.doctors.find((d) => d.id === id);
}

function resolveDepartment(id) {
  return state.data.departments.find((d) => d.id === id);
}

function resolveTimeSlot(id) {
  return state.data.timeSlots.find((t) => t.id === id);
}

function calculateAgeByRocBirth(rocBirth) {
  if (!/^\d{7}$/.test(rocBirth)) return "";
  const rocYear = Number(rocBirth.slice(0, 3));
  if (Number.isNaN(rocYear)) return "";
  const year = rocYear + 1911;
  const age = new Date().getFullYear() - year;
  return age >= 0 && age < 150 ? String(age) : "";
}

function getDepartmentIdByDoctor(doctorId) {
  const doctor = resolveDoctor(doctorId);
  return doctor ? doctor.departmentId : "";
}

function getDoctorsByDepartmentAndTime(departmentId, timeSlotId) {
  const allowedDoctorIds = new Set(
    state.data.doctorSchedules
      .filter((s) => s.timeSlotId === timeSlotId)
      .map((s) => s.doctorId)
  );
  return state.data.doctors.filter(
    (d) => d.departmentId === departmentId && allowedDoctorIds.has(d.id)
  );
}

function getNextMedicalRecordNo() {
  const maxValue = state.data.patients.reduce((max, patient) => {
    const value = Number(patient.medicalRecordNo || 0);
    return Number.isNaN(value) ? max : Math.max(max, value);
  }, 0);
  return String(maxValue + 1).padStart(3, "0");
}

function getNextRegNumber(doctorId, timeSlotId, regDate) {
  const activeCount = state.data.registrations.filter(
    (r) =>
      r.status === "active" &&
      r.doctorId === doctorId &&
      r.timeSlotId === timeSlotId &&
      r.regDate === regDate
  ).length;
  const beginNo = Number(state.data.config.beginNumber || 1);
  return beginNo + activeCount;
}

function bindTabEvents() {
  const tabs = document.querySelectorAll(".tab");
  if (!tabs.length) return;
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
      tab.classList.add("active");
      const view = byId(`view-${tab.dataset.view}`);
      if (view) view.classList.add("active");
      if (tab.dataset.view === "reports") renderReports();
    });
  });
}

function bindRegistrationEvents() {
  if (!hasId("reg-birth")) return;
  byId("reg-birth").addEventListener("input", (event) => {
    byId("reg-age").value = calculateAgeByRocBirth(event.target.value.trim());
  });

  byId("reg-city").addEventListener("change", renderDistrictOptions);

  byId("reg-department").addEventListener("change", renderRegistrationDoctorOptions);
  byId("reg-timeslot").addEventListener("change", renderRegistrationDoctorOptions);
  byId("reg-doctor").addEventListener("change", updateRegistrationNumberPreview);
  byId("reg-date").addEventListener("change", updateRegistrationNumberPreview);

  byId("btn-check-patient").addEventListener("click", () => {
    const nationalId = byId("reg-national-id").value.trim();
    if (!nationalId) {
      showToast("請先輸入身分證/居留證號");
      return;
    }
    const patient = state.data.patients.find((p) => p.nationalId === nationalId);
    if (!patient) {
      clearRegistrationPatientFields();
      showToast("查無病患，請輸入初診資料");
      return;
    }
    byId("reg-medical-no").value = patient.medicalRecordNo;
    byId("reg-name").value = patient.name;
    if (hasId("reg-health-card")) byId("reg-health-card").value = patient.healthCardNo || "";
    byId("reg-gender").value = patient.gender || "";
    byId("reg-birth").value = patient.birthDate || "";
    byId("reg-age").value = patient.age || "";
    byId("reg-phone").value = patient.phone || "";
    byId("reg-city").value = patient.city || "";
    renderDistrictOptions();
    byId("reg-district").value = patient.district || "";
    byId("reg-address").value = patient.address || "";
    showToast("已帶入病患資料");
  });

  byId("btn-register").addEventListener("click", () => {
    const nationalId = byId("reg-national-id").value.trim();
    const healthCardNo = hasId("reg-health-card") ? byId("reg-health-card").value.trim() : "";
    const name = byId("reg-name").value.trim();
    const doctorId = byId("reg-doctor").value;
    const timeSlotId = byId("reg-timeslot").value;
    const campusId = hasId("reg-campus") ? byId("reg-campus").value : "";
    const regDate = byId("reg-date").value || formatDate();
    if (!nationalId || !name || !doctorId || !timeSlotId || !campusId) {
      showToast("請填妥病患資料與掛號資訊");
      return;
    }

    let patient = state.data.patients.find((p) => p.nationalId === nationalId);
    const isFirstTime = !patient;
    if (isFirstTime && !healthCardNo) {
      showToast("初診請填寫健保卡號");
      return;
    }
    if (!patient) {
      patient = {
        id: uid("pat"),
        medicalRecordNo: getNextMedicalRecordNo(),
        nationalId,
        healthCardNo,
        name,
        gender: byId("reg-gender").value,
        birthDate: byId("reg-birth").value.trim(),
        age: byId("reg-age").value,
        phone: byId("reg-phone").value.trim(),
        city: byId("reg-city").value,
        district: byId("reg-district").value,
        address: byId("reg-address").value.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      state.data.patients.push(patient);
    } else {
      if (healthCardNo) patient.healthCardNo = healthCardNo;
      patient.name = name;
      patient.gender = byId("reg-gender").value;
      patient.birthDate = byId("reg-birth").value.trim();
      patient.age = byId("reg-age").value;
      patient.phone = byId("reg-phone").value.trim();
      patient.city = byId("reg-city").value;
      patient.district = byId("reg-district").value;
      patient.address = byId("reg-address").value.trim();
      patient.updatedAt = new Date().toISOString();
    }

    const regNumber = getNextRegNumber(doctorId, timeSlotId, regDate);
    const registration = {
      id: uid("reg"),
      patientId: patient.id,
      doctorId,
      departmentId: getDepartmentIdByDoctor(doctorId),
      timeSlotId,
      campusId,
      regDate,
      regNumber,
      isFirstTime,
      status: "active",
      cancelReason: "",
      transferToRegistrationId: "",
      createdAt: new Date().toISOString()
    };
    state.data.registrations.push(registration);
    state.lastRegistrationId = registration.id;
    byId("reg-medical-no").value = patient.medicalRecordNo;
    byId("reg-number").textContent = String(regNumber);

    logEvent("掛號", {
      registrationId: registration.id,
      patientId: patient.id,
      regDate,
      campusId,
      doctorId,
      timeSlotId,
      regNumber
    });
    saveData();
    renderAll();
    showToast("掛號成功");
  });

  byId("btn-print").addEventListener("click", () => {
    printRegistrationSlip();
  });

  byId("btn-clear-registration").addEventListener("click", () => {
    clearRegistrationForm();
    showToast("已清空掛號表單");
  });
}

function clearRegistrationPatientFields() {
  byId("reg-medical-no").value = "";
  if (hasId("reg-health-card")) byId("reg-health-card").value = "";
  byId("reg-name").value = "";
  byId("reg-gender").value = "";
  byId("reg-birth").value = "";
  byId("reg-age").value = "";
  byId("reg-phone").value = "";
  byId("reg-address").value = "";
}

function clearRegistrationForm() {
  byId("reg-national-id").value = "";
  clearRegistrationPatientFields();
  byId("reg-department").value = "";
  byId("reg-timeslot").value = "";
  byId("reg-doctor").value = "";
  byId("reg-number").textContent = "-";
  byId("reg-date").value = formatDate();
}

function updateRegistrationNumberPreview() {
  if (!hasId("reg-doctor") || !hasId("reg-timeslot") || !hasId("reg-date") || !hasId("reg-number")) return;
  const doctorId = byId("reg-doctor").value;
  const timeSlotId = byId("reg-timeslot").value;
  const regDate = byId("reg-date").value || formatDate();
  if (!doctorId || !timeSlotId) {
    byId("reg-number").textContent = "-";
    return;
  }
  byId("reg-number").textContent = String(getNextRegNumber(doctorId, timeSlotId, regDate));
}

function renderDistrictOptions() {
  if (!hasId("reg-city") || !hasId("reg-district")) return;
  const cityName = byId("reg-city").value;
  const city = state.data.cities.find((c) => c.name === cityName);
  const districtEl = byId("reg-district");
  setOptions(
    districtEl,
    (city?.districts || []).map((district) => ({ value: district, label: district })),
    "請選擇行政區"
  );
}

function renderRegistrationDoctorOptions() {
  if (!hasId("reg-department") || !hasId("reg-timeslot") || !hasId("reg-doctor")) return;
  const departmentId = byId("reg-department").value;
  const timeSlotId = byId("reg-timeslot").value;
  const doctors = getDoctorsByDepartmentAndTime(departmentId, timeSlotId);
  setOptions(
    byId("reg-doctor"),
    doctors.map((d) => ({ value: d.id, label: d.name })),
    "請選擇醫師"
  );
  updateRegistrationNumberPreview();
}

function bindLookupEvents() {
  if (!hasId("btn-lookup")) return;
  byId("btn-lookup").addEventListener("click", renderLookupTable);
  byId("lookup-table").addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.dataset.action;
    const id = target.dataset.id;
    if (!action || !id) return;
    const registration = state.data.registrations.find((r) => r.id === id);
    if (!registration) return;

    if (action === "cancel") {
      if (registration.status !== "active") {
        showToast("此掛號已非有效狀態");
        return;
      }
      const reason = window.prompt("請輸入退掛原因", "病患取消");
      registration.status = "cancelled";
      registration.cancelReason = reason || "未填寫";
      registration.cancelledAt = new Date().toISOString();
      logEvent("退掛", { registrationId: id, reason: registration.cancelReason });
      saveData();
      renderAll();
      showToast("退掛完成");
      return;
    }

    if (action === "transfer") {
      const nextDate = window.prompt("請輸入轉掛日期 (YYYY-MM-DD)", formatDate());
      if (!nextDate) return;
      const newReg = {
        ...registration,
        id: uid("reg"),
        regDate: nextDate,
        regNumber: getNextRegNumber(registration.doctorId, registration.timeSlotId, nextDate),
        status: "active",
        createdAt: new Date().toISOString(),
        transferFromRegistrationId: registration.id
      };
      registration.status = "transferred";
      registration.transferToRegistrationId = newReg.id;
      state.data.registrations.push(newReg);
      logEvent("轉掛", { from: registration.id, to: newReg.id, nextDate });
      saveData();
      renderAll();
      showToast("轉掛完成");
    }
  });
}

function bindScheduleEvents() {
  if (!hasId("btn-add-schedule")) return;
  byId("btn-add-schedule").addEventListener("click", () => {
    const doctorId = byId("sch-doctor").value;
    const timeSlotId = byId("sch-timeslot").value;
    if (!doctorId || !timeSlotId) {
      showToast("請選擇醫師與時段");
      return;
    }
    const exists = state.data.doctorSchedules.some(
      (s) => s.doctorId === doctorId && s.timeSlotId === timeSlotId
    );
    if (exists) {
      showToast("排班已存在");
      return;
    }
    state.data.doctorSchedules.push({ id: uid("sch"), doctorId, timeSlotId });
    logEvent("新增排班", { doctorId, timeSlotId });
    saveData();
    renderAll();
    showToast("新增排班成功");
  });

  byId("schedule-table").addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.action !== "delete") return;
    state.data.doctorSchedules = state.data.doctorSchedules.filter((x) => x.id !== target.dataset.id);
    logEvent("刪除排班", { scheduleId: target.dataset.id });
    saveData();
    renderAll();
  });
}

function bindRuleEvents() {
  if (!hasId("btn-add-rule")) return;
  byId("btn-add-rule").addEventListener("click", () => {
    const weekday = byId("rule-weekday").value;
    const doctorId = byId("rule-doctor").value;
    const timeSlotId = byId("rule-timeslot").value;
    const limit = Number(byId("rule-limit").value || 99);
    if (!doctorId || !timeSlotId) {
      showToast("規則排班請先選醫師與時段");
      return;
    }
    state.data.scheduleRules.push({
      id: uid("rule"),
      weekday,
      doctorId,
      timeSlotId,
      limit
    });
    logEvent("新增規則排班", { weekday, doctorId, timeSlotId, limit });
    saveData();
    renderAll();
    showToast("規則排班已新增");
  });

  byId("rule-table").addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.action !== "delete") return;
    state.data.scheduleRules = state.data.scheduleRules.filter((r) => r.id !== target.dataset.id);
    logEvent("刪除規則排班", { id: target.dataset.id });
    saveData();
    renderAll();
  });

  byId("btn-save-config").addEventListener("click", () => {
    state.data.config.beginNumber = Number(byId("cfg-begin-number").value || 1);
    state.data.config.preLimit = Number(byId("cfg-pre-limit").value || 99);
    state.data.config.totalLimit = Number(byId("cfg-total-limit").value || 99);
    state.data.config.numberMethod = byId("cfg-number-method").value;
    logEvent("更新給號設定", { ...state.data.config });
    saveData();
    renderConfigPreview();
    showToast("給號設定已儲存");
  });
}

function bindOrderEvents() {
  if (!hasId("btn-add-order")) return;
  byId("btn-add-order").addEventListener("click", () => {
    const registrationId = byId("order-registration").value;
    const type = byId("order-type").value;
    const name = byId("order-name").value.trim();
    const dose = Number(byId("order-dose").value || 0);
    const freq = Number(byId("order-freq").value || 0);
    const days = Number(byId("order-days").value || 0);
    const price = Number(byId("order-price").value || 0);
    const note = byId("order-note").value.trim();
    if (!registrationId || !name) {
      showToast("請選擇掛號與醫囑名稱");
      return;
    }
    const quantity = Number((dose * freq * days).toFixed(2));
    const order = {
      id: uid("ord"),
      registrationId,
      type,
      name,
      dose,
      freq,
      days,
      quantity,
      price,
      subtotal: Math.round(quantity * price),
      note,
      createdAt: new Date().toISOString()
    };
    state.data.orders.push(order);
    logEvent("新增醫囑", { orderId: order.id, registrationId, type, name, quantity });
    saveData();
    renderAll();
    showToast("醫囑新增成功");
  });

  byId("orders-table").addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.action !== "delete") return;
    state.data.orders = state.data.orders.filter((o) => o.id !== target.dataset.id);
    logEvent("刪除醫囑", { orderId: target.dataset.id });
    saveData();
    renderAll();
  });
}

function calculateBillPayload() {
  if (!hasId("bill-registration")) return null;
  const registrationId = byId("bill-registration").value;
  if (!registrationId) return null;
  const insurance = byId("bill-insurance").value;
  const discount = byId("bill-discount").value;
  const regFee = Number(byId("bill-reg-fee").value || 0);
  const consultFee = Number(byId("bill-consult-fee").value || 0);
  const copay = Number(byId("bill-copay").value || 0);
  const orderAmount = state.data.orders
    .filter((o) => o.registrationId === registrationId)
    .reduce((sum, o) => sum + Number(o.subtotal || 0), 0);
  const coveredOrderAmount = insurance === "健保" ? Math.round(orderAmount * 0.3) : orderAmount;
  const baseAmount = regFee + consultFee + copay + coveredOrderAmount;
  const discountRate = discount === "員工" ? 0.9 : discount === "弱勢" ? 0.8 : 1;
  const total = Math.round(baseAmount * discountRate);
  return {
    registrationId,
    insurance,
    discount,
    regFee,
    consultFee,
    copay,
    orderAmount,
    coveredOrderAmount,
    baseAmount,
    discountRate,
    total
  };
}

function bindBillingEvents() {
  if (!hasId("btn-calc-bill")) return;
  byId("btn-calc-bill").addEventListener("click", () => {
    state.billPreview = calculateBillPayload();
    renderBillPreview();
  });

  byId("btn-confirm-bill").addEventListener("click", () => {
    const payload = state.billPreview || calculateBillPayload();
    if (!payload) {
      showToast("請先選擇掛號紀錄並試算");
      return;
    }
    const billing = {
      id: uid("bill"),
      ...payload,
      paidAt: new Date().toISOString(),
      paymentMethod: "現金"
    };
    state.data.billings.push(billing);
    state.lastBillingId = billing.id;
    logEvent("批價收費", { registrationId: payload.registrationId, total: payload.total });
    state.billPreview = null;
    saveData();
    renderAll();
    showToast("收費完成");
  });

  if (hasId("btn-print-bill")) {
    byId("btn-print-bill").addEventListener("click", () => {
      printBillingReceipt();
    });
  }
}

function bindAnnouncementEvents() {
  if (!hasId("btn-add-ann")) return;
  byId("btn-add-ann").addEventListener("click", () => {
    const title = byId("ann-title").value.trim();
    const content = byId("ann-content").value.trim();
    if (!title || !content) {
      showToast("公告標題與內容不可空白");
      return;
    }
    state.data.announcements.unshift({
      id: uid("ann"),
      title,
      content,
      createdAt: new Date().toISOString()
    });
    logEvent("發布公告", { title });
    saveData();
    byId("ann-title").value = "";
    byId("ann-content").value = "";
    renderAnnouncementTable();
    showToast("公告已發布");
  });

  byId("ann-table").addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.action !== "delete") return;
    state.data.announcements = state.data.announcements.filter((a) => a.id !== target.dataset.id);
    saveData();
    renderAnnouncementTable();
  });
}

function bindDepartmentEvents() {
  if (!hasId("btn-add-department")) return;

  byId("btn-add-department").addEventListener("click", () => {
    const name = byId("dept-name").value.trim();
    if (!name) {
      showToast("請輸入科別名稱");
      return;
    }
    state.data.departments.push({ id: uid("d"), name });
    byId("dept-name").value = "";
    logEvent("新增科別", { name });
    saveData();
    renderAll();
    showToast("科別已新增");
  });

  byId("btn-add-doctor").addEventListener("click", () => {
    const name = byId("dept-doctor-name").value.trim();
    const departmentId = byId("dept-doctor-department").value;
    if (!name || !departmentId) {
      showToast("請輸入醫師名稱並選擇科別");
      return;
    }
    state.data.doctors.push({ id: uid("doc"), name, departmentId });
    byId("dept-doctor-name").value = "";
    logEvent("新增醫師", { name, departmentId });
    saveData();
    renderAll();
    showToast("醫師已新增");
  });

  byId("departments-table").addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.action !== "delete-department") return;
    const departmentId = target.dataset.id;
    const hasDoctors = state.data.doctors.some((d) => d.departmentId === departmentId);
    if (hasDoctors) {
      showToast("此科別仍有醫師，請先刪除醫師");
      return;
    }
    state.data.departments = state.data.departments.filter((d) => d.id !== departmentId);
    logEvent("刪除科別", { departmentId });
    saveData();
    renderAll();
    showToast("科別已刪除");
  });

  byId("doctors-table").addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.action !== "delete-doctor") return;
    const doctorId = target.dataset.id;
    const hasRegistrations = state.data.registrations.some((r) => r.doctorId === doctorId);
    if (hasRegistrations) {
      showToast("此醫師已有掛號紀錄，不能刪除");
      return;
    }
    state.data.doctors = state.data.doctors.filter((d) => d.id !== doctorId);
    state.data.doctorSchedules = state.data.doctorSchedules.filter((s) => s.doctorId !== doctorId);
    state.data.scheduleRules = state.data.scheduleRules.filter((r) => r.doctorId !== doctorId);
    logEvent("刪除醫師", { doctorId });
    saveData();
    renderAll();
    showToast("醫師已刪除");
  });
}

function bindSystemButtons() {
  if (!hasId("btn-export")) return;
  byId("btn-export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `hanji-hospital-${formatDate()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  });

  byId("import-file").addEventListener("change", (event) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        state.data = JSON.parse(String(reader.result));
        saveData();
        renderAll();
        showToast("資料匯入成功");
      } catch (_err) {
        showToast("匯入失敗，JSON 格式錯誤");
      } finally {
        input.value = "";
      }
    };
    reader.readAsText(file);
  });

  byId("btn-reset").addEventListener("click", () => {
    if (!window.confirm("確定要重置所有資料？")) return;
    state.data = createSeedData();
    state.billPreview = null;
    saveData();
    renderAll();
    showToast("資料已重置");
  });
}

function bindProfileManagementEvents() {
  if (!hasId("btn-verify-profile")) return;

  if (hasId("profile-birth")) {
    byId("profile-birth").addEventListener("input", (event) => {
      byId("profile-age").value = calculateAgeByRocBirth(event.target.value.trim());
    });
  }

  if (hasId("profile-city")) {
    byId("profile-city").addEventListener("change", () => {
      const cityName = byId("profile-city").value;
      const city = state.data.cities.find((c) => c.name === cityName);
      setOptions(
        byId("profile-district"),
        (city?.districts || []).map((district) => ({ value: district, label: district })),
        "請選擇行政區"
      );
    });
  }

  byId("btn-verify-profile").addEventListener("click", () => {
    const nationalId = byId("verify-national-id").value.trim();
    const healthCardNo = byId("verify-health-card").value.trim();
    if (!nationalId || !healthCardNo) {
      showToast("請輸入身分證號與健保卡號");
      return;
    }
    const patient = state.data.patients.find(
      (p) => p.nationalId === nationalId && (p.healthCardNo || "") === healthCardNo
    );
    if (!patient) {
      showToast("驗證失敗，請確認身分證號與健保卡號");
      return;
    }
    byId("profile-medical-no").value = patient.medicalRecordNo || "";
    byId("profile-name").value = patient.name || "";
    byId("profile-national-id").value = patient.nationalId || "";
    byId("profile-health-card").value = patient.healthCardNo || "";
    byId("profile-gender").value = patient.gender || "";
    byId("profile-birth").value = patient.birthDate || "";
    byId("profile-age").value = patient.age || "";
    byId("profile-phone").value = patient.phone || "";
    byId("profile-city").value = patient.city || "";
    const city = state.data.cities.find((c) => c.name === (patient.city || ""));
    setOptions(
      byId("profile-district"),
      (city?.districts || []).map((district) => ({ value: district, label: district })),
      "請選擇行政區"
    );
    byId("profile-district").value = patient.district || "";
    byId("profile-address").value = patient.address || "";
    byId("btn-save-profile").dataset.patientId = patient.id;
    showToast("驗證成功，可編輯資料");
  });

  byId("btn-save-profile").addEventListener("click", () => {
    const patientId = byId("btn-save-profile").dataset.patientId;
    if (!patientId) {
      showToast("請先完成驗證");
      return;
    }
    const patient = state.data.patients.find((p) => p.id === patientId);
    if (!patient) {
      showToast("找不到病患資料");
      return;
    }
    patient.name = byId("profile-name").value.trim();
    patient.healthCardNo = byId("profile-health-card").value.trim();
    patient.gender = byId("profile-gender").value;
    patient.birthDate = byId("profile-birth").value.trim();
    patient.age = byId("profile-age").value;
    patient.phone = byId("profile-phone").value.trim();
    patient.city = byId("profile-city").value;
    patient.district = byId("profile-district").value;
    patient.address = byId("profile-address").value.trim();
    patient.updatedAt = new Date().toISOString();
    saveData();
    renderAll();
    showToast("個人資料已更新");
  });
}

function renderLookupTable() {
  if (!hasId("lookup-table")) return;
  const keyword = byId("lookup-keyword").value.trim();
  const date = byId("lookup-date").value;
  const rows = state.data.registrations
    .filter((r) => {
      const patient = resolvePatient(r);
      const matchedKeyword =
        !keyword ||
        patient?.name?.includes(keyword) ||
        patient?.nationalId?.includes(keyword) ||
        patient?.medicalRecordNo?.includes(keyword);
      const matchedDate = !date || r.regDate === date;
      return matchedKeyword && matchedDate;
    })
    .sort((a, b) => (a.regDate > b.regDate ? -1 : 1))
    .map((r) => {
      const patient = resolvePatient(r);
      const doctor = resolveDoctor(r.doctorId);
      const slot = resolveTimeSlot(r.timeSlotId);
      const campus = (state.data.campuses || []).find((c) => c.id === r.campusId);
      return `
      <tr>
        <td>${escapeHtml(r.regDate)}</td>
        <td>${escapeHtml(campus?.name || "-")}</td>
        <td>${escapeHtml(patient?.medicalRecordNo || "")}</td>
        <td>${escapeHtml(patient?.name || "")}</td>
        <td>${escapeHtml(patient?.nationalId || "")}</td>
        <td>${escapeHtml(doctor?.name || "")}</td>
        <td>${escapeHtml(slot?.name || "")}</td>
        <td>${escapeHtml(r.regNumber)}</td>
        <td>${escapeHtml(r.status)}</td>
        <td>${escapeHtml(r.cancelReason || "")}</td>
        <td>
          <button data-action="cancel" data-id="${r.id}">退掛</button>
          <button data-action="transfer" data-id="${r.id}">轉掛</button>
        </td>
      </tr>`;
    })
    .join("");

  byId("lookup-table").innerHTML = `
    <thead>
      <tr>
        <th>日期</th><th>院區</th><th>病歷號</th><th>姓名</th><th>身分證</th><th>醫師</th>
        <th>時段</th><th>號碼</th><th>狀態</th><th>退掛原因</th><th>操作</th>
      </tr>
    </thead>
    <tbody>${rows || "<tr><td colspan='11'>無資料</td></tr>"}</tbody>
  `;
}

function renderScheduleTable() {
  if (!hasId("schedule-table")) return;
  const rows = state.data.doctorSchedules
    .map((s) => {
      const doctor = resolveDoctor(s.doctorId);
      const department = resolveDepartment(doctor?.departmentId);
      const slot = resolveTimeSlot(s.timeSlotId);
      return `
      <tr>
        <td>${escapeHtml(s.id)}</td>
        <td>${escapeHtml(doctor?.name || "")}</td>
        <td>${escapeHtml(department?.name || "")}</td>
        <td>${escapeHtml(slot?.name || "")}</td>
        <td><button data-action="delete" data-id="${s.id}">刪除</button></td>
      </tr>`;
    })
    .join("");
  byId("schedule-table").innerHTML = `
    <thead><tr><th>排班代碼</th><th>醫師</th><th>科別</th><th>時段</th><th>操作</th></tr></thead>
    <tbody>${rows || "<tr><td colspan='5'>無資料</td></tr>"}</tbody>
  `;
}

function renderRuleTable() {
  if (!hasId("rule-table")) return;
  const weekdayMap = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const rows = state.data.scheduleRules
    .map((rule) => `
      <tr>
        <td>${escapeHtml(weekdayMap[Number(rule.weekday)] || "")}</td>
        <td>${escapeHtml(resolveDoctor(rule.doctorId)?.name || "")}</td>
        <td>${escapeHtml(resolveTimeSlot(rule.timeSlotId)?.name || "")}</td>
        <td>${escapeHtml(rule.limit)}</td>
        <td><button data-action="delete" data-id="${rule.id}">刪除</button></td>
      </tr>
    `)
    .join("");
  byId("rule-table").innerHTML = `
    <thead><tr><th>星期</th><th>醫師</th><th>時段</th><th>限掛</th><th>操作</th></tr></thead>
    <tbody>${rows || "<tr><td colspan='5'>尚未設定規則排班</td></tr>"}</tbody>
  `;
}

function renderConfigPreview() {
  if (!hasId("cfg-preview")) return;
  byId("cfg-preview").textContent = JSON.stringify(state.data.config, null, 2);
}

function renderPatientsTable() {
  if (!hasId("patients-table")) return;
  const rows = state.data.patients
    .map((p) => {
      const latest = state.data.registrations
        .filter((r) => r.patientId === p.id)
        .sort((a, b) => (a.regDate > b.regDate ? -1 : 1))[0];
      return `
      <tr>
        <td>${escapeHtml(p.medicalRecordNo)}</td>
        <td>${escapeHtml(p.nationalId)}</td>
        <td>${escapeHtml(p.healthCardNo || "-")}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(p.gender)}</td>
        <td>${escapeHtml(p.birthDate)}</td>
        <td>${escapeHtml(p.phone)}</td>
        <td>${escapeHtml(`${p.city || ""}${p.district || ""}${p.address || ""}`)}</td>
        <td>${escapeHtml(latest?.regDate || "-")}</td>
      </tr>`;
    })
    .join("");
  byId("patients-table").innerHTML = `
    <thead><tr>
      <th>病歷號</th><th>身分證</th><th>健保卡號</th><th>姓名</th><th>性別</th><th>生日</th><th>電話</th><th>地址</th><th>最近掛號日</th>
    </tr></thead>
    <tbody>${rows || "<tr><td colspan='9'>無病患資料</td></tr>"}</tbody>
  `;
}

function renderOrdersTable() {
  if (!hasId("orders-table")) return;
  const rows = state.data.orders
    .map((o) => {
      const registration = state.data.registrations.find((r) => r.id === o.registrationId);
      const patient = registration ? resolvePatient(registration) : null;
      return `
      <tr>
        <td>${escapeHtml(o.type)}</td>
        <td>${escapeHtml(o.name)}</td>
        <td>${escapeHtml(patient?.name || "")}</td>
        <td>${escapeHtml(o.quantity)}</td>
        <td>${escapeHtml(o.price)}</td>
        <td>${escapeHtml(o.subtotal)}</td>
        <td>${escapeHtml(o.note || "")}</td>
        <td><button data-action="delete" data-id="${o.id}">刪除</button></td>
      </tr>`;
    })
    .join("");
  byId("orders-table").innerHTML = `
    <thead><tr><th>類型</th><th>醫囑名稱</th><th>病患</th><th>總量</th><th>單價</th><th>小計</th><th>備註</th><th>操作</th></tr></thead>
    <tbody>${rows || "<tr><td colspan='8'>無醫囑資料</td></tr>"}</tbody>
  `;
}

function renderBillPreview() {
  if (!hasId("bill-preview")) return;
  const payload = state.billPreview;
  if (!payload) {
    byId("bill-preview").textContent = "尚未試算";
    return;
  }
  byId("bill-preview").textContent =
    `掛號費: ${payload.regFee}\n` +
    `診察費: ${payload.consultFee}\n` +
    `部份負擔: ${payload.copay}\n` +
    `醫囑原始金額: ${payload.orderAmount}\n` +
    `${payload.insurance}自付醫囑金額: ${payload.coveredOrderAmount}\n` +
    `折扣別: ${payload.discount}\n` +
    `總計: ${payload.total}`;
}

function renderBillingTable() {
  if (!hasId("billing-table")) return;
  const rows = state.data.billings
    .map((b) => {
      const reg = state.data.registrations.find((r) => r.id === b.registrationId);
      const patient = reg ? resolvePatient(reg) : null;
      return `
      <tr>
        <td>${escapeHtml(patient?.name || "")}</td>
        <td>${escapeHtml(b.insurance)}</td>
        <td>${escapeHtml(b.discount)}</td>
        <td>${escapeHtml(b.total)}</td>
        <td>${escapeHtml(new Date(b.paidAt).toLocaleString())}</td>
      </tr>`;
    })
    .join("");
  byId("billing-table").innerHTML = `
    <thead><tr><th>病患</th><th>身份別</th><th>折扣別</th><th>收費總額</th><th>時間</th></tr></thead>
    <tbody>${rows || "<tr><td colspan='5'>尚無收費資料</td></tr>"}</tbody>
  `;
}

function renderReports() {
  if (!hasId("report-cards")) return;
  const activeRegs = state.data.registrations.filter((r) => r.status === "active");
  const totalRevenue = state.data.billings.reduce((sum, b) => sum + Number(b.total || 0), 0);
  byId("report-cards").innerHTML = `
    <div class="stat"><div>有效掛號</div><strong>${activeRegs.length}</strong></div>
    <div class="stat"><div>病患總數</div><strong>${state.data.patients.length}</strong></div>
    <div class="stat"><div>醫囑總數</div><strong>${state.data.orders.length}</strong></div>
    <div class="stat"><div>收費總額</div><strong>${totalRevenue}</strong></div>
  `;

  const deptRows = state.data.departments
    .map((dept) => {
      const count = activeRegs.filter((r) => r.departmentId === dept.id).length;
      return `<tr><td>${escapeHtml(dept.name)}</td><td>${count}</td></tr>`;
    })
    .join("");
  byId("report-dept-table").innerHTML = `
    <thead><tr><th>科別</th><th>掛號人數</th></tr></thead>
    <tbody>${deptRows || "<tr><td colspan='2'>無資料</td></tr>"}</tbody>
  `;

  const doctorRows = state.data.doctors
    .map((doc) => {
      const regIds = state.data.registrations
        .filter((r) => r.doctorId === doc.id)
        .map((r) => r.id);
      const regCount = regIds.length;
      const revenue = state.data.billings
        .filter((b) => regIds.includes(b.registrationId))
        .reduce((sum, b) => sum + Number(b.total || 0), 0);
      return `<tr><td>${escapeHtml(doc.name)}</td><td>${regCount}</td><td>${revenue}</td></tr>`;
    })
    .join("");
  byId("report-doctor-table").innerHTML = `
    <thead><tr><th>醫師</th><th>掛號量</th><th>收入</th></tr></thead>
    <tbody>${doctorRows || "<tr><td colspan='3'>無資料</td></tr>"}</tbody>
  `;
}

function renderAnnouncementTable() {
  if (!hasId("ann-table")) return;
  const rows = state.data.announcements
    .map(
      (a) => `<tr>
        <td>${escapeHtml(new Date(a.createdAt).toLocaleString())}</td>
        <td>${escapeHtml(a.title)}</td>
        <td>${escapeHtml(a.content)}</td>
        <td><button data-action="delete" data-id="${a.id}">刪除</button></td>
      </tr>`
    )
    .join("");
  byId("ann-table").innerHTML = `
    <thead><tr><th>時間</th><th>標題</th><th>內容</th><th>操作</th></tr></thead>
    <tbody>${rows || "<tr><td colspan='4'>尚無公告</td></tr>"}</tbody>
  `;
}

function renderDepartmentTable() {
  if (!hasId("departments-table")) return;
  const rows = state.data.departments
    .map((dept) => {
      const doctors = state.data.doctors
        .filter((d) => d.departmentId === dept.id)
        .map((d) => d.name)
        .join("、");
      return `<tr>
        <td>${escapeHtml(dept.name)}</td>
        <td>${escapeHtml(doctors || "-")}</td>
        <td><button data-action="delete-department" data-id="${dept.id}">刪除科別</button></td>
      </tr>`;
    })
    .join("");
  byId("departments-table").innerHTML = `
    <thead><tr><th>科別名稱</th><th>所屬醫師</th><th>操作</th></tr></thead>
    <tbody>${rows || "<tr><td colspan='3'>無科別資料</td></tr>"}</tbody>
  `;

  if (hasId("doctors-table")) {
    const doctorRows = state.data.doctors
      .map((doctor) => `<tr>
        <td>${escapeHtml(doctor.name)}</td>
        <td>${escapeHtml(resolveDepartment(doctor.departmentId)?.name || "")}</td>
        <td><button data-action="delete-doctor" data-id="${doctor.id}">刪除醫師</button></td>
      </tr>`)
      .join("");
    byId("doctors-table").innerHTML = `
      <thead><tr><th>醫師姓名</th><th>科別</th><th>操作</th></tr></thead>
      <tbody>${doctorRows || "<tr><td colspan='3'>無醫師資料</td></tr>"}</tbody>
    `;
  }
}

function openPrintWindow(title, bodyHtml) {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    showToast("瀏覽器阻擋彈窗，請允許後再試");
    return;
  }
  win.document.write(`<!doctype html>
<html lang="zh-Hant"><head><meta charset="UTF-8" /><title>${escapeHtml(title)}</title>
<style>
body{font-family:"Microsoft JhengHei",sans-serif;padding:24px;color:#1f2937}
.paper{border:2px solid #111827;padding:20px;max-width:760px;margin:0 auto}
h1{margin:0 0 6px;font-size:24px}
h2{margin:0 0 16px;font-size:18px}
table{border-collapse:collapse;width:100%;margin-top:10px}
th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}
.meta{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.number{font-size:40px;color:#b91c1c;font-weight:700}
.footer{margin-top:18px;font-size:12px;color:#475569}
</style></head><body>${bodyHtml}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
}

function printRegistrationSlip() {
  const registrationId =
    state.lastRegistrationId ||
    (hasId("reg-doctor")
      ? state.data.registrations
          .filter((r) => r.status === "active")
          .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))[0]?.id
      : "");
  if (!registrationId) {
    showToast("目前沒有可列印的掛號紀錄");
    return;
  }
  const reg = state.data.registrations.find((r) => r.id === registrationId);
  if (!reg) return;
  const patient = resolvePatient(reg);
  const doctor = resolveDoctor(reg.doctorId);
  const dept = resolveDepartment(reg.departmentId);
  const slot = resolveTimeSlot(reg.timeSlotId);
  const campus = (state.data.campuses || []).find((c) => c.id === reg.campusId);
  const html = `
    <div class="paper">
      <h1>憨吉聯合大醫院</h1>
      <h2>門診掛號單</h2>
      <div class="meta">
        <div>掛號日期：${escapeHtml(reg.regDate)}</div>
        <div>院區：${escapeHtml(campus?.name || "-")}</div>
        <div>病歷號：${escapeHtml(patient?.medicalRecordNo || "")}</div>
        <div>姓名：${escapeHtml(patient?.name || "")}</div>
        <div>身分證：${escapeHtml(patient?.nationalId || "")}</div>
        <div>健保卡號：${escapeHtml(patient?.healthCardNo || "-")}</div>
        <div>科別：${escapeHtml(dept?.name || "")}</div>
        <div>醫師：${escapeHtml(doctor?.name || "")}</div>
        <div>時段：${escapeHtml(slot?.name || "")}</div>
        <div>初/複診：${reg.isFirstTime ? "初診" : "複診"}</div>
      </div>
      <p>看診號碼</p>
      <div class="number">${escapeHtml(reg.regNumber)}</div>
      <div class="footer">列印時間：${new Date().toLocaleString()}</div>
    </div>`;
  openPrintWindow("門診掛號單", html);
}

function printBillingReceipt() {
  const registrationId = hasId("bill-registration") ? byId("bill-registration").value : "";
  const billing =
    (registrationId
      ? [...state.data.billings].reverse().find((b) => b.registrationId === registrationId)
      : null) ||
    state.data.billings.find((b) => b.id === state.lastBillingId) ||
    [...state.data.billings].reverse()[0];
  if (!billing) {
    showToast("目前沒有可列印的收費資料");
    return;
  }
  const reg = state.data.registrations.find((r) => r.id === billing.registrationId);
  const patient = reg ? resolvePatient(reg) : null;
  const doctor = reg ? resolveDoctor(reg.doctorId) : null;
  const html = `
    <div class="paper">
      <h1>憨吉聯合大醫院</h1>
      <h2>門診收據</h2>
      <div class="meta">
        <div>收費時間：${escapeHtml(new Date(billing.paidAt).toLocaleString())}</div>
        <div>收據號：${escapeHtml(billing.id)}</div>
        <div>姓名：${escapeHtml(patient?.name || "")}</div>
        <div>病歷號：${escapeHtml(patient?.medicalRecordNo || "")}</div>
        <div>主治醫師：${escapeHtml(doctor?.name || "")}</div>
        <div>身份別：${escapeHtml(billing.insurance)}</div>
      </div>
      <table>
        <thead><tr><th>項目</th><th>金額</th></tr></thead>
        <tbody>
          <tr><td>掛號費</td><td>${escapeHtml(billing.regFee)}</td></tr>
          <tr><td>診察費</td><td>${escapeHtml(billing.consultFee)}</td></tr>
          <tr><td>部份負擔</td><td>${escapeHtml(billing.copay)}</td></tr>
          <tr><td>醫囑金額(自付)</td><td>${escapeHtml(billing.coveredOrderAmount)}</td></tr>
          <tr><td>折扣別</td><td>${escapeHtml(billing.discount)}</td></tr>
          <tr><td><strong>應收總額</strong></td><td><strong>${escapeHtml(billing.total)}</strong></td></tr>
        </tbody>
      </table>
      <div class="footer">本收據為系統列印樣板，僅供院內作業使用。</div>
    </div>`;
  openPrintWindow("門診收據", html);
}

function renderSelectionLists() {
  const departmentOptions = state.data.departments.map((d) => ({ value: d.id, label: d.name }));
  const timeOptions = state.data.timeSlots.map((t) => ({ value: t.id, label: t.name }));
  const doctorOptions = state.data.doctors.map((d) => ({ value: d.id, label: d.name }));
  const registrationOptions = state.data.registrations
    .filter((r) => r.status === "active")
    .sort((a, b) => (a.regDate > b.regDate ? -1 : 1))
    .map((r) => {
      const patient = resolvePatient(r);
      const doctor = resolveDoctor(r.doctorId);
      return {
        value: r.id,
        label: `${r.regDate} | ${patient?.name || "未知"} | ${doctor?.name || "未知"} | ${r.regNumber}號`
      };
    });

  setOptions(byId("reg-department"), departmentOptions, "請選擇科別");
  setOptions(byId("reg-timeslot"), timeOptions, "請選擇時段");
  setOptions(
    byId("reg-campus"),
    (state.data.campuses || []).map((c) => ({ value: c.id, label: c.name })),
    "請選擇院區"
  );
  setOptions(
    byId("reg-city"),
    state.data.cities.map((c) => ({ value: c.name, label: c.name })),
    "請選縣市"
  );
  setOptions(byId("sch-doctor"), doctorOptions, "請選醫師");
  setOptions(byId("sch-timeslot"), timeOptions, "請選時段");
  setOptions(byId("rule-doctor"), doctorOptions, "請選醫師");
  setOptions(byId("rule-timeslot"), timeOptions, "請選時段");
  setOptions(byId("order-registration"), registrationOptions, "請選掛號紀錄");
  setOptions(byId("bill-registration"), registrationOptions, "請選掛號紀錄");
  setOptions(byId("dept-doctor-department"), departmentOptions, "請選科別");
  setOptions(
    byId("profile-city"),
    state.data.cities.map((c) => ({ value: c.name, label: c.name })),
    "請選縣市"
  );
}

function renderAll() {
  renderSelectionLists();
  renderDistrictOptions();
  renderRegistrationDoctorOptions();
  renderLookupTable();
  renderScheduleTable();
  renderRuleTable();
  renderConfigPreview();
  renderPatientsTable();
  renderOrdersTable();
  renderBillPreview();
  renderBillingTable();
  renderReports();
  renderAnnouncementTable();
  renderDepartmentTable();

  if (hasId("cfg-begin-number")) byId("cfg-begin-number").value = state.data.config.beginNumber;
  if (hasId("cfg-pre-limit")) byId("cfg-pre-limit").value = state.data.config.preLimit;
  if (hasId("cfg-total-limit")) byId("cfg-total-limit").value = state.data.config.totalLimit;
  if (hasId("cfg-number-method")) byId("cfg-number-method").value = state.data.config.numberMethod;
}

function init() {
  bindTabEvents();
  bindSystemButtons();
  bindRegistrationEvents();
  bindLookupEvents();
  bindScheduleEvents();
  bindRuleEvents();
  bindOrderEvents();
  bindBillingEvents();
  bindAnnouncementEvents();
  bindDepartmentEvents();
  bindProfileManagementEvents();
  if (hasId("reg-date")) byId("reg-date").value = formatDate();
  renderAll();
}

init();
