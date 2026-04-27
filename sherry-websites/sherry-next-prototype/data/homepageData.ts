export type NavItem = { label: string; href: string };
export type HeaderAction = { label: string; href: string };
export type LinkAction = { label: string; href: string };
export type TopicTag = { label: string; href: string };

export type HeroData = {
  title: string;
  description: string;
  primaryActions: LinkAction[];
  secondaryActions: LinkAction[];
  image: string;
};

export type AboutData = {
  title: string;
  description: string;
  image: string;
  tags: string[];
  actions: LinkAction[];
};

export type MethodStep = { title: string; detail: string };
export type TopicCard = { title: string; summary: string; action: LinkAction };
export type CaseStudy = {
  name: string;
  targetType: string;
  format: string;
  category: string;
  highlight: string;
  action: LinkAction;
};
export type Insight = { title: string; category: string; excerpt: string; action: LinkAction };
export type Collaboration = { title: string; description: string; action: LinkAction };

export const homepageData = {
  brandName: "Sherry",
  navItems: [
    { label: "首頁", href: "#" },
    { label: "關於 Sherry", href: "#about-sherry" },
    { label: "課程主題", href: "#featured-topics" },
    { label: "課程成果", href: "#case-studies" },
    { label: "內容觀點", href: "#insights" },
    { label: "合作方案", href: "#collaboration" },
    { label: "聯絡", href: "#cta" },
  ] as NavItem[],
  headerActions: [
    { label: "查看課程", href: "#featured-topics" },
    { label: "合作洽詢", href: "#cta" },
  ] as HeaderAction[],
  hero: {
    title: "整合品牌、教育、創作與療癒實踐，發展可被理解、被體驗、被實踐的課程與合作方案。",
    description:
      "我是 Sherry，專注於課程設計、引導式教學與跨域整合，透過內容、體驗與方法設計，協助不同場域展開真正有感且可落地的學習與合作。",
    primaryActions: [
      { label: "認識 Sherry", href: "#about-sherry" },
      { label: "查看課程成果", href: "#case-studies" },
    ],
    secondaryActions: [
      { label: "查看課程主題", href: "#featured-topics" },
      { label: "合作洽詢", href: "#cta" },
    ],
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
  } as HeroData,
  about: {
    title: "關於 Sherry",
    description:
      "Sherry 不是單一領域的講師，而是長期從品牌經營、課程設計、創作實踐與療癒觀點中，發展出一套兼具結構、感受與行動力的帶領方式。她重視的不只是課程完成，而是讓參與者真正形成理解、整理自己、展開實踐。",
    image: "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?auto=format&fit=crop&w=960&q=80",
    tags: ["課程設計", "引導式教學", "跨域整合", "海洋療癒", "生涯整理"],
    actions: [
      { label: "認識更多", href: "#" },
      { label: "查看帶領主題", href: "#featured-topics" },
    ],
  } as AboutData,
  methodSteps: [
    {
      title: "跨域整合",
      detail: "整合品牌、教育、創作與感受設計，將不同主題整理成有邏輯的課程與合作方案。",
    },
    {
      title: "引導式設計",
      detail: "不只是講授，而是透過提問、活動、分享與整理，促成參與者自己的理解。",
    },
    {
      title: "可感受，也可落地",
      detail: "兼顧體驗深度與實際應用，不讓課程只停留在感覺或表面知識。",
    },
    {
      title: "因場域調整",
      detail: "可依學校、社區、品牌、機構等不同合作場域調整內容與形式。",
    },
  ] as MethodStep[],
  topics: [
    {
      title: "自我探索與成長引導",
      summary: "透過提問、整理與體驗，協助參與者看見自己的特質、價值與狀態。",
      action: { label: "查看主題", href: "#" },
    },
    {
      title: "海洋療癒與創作體驗",
      summary: "結合海洋意象、感官覺察、創作與療癒元素，展開放鬆與表達導向的課程體驗。",
      action: { label: "查看主題", href: "#" },
    },
    {
      title: "生涯整理與職涯啟發",
      summary: "從自我理解出發，協助參與者梳理方向、角色與未來可能性。",
      action: { label: "查看主題", href: "#" },
    },
    {
      title: "客製化講座與工作坊",
      summary: "依不同場域需求，整合主題內容、互動形式與引導設計，發展專屬合作方案。",
      action: { label: "查看主題", href: "#" },
    },
  ] as TopicCard[],
  caseStudies: [
    {
      name: "海港城市青年引導講座",
      targetType: "大專院校學生",
      format: "校園講座",
      category: "生涯 / 職涯啟發課程",
      highlight: "課後回饋中，86% 參與者表示已完成第一步行動計畫。",
      action: { label: "查看案例", href: "#" },
    },
    {
      name: "海洋感知創作工作坊",
      targetType: "社區成人學習者",
      format: "工作坊",
      category: "海洋療癒課程",
      highlight: "完成 3 種可在日常持續練習的感官與書寫方法。",
      action: { label: "查看案例", href: "#" },
    },
    {
      name: "品牌內容與教學整合計畫",
      targetType: "品牌行銷團隊",
      format: "系列培訓",
      category: "工作坊",
      highlight: "建立跨部門共用的內容框架，提案效率提升 30%。",
      action: { label: "查看案例", href: "#" },
    },
    {
      name: "青年生涯整理陪伴課",
      targetType: "轉職探索者",
      format: "引導課程",
      category: "生涯 / 職涯啟發課程",
      highlight: "學員在 6 週內產出個人定位敘事與行動節奏表。",
      action: { label: "查看案例", href: "#" },
    },
  ] as CaseStudy[],
  insights: [
    {
      title: "課程不是資訊堆疊，而是理解生成的過程",
      category: "課程設計",
      excerpt: "設計一堂有感課程，關鍵在讓參與者有時間轉譯、對話與實踐。",
      action: { label: "閱讀更多", href: "#" },
    },
    {
      title: "海洋意象如何成為療癒與創作的引導媒介",
      category: "創作與療癒",
      excerpt: "從節奏、聲響與感官覺察出發，建立可被身體記住的穩定感。",
      action: { label: "閱讀更多", href: "#" },
    },
    {
      title: "生涯整理不是找答案，而是建立可前進的框架",
      category: "生涯整理",
      excerpt: "透過角色盤點與價值排序，把焦慮轉化為具體選擇與行動。",
      action: { label: "閱讀更多", href: "#" },
    },
  ] as Insight[],
  collaborations: [
    {
      title: "校園 / 教育單位合作",
      description: "以學生處境與學習目標為核心，設計講座、工作坊或系列課程。",
      action: { label: "查看合作形式", href: "#" },
    },
    {
      title: "社區 / 推廣教育",
      description: "結合在地需求，導入自我探索、創作療癒與生涯整理主題。",
      action: { label: "查看合作形式", href: "#" },
    },
    {
      title: "品牌 / 機構合作",
      description: "將品牌理念轉化為可被體驗的內容與互動學習設計。",
      action: { label: "查看合作形式", href: "#" },
    },
    {
      title: "客製化工作坊 / 系列課程",
      description: "依照場域、受眾與合作目標，共同規劃專屬課程節奏。",
      action: { label: "查看合作形式", href: "#" },
    },
  ] as Collaboration[],
  topicTags: [
    { label: "自我探索", href: "#" },
    { label: "海洋療癒", href: "#" },
    { label: "生涯整理", href: "#" },
    { label: "職涯啟發", href: "#" },
    { label: "創作表達", href: "#" },
    { label: "品牌思考", href: "#" },
  ] as TopicTag[],
  futureInstructors: {
    title: "共創夥伴與未來合作講師",
    description:
      "目前網站以 Sherry 為核心主講人，未來也將逐步邀請不同主題的合作講師與共創夥伴，發展更多元的學習與合作形式。",
    sherryCard: {
      name: "Sherry",
      role: "核心主講人",
      note: "品牌 x 教育 x 創作 x 療癒整合",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=700&q=80",
    },
    comingSoon: {
      title: "未來合作中",
      note: "即將加入不同主題的共創講師",
    },
  },
  cta: {
    title: "一起把理念整理成能被理解、被體驗、被實踐的形式",
    description: "如果你正在尋找合適的課程、講座、工作坊或合作形式，歡迎與 Sherry 聯繫。",
    actions: [
      { label: "洽詢合作", href: "#" },
      { label: "查看課程主題", href: "#featured-topics" },
    ],
  },
  footer: {
    tagline: "以 Sherry 為核心主講人，整合品牌、教育、創作與療癒實踐。",
    quickLinks: ["首頁", "關於 Sherry", "課程成果", "觀點內容", "聯絡"],
    courseTopics: ["自我探索", "海洋療癒", "生涯整理", "職涯啟發"],
    collaborations: ["校園合作", "社區合作", "品牌合作", "客製課程"],
    email: "hello@sherrystudio.example",
    socials: ["Instagram", "LinkedIn", "YouTube"],
    copyright: "© 2026 Sherry. All rights reserved.",
  },
};
