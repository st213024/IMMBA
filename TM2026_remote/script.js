// Shared interactive behaviors for both index pages
(function () {
  /** Logo 區：連按兩下（雙擊）進入後台管理 Dashboard */
  (function adminLogoDoubleClick() {
    const el = document.getElementById("topbar-logo-admin-trigger");
    if (!el) return;
    const adminUrl = "admin/login.html?next=dashboard.html";
    el.addEventListener("dblclick", function (e) {
      e.preventDefault();
      window.location.href = adminUrl;
    });
  })();

  // Dropdown menu (matches official imMBA nav: hassub + submenu)
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".nav-item");
      document.querySelectorAll(".nav-item.open").forEach((node) => {
        if (node !== item) {
          node.classList.remove("open");
          const ob = node.querySelector(".nav-btn");
          if (ob) ob.setAttribute("aria-expanded", "false");
        }
      });
      const willOpen = !item.classList.contains("open");
      item.classList.toggle("open");
      btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".nav-item")) {
      document.querySelectorAll(".nav-item.open").forEach((item) => {
        item.classList.remove("open");
        const b = item.querySelector(".nav-btn");
        if (b) b.setAttribute("aria-expanded", "false");
      });
    }
  });

  // Feature cards hover reveal (also for keyboard focus)
  document.querySelectorAll(".feature-card").forEach((card) => {
    card.addEventListener("focus", () => card.classList.add("is-hover"));
    card.addEventListener("blur", () => card.classList.remove("is-hover"));
  });

  // Render published news list from local NewsStore (see news-store.js)
  // 首頁 #news-list 僅顯示 5 則；完整列表見 news-list.html
  (function renderNewsList() {
    const list = document.getElementById("news-list");
    if (!list || !window.NewsStore) return;
    const homeNewsLimit = 5;
    const published = window.NewsStore.listPublished();
    const newsItems = published.slice(0, homeNewsLimit);
    const fallbackImage = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=300&q=70";

    if (!newsItems.length) {
      list.innerHTML = '<li class="empty-news">目前沒有可顯示的消息。</li>';
      return;
    }

    list.innerHTML = newsItems
      .map((item) => {
        const safeTitle = item.title;
        const safeDate = item.date;
        const safeUrl = item.external_url;
        const safeImage = item.image_url || fallbackImage;
        const internalUrl = `news-detail.html?id=${encodeURIComponent(item.id)}`;
        const titleNode = safeUrl
          ? `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeTitle}</a>`
          : `<a href="${internalUrl}" class="news-title-no-link">${safeTitle}</a>`;

        return `<li>
          <div class="news-item-main">
            <img class="news-thumb" src="${safeImage}" alt="${safeTitle}">
            <div class="news-text">
              ${titleNode}
            </div>
          </div>
          <time>${safeDate}</time>
        </li>`;
      })
      .join("");
  })();

  // Render activity highlights from external source content
  (function renderActivityList() {
    const list = document.getElementById("activity-list");
    const toggle = document.getElementById("activity-toggle");
    if (!list || !toggle) return;

    const isEn = document.documentElement.lang === "en";
    const initialCount = 6;
    let expanded = false;

    // Source: https://www.management.fju.edu.tw/subweb/immba/subedit.php?EID=241
    const fallbackActivityItems = [
      {
        idx: 0,
        title: "【用同樣的學費，走一段法國的學習歷程】",
        titleEn: "With the Same Tuition: A Learning Journey in France",
        date: "2026/03/18",
        dateEn: "March 18, 2026",
        excerpt: "國際經管 imMBA 與法國 KEDGE Business School 完成合作續約，持續提供雙聯與國際學習機會。",
        excerptEn: "International Management (imMBA) has renewed its partnership with France’s KEDGE Business School, continuing to offer dual-degree and international learning opportunities.",
        image: "https://www.management.fju.edu.tw/smarteditupfiles/immba/Bordeaux%20Campus%20(002)(1).jpg",
        href: "activity-detail.html?idx=0",
        hrefEn: "activity-detail-en.html?idx=0"
      },
      {
        idx: 1,
        title: "【上週末的輔大開箱日，你也來逛校園了嗎？】",
        titleEn: "Fu Jen Open House: Are You Visiting Campus This Weekend?",
        date: "2026/03/11",
        dateEn: "March 11, 2026",
        excerpt: "透過課程介紹、互動體驗與校園導覽，讓學生更認識學習環境與未來升學路徑。",
        excerptEn: "Through course introductions, interactive experiences, and campus tours, prospective students could better understand learning environments and future pathways.",
        image: "https://www.management.fju.edu.tw/smarteditupfiles/immba/FJCU%20open%20house%202026.jpg",
        href: "activity-detail.html?idx=1",
        hrefEn: "activity-detail-en.html?idx=1"
      },
      {
        idx: 2,
        title: "【為什麼我們能與海外名校展開合作對話？】",
        titleEn: "Why We Can Start a Dialogue with Leading Overseas Universities",
        date: "2026/03/04",
        dateEn: "March 4, 2026",
        excerpt: "關鍵之一在 AACSB 國際認證，讓課程與學分對接建立在共同品質標準之上。",
        excerptEn: "AACSB international accreditation provides a shared quality standard that supports curriculum and credit connection.",
        image: "https://www.management.fju.edu.tw/smarteditupfiles/immba/44182--.jpg",
        href: "activity-detail.html?idx=2",
        hrefEn: "activity-detail-en.html?idx=2"
      },
      {
        idx: 3,
        title: "【國際合作版圖再拓展｜即將迎來第一所來自英國的大學】",
        titleEn: "Expanding International Collaboration: Welcoming Our First UK Partner University",
        date: "2026/02/25",
        dateEn: "Feb. 25, 2026",
        excerpt: "與英國 University of Stirling 展開合作洽談，拓展國際經管全球合作網絡。",
        excerptEn: "Discussions with the University of Stirling (UK) advance Fu Jen imMBA’s global partnership network.",
        image: "https://www.management.fju.edu.tw/smarteditupfiles/immba/43799.jpg",
        href: "activity-detail.html?idx=3",
        hrefEn: "activity-detail-en.html?idx=3"
      },
      {
        idx: 4,
        title: "【走出去之後，開始用不一樣的角度看世界】",
        titleEn: "After Going Abroad, You Start to See the World from a Different Perspective",
        date: "2026/02/11",
        dateEn: "Feb. 11, 2026",
        excerpt: "透過跨文化學習與生活經驗，學生逐步建立對全球市場與產業趨勢的多元視角。",
        excerptEn: "Cross-cultural learning and daily experiences help students build a more diverse perspective on global markets and industry trends.",
        image: "https://www.management.fju.edu.tw/smarteditupfiles/immba/--01(1)(1).jpg",
        href: "activity-detail.html?idx=4",
        hrefEn: "activity-detail-en.html?idx=4"
      },
      {
        idx: 5,
        title: "【在國際經管上課，是什麼感覺？】",
        titleEn: "What Does It Feel Like to Study in the International MBA Program?",
        date: "2026/02/04",
        dateEn: "Feb. 4, 2026",
        excerpt: "小班全英授課、鼓勵參與與表達，讓專業與語言能力在課堂中持續累積。",
        excerptEn: "Small-group, all-English teaching encourages participation and expression, building both professional and language skills over time.",
        image: "https://www.management.fju.edu.tw/smarteditupfiles/immba/1-1(2)(1).jpg",
        href: "activity-detail.html?idx=5",
        hrefEn: "activity-detail-en.html?idx=5"
      },
      {
        idx: 6,
        title: "【一個下午在超市：學生的海外學習初體驗】",
        titleEn: "An Afternoon at the Supermarket: Students’ First Experience of Overseas Study",
        date: "2026/01/28",
        dateEn: "Jan. 28, 2026",
        excerpt: "從生活挑戰開始的海外適應歷程，逐步累積跨文化溝通與解決問題能力。",
        excerptEn: "Starting from everyday challenges, students gradually build cross-cultural communication and problem-solving skills.",
        image: "https://www.management.fju.edu.tw/smarteditupfiles/immba/S__356237318%20(002)--(1)(1).jpg",
        href: "activity-detail.html?idx=6",
        hrefEn: "activity-detail-en.html?idx=6"
      },
      {
        idx: 7,
        title: "【從工程師到管理職，不只看得更遠，也更清楚下一步】",
        titleEn: "From Engineer to Management Professional: Seeing Further and Knowing the Next Step",
        date: "2026/01/21",
        dateEn: "Jan. 21, 2026",
        excerpt: "結合工程與管理訓練，強化職涯轉型能力並拓展國際視野。",
        excerptEn: "Combining engineering experience with management training strengthens career transitions and expands international perspectives.",
        image: "https://www.management.fju.edu.tw/smarteditupfiles/immba/616836451_122125215590998833_5831699160139652277_n.jpg",
        href: "activity-detail.html?idx=7",
        hrefEn: "activity-detail-en.html?idx=7"
      }
    ];

    const normalizedFallbackActivityItems = isEn
      ? fallbackActivityItems.map((x) => ({
          idx: x.idx,
          title: x.titleEn || x.title,
          date: x.dateEn || x.date,
          excerpt: x.excerptEn || x.excerpt,
          image: x.image,
          href: x.hrefEn || x.href
        }))
      : fallbackActivityItems;

    const pageActivityItems = window.activityPages?.activities;
    const activityItems =
      Array.isArray(pageActivityItems) && pageActivityItems.length
        ? pageActivityItems
            .filter((x) => (x.status ?? "published") === "published")
            .map((a) => ({
              idx: a.idx,
              title: isEn ? a.titleEn || a.titleZh || a.title : a.titleZh || a.title,
              date: isEn ? a.dateEn || a.date : a.date,
              summary: isEn
                ? a.summaryEn ||
                  (Array.isArray(a.contentEn)
                    ? a.contentEn.join(" ")
                    : Array.isArray(a.paragraphsEn)
                      ? a.paragraphsEn.join(" ")
                      : Array.isArray(a.paragraphs)
                        ? a.paragraphs.join(" ")
                        : "")
                : a.summaryZh ||
                  (Array.isArray(a.contentZh)
                    ? a.contentZh.join(" ")
                    : Array.isArray(a.paragraphs)
                      ? a.paragraphs.join(" ")
                      : ""),
              image: a.imageUrl || a.imageSrc,
              imageSrc: a.imageUrl || a.imageSrc,
              href: isEn
                ? `activity-detail-en.html?idx=${encodeURIComponent(a.idx)}`
                : `activity-detail.html?idx=${encodeURIComponent(a.idx)}`
            }))
        : normalizedFallbackActivityItems.map((x) => ({
            idx: x.idx,
            title: x.title,
            date: x.date,
            summary: x.excerpt,
            image: x.image,
            imageSrc: x.image,
            href: x.href
          }));

    function render() {
      const showing = expanded ? activityItems : activityItems.slice(0, initialCount);
      const excerptMaxChars = 150;
      list.innerHTML = showing
        .map((item) => {
          const fullText = item.summary || "";
          const normalized = String(fullText).replace(/\s+/g, " ").trim();
          const truncated = normalized.length > excerptMaxChars;
          const shown = truncated ? normalized.slice(0, excerptMaxChars) + "..." : normalized;
          return `
            <article class="activity-item">
              <img class="activity-image" src="${item.imageSrc || item.image}" alt="${item.title}">
              <div class="activity-content">
                <a class="activity-title" href="${item.href}" target="_blank" rel="noopener noreferrer">${item.title}</a>
                <time class="activity-date">${item.date}</time>
                <p class="activity-excerpt">${shown}</p>
                ${
                  truncated
                    ? `<a class="activity-readmore" href="${item.href}" target="_blank" rel="noopener noreferrer">Read more</a>`
                    : ""
                }
              </div>
            </article>
          `;
        })
        .join("");

      toggle.textContent = expanded
        ? (isEn ? "Show less" : "收合公告")
        : (isEn ? "More posts" : "更多公告");
    }

    toggle.addEventListener("click", () => {
      expanded = !expanded;
      render();
    });

    render();
  })();
})();

