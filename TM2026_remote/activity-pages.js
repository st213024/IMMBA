// Shared activity data for activity list/detail pages.
// Source: https://www.management.fju.edu.tw/subweb/immba/subedit.php?EID=241
// Note: images are extracted from the source page HTML (smarteditupfiles/immba/...).
(function () {
  const baseImageUrl = "https://www.management.fju.edu.tw";

  function absImage(src) {
    if (!src) return "";
    if (src.startsWith("http")) return src;
    if (src.startsWith("/")) return encodeURI(baseImageUrl + src);
    return encodeURI(baseImageUrl + "/" + src);
  }

  // Keep this list to the top items from the source page.
  // (Used by both activity-list.html and the homepage activity block.)
  const activities = [
    {
      idx: 0,
      title: "【用同樣的學費，走一段法國的學習歷程】",
      date: "March 18, 2026",
      imageSrc: absImage("/smarteditupfiles/immba/Bordeaux Campus (002)(1).jpg"),
      caption: "",
      titleEn: "With the Same Tuition: A Learning Journey in France",
      paragraphsEn: [
        "International Management (imMBA) has successfully renewed its academic partnership with France’s KEDGE Business School, extending their long-standing relationship and continuing to provide students with dual-degree and international learning opportunities.",
        "KEDGE is one of France’s internationally recognized business schools, with campuses across Paris, Bordeaux, and Marseille. In the QS 2025 rankings for Business & Management, it is placed among the global 51–100. It is also accredited by AACSB, EQUIS, and AMBA—one of the roughly 1% business schools worldwide holding the Triple Crown.",
        "Through the dual-degree academic agreement, imMBA students can study in France by paying only the tuition and general fees to their home university.",
        "KEDGE’s newest elective modules are currently being prepared and are expected to be announced soon.",
        "#FuJen_imMBA #Dual_Master_Degree #FJCU_imMBA"
      ],
      paragraphs: [
        "國際經管imMBA近期與法國 KEDGE Business School 完成新一輪學術合作續約，延續雙方長期夥伴關係，並持續為學生提供雙聯與國際學習機會。",
        "KEDGE 為法國具國際知名度的商學院之一，校區橫跨巴黎、波爾多與馬賽。該校在QS 2025商業與管理領域排名全球51-100名，並同時通過 AACSB、EQUIS與AMBA三大國際商管認證，為全球僅約1%具備三重認證（Triple Crown）的商學院之一。",
        "透過雙聯學術合約，國際經管imMBA學生有機會在僅繳交母校學雜費的前提下，前往法國留學。",
        "KEDGE最新選修模組正規劃中，預計將於近期公布。",
        "#輔大國際經管 #跨國雙碩士 #FJCU_imMBA #Dual_Master_Degree"
      ]
    },
    {
      idx: 1,
      title: "【上週末的輔大開箱日，你也來逛校園了嗎？】",
      date: "March 11, 2026",
      imageSrc: absImage("/smarteditupfiles/immba/FJCU open house 2026.jpg"),
      caption: "",
      titleEn: "Fu Jen Open House: Are You Visiting Campus This Weekend?",
      paragraphsEn: [
        "During Fu Jen’s Open House Day last weekend, many departments opened their classrooms and laboratories. Through course introductions, interactive experiences, and campus tours, prospective students could get a first look at how each program is taught.",
        "For many students, this is the first step in exploring university departments. And even after choosing a program, learning decisions keep expanding.",
        "The College of Management offers an international master’s option—Fu Jen imMBA—which is a great fit for students who want to continue deepening their studies in business and management. Our courses are taught in English. Students come from different countries, cultures, and backgrounds, discussing business topics and exchanging viewpoints in the same classroom.",
        "With cross-border dual-master’s programs signed with overseas business schools, international Management imMBA students also have the opportunity to study in Europe and North America, completing a cross-national learning journey with more efficient planning.",
        "If Open House Day is the beginning of getting to know Fu Jen, for some students the next destination may be Fu Jen imMBA. #FuJen_imMBA #Dual_Master_Degree #FJCU_imMBA"
      ],
      paragraphs: [
        "上週末輔大開箱日許多系所打開教室與實驗室，透過課程介紹、互動體驗與校園導覽，讓莘莘學子認識各系所的學習樣貌。",
        "對許多同學來說，這是探索大學科系的第一步。而在大學之後，學習選擇仍會延伸。",
        "輔大管理學院有一個走向國際的碩士選項—國際經管imMBA，就很適合想繼續在商管領域深造的學子。這裡的課程全英語授課，學生來自不同國家、文化與背景，在同一個教室討論商業議題、交換觀點。",
        "透過與海外商學院簽署的跨國雙碩士課程，國際經管的學生也有機會到歐美留學，在更有效率的學習規劃下，完成一段跨國學習旅程。",
        "如果說開箱日是認識輔大的開始，對有些同學來說，下一站或許會在國際經管imMBA。",
        "#輔大國際經管 #跨國雙碩士 #FJCU_imMBA #Dual_Master_Degree"
      ]
    },
    {
      idx: 2,
      title: "【為什麼我們能與海外名校展開合作對話？】",
      date: "March 4, 2026",
      imageSrc: absImage("/smarteditupfiles/immba/44182--.jpg"),
      caption: "",
      titleEn: "Why We Can Start a Dialogue with Leading Overseas Universities",
      paragraphsEn: [
        "When we expand cross-border dual-degree academic cooperation, many people ask: will credits connect and transfer smoothly?",
        "One key factor is the AACSB international accreditation achieved by the College of Management.",
        "AACSB (Association to Advance Collegiate Schools of Business) is one of the most representative business-school accreditations worldwide, and only about 5–6% of business schools earn it.",
        "This is not a membership credential. AACSB is an international quality accreditation based on rigorous review and ongoing monitoring, demonstrating that curriculum design, faculty structure, and learning outcomes meet global business-education standards.",
        "As imMBA’s international platform, all courses are taught in English, creating a learning environment aligned with international business education.",
        "Behind these systems, the most direct beneficiaries are the students. For students, it means: ✔ Course design aligns with international business education standards ✔ Credit review and transfer share common criteria ✔ Partnerships are built on an equal-quality foundation ✔ Diplomas gain stronger international recognition.",
        "Cooperation can expand—so long as both sides stand on the same international standards.",
        "#FuJen_imMBA #Dual_Master_Degree #FJCU_imMBA"
      ],
      paragraphs: [
        "當我們拓展跨國雙聯學術合作時，很多人會問：學分真的能順利銜接嗎？",
        "關鍵之一，是輔大管理學院通過的AACSB 國際認證。",
        "AACSB(Association to Advance Collegiate Schools of Business)為全球最具代表性的商學院認證之一，全球僅約5%-6%商學院獲此認證。",
        "這不是會員資格，而是一項經嚴格審查與定期追蹤的國際品質認證，代表課程設計、師資結構與學習成效均符合全球商管教育標準。",
        "國際經管imMBA作為管院的國際化平台，所有課程全英語授課，營造與國際商管教育同步的學習環境。",
        "這些制度背後，最直接受益的是學生。對學生而言，這代表：✔課程設計符合國際商管教育標準 ✔學分審查與對接有共通依據 ✔合作建立在對等品質基礎上 ✔畢業證書更具國際辨識度",
        "合作能展開，前提是彼此站在同一個國際標準上。",
        "#輔大國際經管 #跨國雙碩士 #FJCU_imMBA #Dual_Master_Degree"
      ]
    },
    {
      idx: 3,
      title: "【國際合作版圖再拓展｜即將迎來第一所來自英國的大學】",
      date: "Feb. 25, 2026",
      imageSrc: absImage("/smarteditupfiles/immba/43799.jpg"),
      caption:
        "圖說：雙聯學術合約跨國線上會議<br/>左為Stirling代表 Ms. Rui Brown, Intl. Progression Partnerships Manager<br/>右為國際經管碩士班imMBA 杜逸寧主任",
      titleEn: "Expanding International Collaboration: Welcoming Our First UK Partner University",
      captionEn:
        "Caption: Online meeting for dual-degree academic agreements<br/>On the left: Ms. Rui Brown, Intl. Progression Partnerships Manager (University of Stirling)<br/>On the right: Dr. Du Yining, Director, imMBA Dual Master’s Program (Fu Jen)",
      paragraphsEn: [
        "To keep expanding Fu Jen imMBA’s global partnership network, we recently held discussions with the University of Stirling (UK) on a dual-degree academic collaboration and achieved tangible progress.",
        "The university is located in Scotland and is a public research university in the UK. It ranks among the top group worldwide in multiple international university rankings. Its business, marketing, and sustainable development disciplines enjoy strong international recognition.",
        "If we successfully complete the remaining collaboration details and the related administrative sign-off procedures, the University of Stirling will become Fu Jen imMBA’s first UK partner institution—opening up a brand-new overseas study option for our students.",
        "At the moment, the collaboration is still under confirmation. Once the procedures are completed, we will officially announce it to the public.",
        "International connections continue to move forward—stay tuned.",
        "#FuJen_imMBA #Dual_Master_Degree #FJCU_imMBA"
      ],
      paragraphs: [
        "為持續拓展國際經管imMBA的全球合作網絡，我們近期與英國University of Stirling展開雙聯學術合作洽談並獲得實質進展。",
        "該校位於蘇格蘭，為英國公立研究型大學，在多項國際大學排名中名列全球前段班。其商管、行銷與永續發展領域具備國際聲譽。",
        "若順利完成合作細節確認及相關行政簽署程序，University of Stirling將成為國際經管imMBA與英國大專院校首次合作，亦將為同學開啟嶄新的海外留學選項。",
        "目前合作內容仍在確認階段，待程序完成後，將正式對外公告。",
        "國際連結持續推進中，敬請期待。",
        "#輔大國際經管 #跨國雙碩士 #FJCU_imMBA #Dual_Master_Degree"
      ]
    },
    {
      idx: 4,
      title: "【走出去之後，開始用不一樣的角度看世界】",
      date: "Feb. 11, 2026",
      imageSrc: absImage("/smarteditupfiles/immba/--01(1)(1).jpg"),
      caption: "",
      titleEn: "After Going Abroad, You Start to See the World from a Different Perspective",
      paragraphsEn: [
        "“One of the biggest rewards of studying abroad is being able to understand global markets and industry trends from different angles.”",
        "That “different perspective” isn’t only about comparing theories from textbooks. It means entering another society and system firsthand, and noticing how many everyday operations differ from what has become familiar in Taiwan. Whether it’s corporate decision-making, social issues, or people’s expectations about work, everything looks different from the environment you originally knew.",
        "These day-to-day differences helped her realize that so-called “trends” are shaped by countless actions put into practice over time. For example, ESG is widely discussed in Taiwan in recent years, but it often stays at the concept level. Abroad, ESG is not just a slogan—it is integrated into daily life and corporate culture.",
        "She shared that this contrasting experience gradually changed how she views Taiwan. “In the past, I might have rationalized certain imperfect phenomena and treated them as a kind of ‘Taiwan style.’ However, after experiencing different societies and countries firsthand, I became clearer about where there is still room for progress—and what is worth improving.”",
        "After going abroad, you gain an extra layer of understanding, and with it, a more critical way of thinking—your horizons naturally expand.",
        "#FuJen_imMBA #Dual_Master_Degree #FJCU_imMBA"
      ],
      paragraphs: [
        "「我認為出國最大的收穫之一，是能夠從不同角度理解全球市場與產業趨勢。」",
        "同學所說的「不同角度」，不只是課本上的理論比較，而是親身進入另一個社會與制度中，看見許多不同於台灣習以為常的運作方式。無論是企業決策、社會議題，甚至人們對工作的期待，都與原本熟悉的環境不同。",
        "正是這些日常運作上的差異，讓她開始意識到：所謂的「趨勢」，其實是被大量實踐、逐漸成形的共同行動。例如 ESG，這幾年在台灣雖然被大量討論，卻常停留在概念層次；而在國外， ESG 不是口號而是融入日常生活與企業文化。",
        "同學分享，這樣的對比經驗逐漸改變了她看待台灣的視角。「過去，我可能會替一些不夠完善的現象合理化，將其視為一種『台灣 style』；然而，在親身走過不同社會與國度之後，開始更清楚辨識哪些地方仍有進步空間，也值得被改善。」",
        "走出去之後，多了一層理解，也多了一份思辨，視野自然隨之展開。",
        "#輔大國際經管 #跨國雙碩士 #FJCU_imMBA #Dual_Master_Degree"
      ]
    },
    {
      idx: 5,
      title: "【在國際經管上課，是什麼感覺？】",
      date: "Feb. 4, 2026",
      imageSrc: absImage("/smarteditupfiles/immba/1-1(2)(1).jpg"),
      caption: "",
      titleEn: "What Does It Feel Like to Study in the International MBA Program?",
      paragraphsEn: [
        "Many students instinctively react: you probably can’t stay invisible.",
        "“In the international management program, classes are usually small-group teaching. Teachers can pay attention to every student, so you’re not easily overlooked—and learning feels more participatory.” This was the first feeling students mentioned when recalling their classes.",
        "At the beginning, an all-English learning environment isn’t easy. But the overall atmosphere makes it hard to hide. Students describe that it’s almost impossible not to speak English in class, because teachers encourage every student to share their ideas. “Over time, confidence builds too.”",
        "Sometimes the structure of class isn’t limited to listening and handing in reports. Some courses use a flipped classroom approach—students take a new role, stand in front, and present what they’ve learned to the group.",
        "Teachers provide very positive feedback and offer timely support and guidance, so learning doesn’t end with “finishing a presentation,” but is truly internalized.",
        "Students say those improvements in both professional skills and English ability don’t happen in a single moment—they accumulate little by little in a classroom that encourages participation and open expression. #FuJen_imMBA #Dual_Master_Degree #FJCU_imMBA #Dual_Master_Degree"
      ],
      paragraphs: [
        "很多同學直覺反應是，你大概很難隱形。",
        "「國際經管課程多為小班制，老師能夠顧及每一位學生，學習上不容易被忽略，也更有參與感。」這是同學回顧在國際經管上課時，第一個提到的感受。",
        "全英文授課的環境，一開始並不輕鬆，但整體氛圍讓人無法躲在角落。同學形容，在課堂上幾乎不可能不說英文，因為老師會鼓勵每一位學生開口表達自己的想法。「久而久之，自信心也跟著建立起來。」",
        "有時候課堂形式並不侷限聽講與交報告；有些課程採取翻轉教室的作法，讓學生換個角色站上講台，把學到的內容說給大家聽。「老師們都會給予非常正向的回饋，並適時補充與引導，讓學習內容不只是『做完報告就結束』，而是真正被內化。」",
        "同學表示，那些專業與英文能力的提升，並不是某一個瞬間突然發生，而是在這樣鼓勵參與、開放表達的課堂中，一點一滴累積起來。",
        "#輔大國際經管 #跨國雙碩士 #FJCU_imMBA #Dual_Master_Degree"
      ]
    },
    {
      idx: 6,
      title: "【一個下午在超市：學生的海外學習初體驗】",
      date: "Jan. 28, 2026",
      imageSrc: absImage("/smarteditupfiles/immba/S__356237318 (002)--(1)(1).jpg"),
      caption: "",
      titleEn: "An Afternoon at the Supermarket: Students’ First Experience of Overseas Study",
      paragraphsEn: [
        "When we gathered students’ experiences of studying abroad, we found that many meaningful memories begin with their very first real challenge in daily life.",
        "When they first arrived in France, ordinary tasks like grocery shopping, commuting, and interacting with people all required a complete adjustment. Differences in language and culture made familiar routines feel unfamiliar.",
        "One student described that time like this: “The first time I went to a big supermarket, I couldn’t understand the labels, and I didn’t know how to check out. I ended up staying in there for about four hours without realizing it.”",
        "That was exactly the start of stepping out of the comfort zone. Through repeated attempts, students learned to adjust their mindset. When problems appeared, they were no longer only anxious—they started actively looking for ways and possible solutions.",
        "In interactions, they also felt genuine kindness from people of different cultures. Whether it was patients explaining, communicating with gestures and expressions, or simply offering reminders and help, students experienced the warm and real side of cross-cultural exchange. Through these experiences, they gradually built the ability to handle unfamiliar environments—and also found their own rhythm.",
        "#FuJen_imMBA #Dual_Master_Degree #FJCU_imMBA"
      ],
      paragraphs: [
        "在整理學生的海外學習經驗時，我們發現許多深刻記憶是從生活的第一個挑戰開始。",
        "初到法國，日常採買、交通往返、與人互動，都需要重新適應。語言與文化差異，讓原本熟悉的流程變得陌生。",
        "有學生這樣形容那段時間：「第一次到大型超市採買，因為看不懂標示，也不知道該怎麼結帳，一不小心就在裡面待了4個小時。」",
        "那正是踏出舒適圈的開始。在一次次嘗試中，學著調整心態，遇到問題不再只是緊張，而是主動找方法、尋求解決的可能。",
        "在互動中感受到來自不同文化的善意。無論是耐心解釋、比手畫腳的溝通，或是一個提醒與協助，都讓學生感受到跨文化交流中真實而溫暖的一面。透過這些互動體驗，逐漸累積面對陌生環境的能力，也在嘗試中找到屬於自己的節奏。",
        "#輔大國際經管 #跨國雙碩士 #FJCU_imMBA #Dual_Master_Degree"
      ]
    },
    {
      idx: 7,
      title: "【從工程師到管理職，不只看得更遠，也更清楚下一步】",
      date: "Jan. 21, 2026",
      imageSrc: absImage("/smarteditupfiles/immba/616836451_122125215590998833_5831699160139652277_n.jpg"),
      caption: "",
      titleEn: "From Engineer to Management Professional: Seeing Further and Knowing the Next Step",
      paragraphsEn: [
        "Pauline Joyce Zac, who is from India, is a graduate of Fu Jen imMBA 114-1. It was her first time ever going abroad—and she chose to come to Taiwan and study at Fu Jen.",
        "Before enrolling, she already had 3.5 years of professional experience as a software engineer. However, what she wanted was not only technical skills, but also a more macro way of thinking. She shared that Fu Jen imMBA gave her more than a degree—it offered a journey that helped her rethink the world and the problems around it. Things that she once believed were impossible suddenly started to feel possible.",
        "By combining Fu Jen imMBA’s management training with her engineering experience, Pauline gained many career opportunities even before leaving campus. Her former employer proactively invited her back and promoted her into a management role.",
        "This is the path Fu Jen imMBA hopes to walk with students—not only accumulating knowledge, but helping people see further and understand the next step clearly.",
        "#FuJen_imMBA #Dual_Master_Degree #FJCU_imMBA"
      ],
      paragraphs: [
        "來自印度的Pauline Joyce Zac是國際經管imMBA 114-1的畢業生。人生第一次出國，便選擇來台灣、來輔大。",
        "入學前，她已有3.5年軟體工程師的專業背景，但她想要的不只是技術，而是更宏觀的思考能力。她分享國際經管imMBA帶給她不只是一張學歷，而是一趟重新看待世界與問題的旅程。那些曾經覺得不可行、做不到的事情，現在開始看見可能。",
        "結合國際經管imMBA的管理訓練與工程師經驗，Pauline在尚未踏出校園前便獲得許多職涯機會，前東家更主動邀請她回任並拔擢為管理職。",
        "這就是國際經管imMBA想陪學生走的一段路—不只累積知識，而是讓人看得更遠、也更清楚下一步。",
        "#輔大國際經管 #跨國雙碩士 #FJCU_imMBA #Dual_Master_Degree"
      ]
    }
  ];

  window.activityPages = {
    activities
  };
})();

