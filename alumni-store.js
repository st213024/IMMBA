(() => {
  const STORAGE_KEY = "immba_alumni_records_v1";

  const SAMPLE = [
    {
      id: "alumni-sample-1",
      name: "王小明",
      student_id: "11010001",
      department: "國際經營",
      program: "碩士班",
      enroll_year: "114",
      grad_year: "116",
      email: "wang@example.com",
      phone: "0912-345-678",
      company: "範例股份有限公司",
      job_title: "專案經理",
      remarks: "範例資料",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "alumni-sample-2",
      name: "李小華",
      student_id: "10920002",
      department: "企業管理",
      program: "大學部",
      enroll_year: "110",
      grad_year: "",
      email: "li@example.com",
      phone: "",
      company: "",
      job_title: "",
      remarks: "可留空欄",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  function nowIso() {
    return new Date().toISOString();
  }

  function normalizeRecord(raw) {
    const t = nowIso();
    return {
      id: String(raw.id || "").trim() || `alumni-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: String(raw.name || "").trim(),
      student_id: String(raw.student_id || "").trim(),
      department: String(raw.department || "").trim(),
      program: String(raw.program || "").trim(),
      enroll_year: String(raw.enroll_year ?? "").trim(),
      grad_year: String(raw.grad_year ?? "").trim(),
      email: String(raw.email || "").trim().toLowerCase(),
      phone: String(raw.phone || "").trim(),
      company: String(raw.company || "").trim(),
      job_title: String(raw.job_title || "").trim(),
      remarks: String(raw.remarks || "").trim(),
      created_at: raw.created_at || t,
      updated_at: t
    };
  }

  function read() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SAMPLE.map((x) => normalizeRecord({ ...x }));
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return SAMPLE.map((x) => normalizeRecord({ ...x }));
      return parsed.map((x) => normalizeRecord(x));
    } catch {
      return SAMPLE.map((x) => normalizeRecord({ ...x }));
    }
  }

  function write(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function listAll() {
    return read().sort((a, b) => {
      const sa = a.student_id || "";
      const sb = b.student_id || "";
      if (sa !== sb) return sa.localeCompare(sb, "zh-Hant");
      return (a.name || "").localeCompare(b.name || "", "zh-Hant");
    });
  }

  function get(id) {
    return read().find((x) => x.id === id) || null;
  }

  function upsert(record) {
    const items = read();
    const next = normalizeRecord(record);
    const idx = items.findIndex((x) => x.id === next.id);
    if (idx >= 0) {
      next.created_at = items[idx].created_at || next.created_at;
      items[idx] = next;
    } else {
      items.push(next);
    }
    write(items);
    return next;
  }

  function remove(id) {
    const items = read().filter((x) => x.id !== id);
    write(items);
  }

  function resetToSample() {
    write(SAMPLE.map((x) => normalizeRecord({ ...x })));
  }

  function replaceAll(records) {
    const list = Array.isArray(records) ? records : [];
    write(list.map((x) => normalizeRecord(x)));
  }

  window.AlumniStore = {
    listAll,
    get,
    upsert,
    remove,
    resetToSample,
    replaceAll
  };
})();
