// Teacher data for list + detail pages (ZH/EN).
// 內建預設＝TEACHERS_BUNDLED；若瀏覽器有寫入 immba_teacher_store_v1，则以該資料為主（後台「師資管理」儲存）。
(function () {
  const placeholder = "images/avatar-placeholder.svg";
  const STORAGE_KEY = "immba_teacher_store_v1";

  /** @type {{id:string, group:'fulltime'|'parttime', photo:string, zh:any, en:any}[]} */
  const TEACHERS_BUNDLED = [
    {
      id: "tu-yining",
      group: "fulltime",
      photo: "https://www.management.fju.edu.tw/upfiles/tw_/menu01753938439.jpg",
      zh: {
        name: "杜逸寧",
        dept: "統計資訊系專任",
        title: "副教授兼國際經營管理碩士(imMBA)主任",
        education: "政治大學資訊管理學博士",
        specialties: "資料探勘、文字探勘、人工智慧、機器學習、資訊檢索",
        website: "https://sites.google.com/view/yiningtu",
        tel: "#3988，LM208-2",
        email: "082435@mail.fju.edu.tw"
      },
      en: {
        name: "Yi-Ning Tu",
        title: "Associate Professor, Chair of MBA Program in International Management (imMBA)",
        education: "Ph.D. in Information Management, National Chengchi University, Taiwan",
        specialties: "Data Mining, Text Mining, Artificial Intelligence, Machine Learning, Information Retrieval",
        website: "https://sites.google.com/view/yiningtu",
        tel: "#3988，LM208-2",
        email: "082435@mail.fju.edu.tw"
      }
    },
    {
      id: "chen-mingchih",
      group: "fulltime",
      photo: "https://www.management.fju.edu.tw/upfiles/tw_/menu01487216808.jpg",
      zh: {
        name: "陳銘芷",
        dept: "商學研究所專任",
        title: "學術特聘教授兼研發長",
        education: "美國德州農工大學工業工程博士",
        specialties: "生產管理、作業管理、品質管理",
        tel: "#3895，研究室SL270",
        email: "081438@mail.fju.edu.tw"
      },
      en: {
        name: "Ming-Chih Chen",
        title: "Distinguished Professor, Dean of Research and Development",
        education: "Ph.D. in Industrial Engineering, Texas A&M U., U.S.A.",
        specialties: "Production and Operations Management, Total Quality Management",
        tel: "#3985",
        email: "081438@mail.fju.edu.tw"
      }
    },
    {
      id: "lee-tienhsing",
      group: "fulltime",
      photo: "https://www.management.fju.edu.tw/upfiles/tw_/menu01596098393.jpg",
      zh: {
        name: "李天行",
        dept: "商學博士班專任",
        title: "講座教授 (前國際與資源發展副校長)",
        education: "美國奧斯汀德州大學作業研究與工業工程博士",
        specialties: "顧客關係管理、人工智慧、應用統計、作業研究",
        tel: "#2905，研究室SL228",
        email: "036665@mail.fju.edu.tw"
      },
      en: {
        name: "Michael T. S. Lee",
        title: "Chair Professor",
        education: "Ph.D. in Operations Research and Industrial Engineering, University of Texas at Austin, USA",
        specialties: "Operations Research and Industrial Engineering",
        tel: "#2905，Office: SL228",
        email: "036665@mail.fju.edu.tw"
      }
    },
    {
      id: "shia-benchang",
      group: "fulltime",
      photo: "https://www.management.fju.edu.tw/upfiles/tw_/menu01646101155.jpg",
      zh: {
        name: "謝邦昌",
        dept: "商學博士班專任",
        title: "講座教授(前資源與事業發展副校長)",
        education: "台灣大學生物統計學博士",
        specialties: "抽樣調查、生物統計、預測模式、資料採礦、大數據、人工智慧",
        tel: "#3366",
        email: "025674@mail.fju.edu.tw"
      },
      en: {
        name: "Ben-Chang Shia",
        title: "Chair Professor",
        education: "Ph.D., National Taiwan University, Taiwan",
        specialties: "Sampling Survey, Bio-statistics, Data Mining, Big Data, AI",
        tel: "#3366",
        email: "025674@mail.fju.edu.tw"
      }
    },
    {
      id: "lin-yaonan",
      group: "fulltime",
      photo: "https://www.management.fju.edu.tw/upfiles/tw_/menu01603245456.jpg",
      zh: {
        name: "林耀南",
        dept: "企業管理系專任",
        title: "教授(前國際教育長)",
        education: "美國舊金山金門大學企業管理博士",
        specialties: "消費者心理學、產品與行銷創新、創造力、人力資源管理",
        tel: "#2735，研究室SL260",
        email: "065999@mail.fju.edu.tw"
      },
      en: {
        name: "Yaonan Lin",
        title: "Professor",
        education: "Ph.D. in Marketing, Golden Gate University, San Francisco, USA",
        specialties: "Marketing Management",
        tel: "#2735, 2021",
        email: "065999@mail.fju.edu.tw"
      }
    },
    {
      id: "hu-pichan",
      group: "fulltime",
      photo: "https://www.management.fju.edu.tw/upfiles/tw_/menu01603259236.jpg",
      zh: {
        name: "胡碧嬋",
        dept: "跨文化研究所專任",
        title: "副教授(前學術交流中心主任)",
        education: "政治大學應用英語語言學博士",
        specialties: "國際商務談判、法律語言學、財經法律翻譯、法律口筆譯、醫療口筆譯、一般口筆譯",
        tel: "#2145",
        email: "128144@mail.fju.edu.tw"
      },
      en: {
        name: "Pi-Chan Hu",
        title: "Associate Professor",
        education: "Ph.D. in Applied Linguistics, National Chengchi University, Taiwan",
        specialties: "International Business Negotiation, English Translation, English Interpretation, Applied Linguistics, Forensic Linguistics",
        tel: "#2145",
        email: "128144@mail.fju.edu.tw"
      }
    },
    {
      id: "huang-kaiping",
      group: "fulltime",
      photo: "https://www.management.fju.edu.tw/upfiles/tw_/menu01735200452.jpg",
      zh: {
        name: "黃愷平",
        dept: "企業管理系專任",
        title: "副教授",
        education: "澳洲雪梨科技大學企業管理博士",
        specialties: "中小企業、創業精神、行銷管理、人力資源管理",
        tel: "#2906",
        email: "129741@mail.fju.edu.tw"
      },
      en: {
        name: "Kai-Ping Huang",
        title: "Associate Professor",
        education: "Ph.D. in Business Administration, University of Technology Sydney, Australia",
        specialties: "Business Administration",
        tel: "#2906",
        email: "129741@mail.fju.edu.tw"
      }
    },
    {
      id: "tseng-hsiangching",
      group: "fulltime",
      photo: "https://www.management.fju.edu.tw/upfiles/tw_/menu01662622813.png",
      zh: {
        name: "曾祥景",
        dept: "企業管理系專任",
        title: "副教授",
        education: "政治大學企業管理博士",
        specialties: "行銷相關領域",
        tel: "#2737",
        email: "142652@mail.fju.edu.tw"
      },
      en: {
        name: "Hsiang-Ching Tseng",
        title: "Associate Professor",
        education: "Ph.D. in Marketing, National Chengchi University, Taiwan",
        specialties: "Marketing Management",
        tel: "#2737",
        email: "142652@mail.fju.edu.tw"
      }
    },
    {
      id: "lin-chihan",
      group: "fulltime",
      photo: "https://www.management.fju.edu.tw/upfiles/tw_/menu01596096150.jpg",
      zh: {
        name: "林芷安",
        dept: "金融國企系專任",
        title: "副教授",
        education: "台灣大學國際企業博士",
        specialties: "供應鏈管理、媒體傳播、整合行銷、品牌管理",
        tel: "#2924，研究室SL221",
        email: "144629@mail.fju.edu.tw"
      },
      en: {
        name: "Chih-An Lin",
        title: "Associate Professor",
        education: "Ph.D. in International Business, National Taiwan University, Taiwan",
        specialties: "Supply Chain Management, Media Communication, Integrated Marketing, Brand Management",
        tel: "#2924, Office: SL221",
        email: "144629@mail.fju.edu.tw"
      }
    },
    {
      id: "lin-meichun",
      group: "fulltime",
      photo: "https://www.management.fju.edu.tw/upfiles/tw_/menu01612145438.jpg",
      zh: {
        name: "林玫君",
        dept: "金融國企系專任",
        title: "副教授",
        education: "成功大學工業與資訊管理博士",
        specialties: "產業分析與競爭策略、科技創新、服務行銷、供應鏈管理",
        tel: "#2968，研究室SL408",
        email: "151308@mail.fju.edu.tw"
      },
      en: {
        name: "Mei-Chun Lin",
        title: "Associate Professor",
        education: "Ph.D. in Industrial and Information Management, National Cheng Kung University, Taiwan",
        specialties: "AI application in Industry, Service Marketing, Industry Analysis and Competitive Strategy, Supply Chain Management",
        tel: "#2968, SL408",
        email: "151308@mail.fju.edu.tw"
      }
    },
    {
      id: "huang-chihjung",
      group: "fulltime",
      photo: "https://www.management.fju.edu.tw/upfiles/tw_/menu01662623120.jpeg",
      zh: {
        name: "黃智榮",
        dept: "資訊管理系專任",
        title: "副教授",
        education: "澳洲昆士蘭大學資訊管理所博士",
        specialties: "資訊管理、追溯系统、在線反饋信息、社交媒體、消費者行為",
        tel: "#2625，研究室SL242",
        email: "154231@mail.fju.edu.tw"
      },
      en: {
        name: "Khai-Tri Lam",
        title: "Associate Professor",
        education: "Ph.D. in Business Information Systems, The University of Queensland, Australia",
        specialties: "Information Systems, Traceability Systems, Online Feedback, Social Media, Consumer Behaviour",
        tel: "#2625，SL242",
        email: "154231@mail.fju.edu.tw"
      }
    },
    {
      id: "hsu-yuming",
      group: "fulltime",
      photo: "https://www.management.fju.edu.tw/upfiles/tw_/menu01662622350.jpg",
      zh: {
        name: "許育銘",
        dept: "金融國企系專任",
        title: "副教授",
        education: "台灣大學國際企業研究所博士",
        specialties: "行銷管理、數位行銷、資訊科技行銷、社群商務、國際企業管理",
        tel: "#3977，研究室SL225",
        email: "155456@mail.fju.edu.tw"
      },
      en: {
        name: "Yu-Ming Hsu",
        title: "Associate Professor",
        education: "Ph.D. in International Business, National Taiwan University, Taiwan",
        specialties: "Marketing Management, Digital Marketing, Information Technology Marketing, Social Commerce, International Business Administration",
        tel: "#3977，SL225",
        email: "155456@mail.fju.edu.tw"
      }
    },
    {
      id: "chiang-tsuilin",
      group: "fulltime",
      photo: "https://www.management.fju.edu.tw/upfiles/tw_/menu01646198858.jpg",
      zh: {
        name: "江翠玲",
        title: "助理教授",
        education: "輔仁大學商學研究所博士",
        specialties: "經濟學、財務管理與公司治理、投資學與財務個案分析、國際財務管理、金融市場、信用風險管理",
        tel: "#2852, 研究室SL472",
        email: "051266@mail.fju.edu.tw"
      },
      en: {
        name: "Tsui-Lin Chiang",
        title: "Assistant Professor",
        education: "Ph.D. in Business Administration, Fu Jen Catholic University, Taiwan",
        specialties: "Economics, Business governance, Financial Management, Investment",
        tel: "#2852, SL472",
        email: "051266@mail.fju.edu.tw"
      }
    },
    {
      id: "lin-shuwen",
      group: "fulltime",
      photo: "https://www.management.fju.edu.tw/upfiles/tw_/menu01706580642.png",
      zh: {
        name: "林淑雯",
        title: "助理教授",
        education: "英國杜倫大學教育博士",
        specialties: "通識及專業英文、世界性英語",
        tel: "#3362，研究室SF829",
        email: "156503@mail.fju.edu.tw"
      },
      en: {
        name: "Shu-wen Lin",
        title: "Assistant Professor",
        education: "Ed.D., School of Education, Durham University, UK",
        specialties: "English for General and Specific Purposes, Global Englishes",
        tel: "#3362, SF829",
        email: "156503@mail.fju.edu.tw"
      }
    },
    {
      id: "yen-menghsien",
      group: "fulltime",
      photo: "https://www.management.fju.edu.tw/upfiles/tw_/menu01633500689.jpg",
      zh: {
        name: "顏孟賢",
        dept: "企業管理系專任",
        title: "助理教授",
        education: "政治大學企業管理學系博士",
        specialties: "一般管理、策略管理、國際企業",
        tel: "#2648",
        email: "145785@mail.fju.edu.tw"
      },
      en: {
        name: "Meng-Hsien Yen",
        title: "Assistant Professor",
        education: "Ph.D. in Business Policy, National Cheng-Chi University, Taiwan",
        specialties: "General Management and Business Policy",
        tel: "#2648",
        email: "145785@mail.fju.edu.tw"
      }
    },
    {
      id: "hsu-haohsin",
      group: "fulltime",
      photo: "https://www.management.fju.edu.tw/upfiles/tw_/menu01652159617.png",
      zh: {
        name: "徐皓馨",
        dept: "企業管理系專任",
        title: "助理教授",
        education: "交通大學管理科學系博士",
        specialties: "組織行為、職場健康心理學、人力資源管理、效率及生產力分析領域",
        tel: "#2771",
        email: "144779@mail.fju.edu.tw"
      },
      en: {
        name: "Hao-Hsin Hsu",
        title: "Assistant Professor",
        education: "Ph.D. in Management Science, National Chiao Tung University, Taiwan",
        specialties: "Organizational Behavior, Workplace Health Psychology, Human Resource Management, Efficiency and Productivity Analysis",
        tel: "#2771",
        email: "144779@mail.fju.edu.tw"
      }
    },
    {
      id: "cheng-shuling",
      group: "fulltime",
      photo: "https://www.management.fju.edu.tw/upfiles/tw_/menu01646101394.jpg",
      zh: {
        name: "鄭淑玲",
        dept: "金融國企系專任",
        title: "助理教授",
        education: "成功大學企業管理系博士",
        specialties: "行銷研究、資料分析、國際金融",
        tel: "#2725，研究室SL211",
        email: "151667@mail.fju.edu.tw"
      },
      en: {
        name: "Shu-Ling Cheng",
        title: "Assistant Professor",
        education: "Ph.D. in Business Administration, National Cheng Kung University, Taiwan",
        specialties: "Strategic Management, Marketing Research, Data Analysis, International Financial Management",
        tel: "#2725, SL211",
        email: "151667@mail.fju.edu.tw"
      }
    },
    {
      id: "huang-kaibin",
      group: "fulltime",
      photo: "https://www.management.fju.edu.tw/upfiles/tw_/menu01700462662.jpg",
      zh: {
        name: "黃凱斌",
        dept: "企管系專任",
        title: "助理教授",
        education: "交通大學工業工程與管理學系博士",
        specialties: "統計推論與實務應用、品質工程及可靠度分析、資料探勘及機器學習、人工智慧於再生能源管理之應用、實驗室品質管理",
        tel: "#6265",
        email: "152400@mail.fju.edu.tw"
      },
      en: {
        name: "Kai-Pin Huang",
        title: "Assistant Professor",
        education: "Ph.D. in Industrial Engineering and Management, National Chiao Tung University, Taiwan",
        specialties: "Statistical Inference with Applications, Quality Engineering and Reliability Analysis, Data Mining and Machine Learning, Artificial Intelligence System Applications in Renewable Energy Management",
        tel: "#6265",
        email: "152400@mail.fju.edu.tw"
      }
    },
    {
      id: "sugianto-lai-ferry",
      group: "fulltime",
      photo: "https://www.management.fju.edu.tw/upfiles/tw_/menu01700462894.png",
      zh: {
        name: "黃慶偉",
        dept: "企管系專任",
        title: "助理教授",
        education: "中正大學財務金融博士",
        specialties: "投資學、行為財務學、環境財經、綠色金融、氣候金融、永續金融",
        tel: "#2678",
        email: "158325@mail.fju.edu.tw"
      },
      en: {
        name: "Lai Ferry Sugianto",
        title: "Assistant Professor",
        education: "Ph.D. in Finance, National Chung Cheng University, Taiwan",
        specialties: "Investment, Behavioral Finance, Environmental Finance and Economics, Green Finance, Climate Finance, ESG",
        tel: "#2678",
        email: "158325@mail.fju.edu.tw"
      }
    },
    {
      id: "wang-huimei",
      group: "parttime",
      photo: "https://www.management.fju.edu.tw/upfiles/tw_/menu01596097609.jpg",
      zh: {
        name: "王慧美",
        title: "兼任副教授 (前國際經營管理碩士(imMBA)主任)",
        education: "台灣大學國際企業博士",
        specialties: "國際企業、國際行銷",
        email: "wanghm.tw@gmail.com"
      },
      en: {
        name: "Hui-Mei Wang",
        title: "Part-time Associate Professor",
        education: "Ph.D. in International Business, National Taiwan University, Taiwan",
        specialties: "International Business; International Marketing",
        email: "wanghm.tw@gmail.com"
      }
    },
    {
      id: "huang-sophia",
      group: "parttime",
      photo: "https://www.management.fju.edu.tw/upfiles/tw_/menu01748918550.jpg",
      zh: {
        name: "黃淑芬",
        title: "兼任副教授級專業技術人員 (美國人才發展協會CPTD）",
        education: "輔仁大學商學研究所博士",
        specialties: "人力資源管理、人才發展、組織發展",
        email: "sophia2077@gmail.com"
      },
      en: {
        name: "Sophia Huang",
        title: "Part-time Associate Professor-Professional Track (CPTD certified by ATD)",
        education: "Ph.D. in Business Administration, Fu Jen Catholic University, Taiwan",
        specialties: "Human Resources Management, Talent Development, Organization Development",
        email: "sophia2077@gmail.com"
      }
    }
  ];

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function normalizeLocale(z) {
    const o = z && typeof z === "object" ? z : {};
    return {
      name: String(o.name ?? ""),
      dept: o.dept != null ? String(o.dept) : "",
      title: String(o.title ?? ""),
      education: o.education != null ? String(o.education) : "",
      specialties: o.specialties != null ? String(o.specialties) : "",
      website: o.website != null ? String(o.website) : "",
      tel: o.tel != null ? String(o.tel) : "",
      email: o.email != null ? String(o.email) : ""
    };
  }

  function normalizeTeacher(t) {
    const raw = t && typeof t === "object" ? t : {};
    let id = String(raw.id ?? "").trim().replace(/\s+/g, "-");
    if (!id) id = "teacher-" + Math.random().toString(36).slice(2, 10);
    const group = raw.group === "parttime" ? "parttime" : "fulltime";
    let photo = String(raw.photo ?? "").trim();
    if (!photo) photo = placeholder;
    return {
      id,
      group,
      photo,
      zh: normalizeLocale(raw.zh),
      en: normalizeLocale(raw.en)
    };
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const p = JSON.parse(raw);
      if (!Array.isArray(p) || p.length === 0) return null;
      return p.map(normalizeTeacher);
    } catch {
      return null;
    }
  }

  let ACTIVE_TEACHERS = loadFromStorage() || deepClone(TEACHERS_BUNDLED);

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ACTIVE_TEACHERS));
    } catch (e) {
      console.warn("TeacherData persist failed", e);
    }
  }

  function byGroup(group) {
    return ACTIVE_TEACHERS.filter((t) => t.group === group);
  }

  function findById(id) {
    const key = String(id ?? "").trim();
    if (!key) return null;
    return ACTIVE_TEACHERS.find((t) => t.id === key) || null;
  }

  window.TeacherData = {
    /** @returns {{id:string, group:string, photo:string, zh:any, en:any}[]} */
    all() {
      return deepClone(ACTIVE_TEACHERS);
    },
    byGroup,
    findById,
    /** 後台：取代全部並寫入 localStorage */
    saveAll(list) {
      if (!Array.isArray(list)) return;
      ACTIVE_TEACHERS = list.map(normalizeTeacher);
      persist();
    },
    resetToBundled() {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (_) {}
      ACTIVE_TEACHERS = deepClone(TEACHERS_BUNDLED);
    },
    exportJson() {
      return JSON.stringify(ACTIVE_TEACHERS, null, 2);
    },
    importFromJson(text) {
      const p = JSON.parse(text);
      if (!Array.isArray(p)) throw new Error("JSON 必須是陣列");
      ACTIVE_TEACHERS = p.map(normalizeTeacher);
      persist();
    },
    hasCustomData() {
      try {
        return Boolean(localStorage.getItem(STORAGE_KEY));
      } catch {
        return false;
      }
    }
  };
})();

