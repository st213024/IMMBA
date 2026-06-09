/* 海癒AI — shared logic */
const OceanAI = (() => {
  const BASE = '/sherry-next-prototype/ocean-healing-ai';
  const KEYS = {
    scan: 'oceanAI_scan',
    post: 'oceanAI_post',
    tracker: 'oceanAI_7day',
  };

  const SCAN_QUESTIONS = [
    {
      id: 'stress',
      text: '你目前的壓力程度？',
      options: [
        { label: '幾乎沒有壓力', value: 1, tag: 'low-stress' },
        { label: '有一點壓力，但還能應付', value: 2, tag: 'mild-stress' },
        { label: '壓力明顯，常覺得喘不過氣', value: 3, tag: 'high-stress' },
        { label: '壓力很大，已影響日常生活', value: 4, tag: 'critical-stress' },
      ],
    },
    {
      id: 'emotion',
      text: '你最近的情緒狀態？',
      options: [
        { label: '平穩踏實', value: 'calm', tag: 'calm' },
        { label: '起伏不定', value: 'swing', tag: 'swing' },
        { label: '低落無力', value: 'low', tag: 'low' },
        { label: '焦慮緊繃', value: 'anxious', tag: 'anxious' },
      ],
    },
    {
      id: 'theme',
      text: '你目前最想療癒的主題？',
      options: [
        { label: '情緒安定與放鬆', value: 'calm', tag: 'calm-series' },
        { label: '人際關係與自我接納', value: 'relation', tag: 'relation-series' },
        { label: '表達勇氣與行動力', value: 'action', tag: 'action-series' },
        { label: '能量保護與界線', value: 'protect', tag: 'protect-series' },
      ],
    },
    {
      id: 'body',
      text: '你最近身體最明顯的感受？',
      options: [
        { label: '肩頸緊繃、睡不好的緊張感', value: 'tense', tag: 'tense' },
        { label: '胸口悶、呼吸淺', value: 'chest', tag: 'chest' },
        { label: '疲倦沉重、提不起勁', value: 'tired', tag: 'tired' },
        { label: '整體還算放鬆', value: 'relaxed', tag: 'relaxed' },
      ],
    },
    {
      id: 'ocean',
      text: '你今天最被哪一種海洋意象吸引？',
      options: [
        { label: '🌊 海浪', value: 'wave', tag: 'release' },
        { label: '🐚 貝殼', value: 'shell', tag: 'protect' },
        { label: '🌑 深海', value: 'deep', tag: 'subconscious' },
        { label: '🌙 月光海面', value: 'moonlight', tag: 'stability' },
        { label: '🪸 珊瑚礁', value: 'coral', tag: 'heal' },
      ],
    },
  ];

  const POST_QUESTIONS = [
    { id: 'stress', text: '壓力程度', scale: true },
    { id: 'calm', text: '平靜感', scale: true, reverse: false },
    { id: 'sleep', text: '睡眠感受', scale: true },
    { id: 'emotion', text: '情緒穩定度', scale: true },
    { id: 'body', text: '身體放鬆感', scale: true },
  ];

  const TAROT_CARDS = [
    { id: 'wave', icon: '🌊', name: '海浪牌', keyword: '釋放', message: '你累積的情緒需要被看見與釋放。今天適合讓眼淚、嘆息或深呼吸成為你的出口，不必急著「變好」。', products: ['紫水晶', '海洋聲音療癒體驗'] },
    { id: 'shell', icon: '🐚', name: '貝殼牌', keyword: '保護', message: '你其實已經很努力了。今天適合為自己劃一條溫柔的界線，允許自己先被保護，再對世界敞開。', products: ['黑曜石', '茶晶'] },
    { id: 'lighthouse', icon: '🗼', name: '燈塔牌', keyword: '方向', message: '你不是真的沒有方向，而是需要先停止被外界聲音推著走。今天適合重新整理自己的優先順序。', products: ['白水晶', '海藍寶', '海洋療癒課程'] },
    { id: 'moonlight', icon: '🌙', name: '月光海面牌', keyword: '安定', message: '你的內在其實渴望寧靜。今晚適合放慢節奏，讓月光般的溫柔覆蓋你的焦慮。', products: ['月光石', '紫水晶'] },
    { id: 'coral', icon: '🪸', name: '珊瑚牌', keyword: '修復', message: '你正在經歷一段修復期。不必急著回到從前的自己，緩慢生長本身就是療癒。', products: ['粉晶', '草莓晶'] },
    { id: 'deep', icon: '🌑', name: '深海牌', keyword: '潛意識', message: '有些感受還在深海裡等待被看見。今天適合寫下三個你不敢說出口的想法，不必給答案。', products: ['深海冥想引導', '白水晶'] },
    { id: 'wind', icon: '💨', name: '海風牌', keyword: '轉變', message: '改變的風已經吹來。你不需要一次想清楚全部，只需要確認：我願意讓什麼離開？', products: ['黃水晶', '海藍寶'] },
    { id: 'pearl', icon: '🔮', name: '珍珠牌', keyword: '價值', message: '你的價值不需要被任何人定義。那些讓你痛苦的經驗，正在慢慢成為你獨特的光澤。', products: ['粉晶', '珍珠母貝手鍊'] },
  ];

  const TAROT_POSITIONS = ['現在的你', '你需要看見的訊息', '下一步建議'];

  const TRACKER_MOODS = [
    { id: 'calm', label: '很平靜', color: 'calm' },
    { id: 'tired', label: '有點疲憊', color: 'tired' },
    { id: 'stress', label: '有壓力', color: 'stress' },
    { id: 'swing', label: '情緒起伏', color: 'swing' },
    { id: 'better', label: '有明顯改善', color: 'better' },
  ];

  function save(key, data) {
    localStorage.setItem(key, JSON.stringify({ ...data, ts: Date.now() }));
  }

  function load(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function analyzeScan(answers) {
    const stress = answers.stress?.value || 2;
    const emotion = answers.emotion?.value || 'calm';
    const theme = answers.theme?.value || 'calm';
    const body = answers.body?.value || 'relaxed';
    const ocean = answers.ocean?.value || 'wave';

    let stateLabel, stateDesc, method, reminder;
    const seriesMap = {
      calm: '情緒安定系列',
      relation: '關係修復系列',
      action: '表達與行動系列',
      protect: '保護與界線系列',
    };

    if (stress >= 3 && (emotion === 'anxious' || emotion === 'swing')) {
      stateLabel = '高壓但仍有自我覺察';
      stateDesc = '你需要的是放慢節奏、穩定情緒，並重新建立內在安全感。';
      method = '海洋聲音療癒 + 海浪呼吸練習';
      reminder = '今天，允許自己什麼都不做十分鐘，也是一種療癒。';
    } else if (emotion === 'low' || body === 'tired') {
      stateLabel = '能量低落、需要溫柔充電';
      stateDesc = '你的身體在提醒你放慢腳步，給自己更多柔軟的支持。';
      method = '月光冥想 + 溫和伸展';
      reminder = '你不需要一直堅強。今天，先照顧好自己就好。';
    } else if (theme === 'action' || emotion === 'swing') {
      stateLabel = '方向待釐清、行動前需要整理';
      stateDesc = '你內心有想前進的動力，但還需要更多內在確認與支持。';
      method = '靈擺探索 + 書寫整理';
      reminder = '不急著做決定。先問自己：這件事讓我感到真實嗎？';
    } else if (theme === 'protect') {
      stateLabel = '能量敏感、需要界線與保護';
      stateDesc = '你容易吸收外界能量，現在最重要的是建立穩定的內在空間。';
      method = '黑曜石能量保護 + 界線練習';
      reminder = '說「不」不是自私，是對自己的溫柔。';
    } else {
      stateLabel = '相對穩定、適合深化療癒';
      stateDesc = '你已有不錯的自我覺察，可以更深入探索內在成長。';
      method = '海洋塔羅訊息 + 創作療癒';
      reminder = '保持覺察的你，已經在療癒的路上了。';
    }

    const oceanMethod = {
      wave: '海浪釋放呼吸（每日 3 分鐘）',
      shell: '貝殼保護冥想',
      deep: '深海潛意識書寫',
      moonlight: '月光海面靜心',
      coral: '珊瑚修復創作體驗',
    };

    return {
      stateLabel,
      stateDesc,
      energy: stateLabel,
      theme: answers.theme?.label || '情緒安定',
      method: oceanMethod[ocean] || method,
      productSeries: seriesMap[theme] || '情緒安定系列',
      reminder,
      answers,
      ts: Date.now(),
    };
  }

  function analyzePendulum(question) {
    const q = question.toLowerCase();
    const guides = [
      '我是否有足夠能量？',
      '我是否害怕失敗？',
      '我是否需要更多支持？',
      '我是否只是想逃離現況？',
    ];

    let result, product, service, practice;
    if (/新|開始|計畫|行動|換/.test(q)) {
      result = '目前你的狀態較適合「先整理內在方向，再開始行動」。';
      product = '海藍寶水晶手鍊';
      service = '海洋聲音療癒體驗';
      practice = '每日 3 分鐘海浪呼吸';
    } else if (/感情|關係|喜歡|分手|伴侶/.test(q)) {
      result = '你現在最需要的是「釐清自己的真實感受，而非急於得到答案」。';
      product = '粉晶手串';
      service = '關係修復療癒工作坊';
      practice = '寫下三件讓你感到被愛的時刻';
    } else if (/工作|職涯|離職|跳槽/.test(q)) {
      result = '這個問題背後，可能藏著「對自我價值的確認需求」。';
      product = '黃水晶';
      service = '生涯整理引導課程';
      practice = '列出你目前工作的三個收穫與三個代價';
    } else {
      result = '靈擺提醒你：答案不在外在，而在你願意誠實面對的內在。';
      product = '白水晶';
      service = '能量探索 + 海洋療癒體驗';
      practice = '靜心三分鐘，感受身體哪裡最緊繃';
    }

    return { guides, result, product, service, practice, question };
  }

  function compareReport(before, after) {
    const metrics = [
      { key: 'stress', label: '壓力程度', lowerBetter: true },
      { key: 'calm', label: '平靜感', lowerBetter: false },
      { key: 'sleep', label: '睡眠感受', lowerBetter: false },
      { key: 'emotion', label: '情緒穩定度', lowerBetter: false },
      { key: 'body', label: '身體放鬆感', lowerBetter: false },
    ];

    const rows = metrics.map((m) => {
      const b = before[m.key] ?? 5;
      const a = after[m.key] ?? 5;
      const improved = m.lowerBetter ? a < b : a > b;
      return { ...m, before: b, after: a, improved };
    });

    const improvements = rows.filter((r) => r.improved);
    let analysis;
    if (improvements.length >= 3) {
      analysis = '本次療癒體驗後，你的平靜感與身體放鬆感明顯提升。建議未來持續進行海洋聲音療癒，並搭配情緒安定系列水晶作為日常陪伴。';
    } else if (improvements.length >= 1) {
      analysis = '你已經出現一些正向變化，持續練習會讓療癒效果更穩定。建議搭配七日能量追蹤，觀察自己的節奏。';
    } else {
      analysis = '療癒是一個過程，每個人的節奏不同。建議給自己更多時間，並嘗試不同療癒方式找到最適合你的組合。';
    }

    return { rows, analysis };
  }

  function initNav() {
    const path = location.pathname;
    document.querySelectorAll('.ocean-nav-mini a').forEach((a) => {
      const href = a.getAttribute('href');
      const segment = href.replace(BASE, '').replace(/\/$/, '') || '/';
      const match = segment === '/'
        ? path.endsWith('/ocean-healing-ai') || path.endsWith('/ocean-healing-ai/')
        : path.includes(segment);
      if (match) a.classList.add('active');
    });
  }

  function initScan() {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    const answers = {};
    let step = 0;
    const progressBar = document.getElementById('quiz-progress-bar');
    const resultPanel = document.getElementById('scan-result');

    function renderStep() {
      const q = SCAN_QUESTIONS[step];
      container.innerHTML = `
        <div class="quiz-step active">
          <div class="quiz-question">
            <p class="kicker">問題 ${step + 1} / ${SCAN_QUESTIONS.length}</p>
            <h2>${q.text}</h2>
          </div>
          <div class="option-grid" id="options">
            ${q.options.map((o) => `<button class="option-btn" data-value="${o.value}" data-label="${o.label}" data-tag="${o.tag}">${o.label}</button>`).join('')}
          </div>
        </div>`;

      if (progressBar) progressBar.style.width = `${((step) / SCAN_QUESTIONS.length) * 100}%`;

      container.querySelectorAll('.option-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          answers[q.id] = {
            value: btn.dataset.value,
            label: btn.dataset.label,
            tag: btn.dataset.tag,
          };
          step++;
          if (step < SCAN_QUESTIONS.length) {
            renderStep();
          } else {
            finishScan();
          }
        });
      });
    }

    function finishScan() {
      if (progressBar) progressBar.style.width = '100%';
      container.style.display = 'none';
      const result = analyzeScan(answers);
      save(KEYS.scan, result);

      if (resultPanel) {
        resultPanel.classList.add('visible');
        resultPanel.innerHTML = `
          <div class="result-highlight">
            <p class="kicker">你的今日療癒狀態</p>
            <h2>${result.stateLabel}</h2>
            <p class="muted" style="margin-top:10px">${result.stateDesc}</p>
          </div>
          <div class="result-grid">
            <div class="result-item"><div class="label">今日能量狀態</div><div class="value">${result.energy}</div></div>
            <div class="result-item"><div class="label">主要療癒主題</div><div class="value">${result.theme}</div></div>
            <div class="result-item"><div class="label">推薦療癒方式</div><div class="value">${result.method}</div></div>
            <div class="result-item"><div class="label">推薦產品類型</div><div class="value">${result.productSeries}</div></div>
          </div>
          <div class="quote-box">${result.reminder}</div>
          <div class="actions">
            <a class="btn btn-primary" href="${BASE}/products/">探索療癒產品</a>
            <a class="btn" href="${BASE}/pendulum/">靈擺探索</a>
            <a class="btn" href="${BASE}/tarot/">海洋塔羅訊息</a>
          </div>`;
      }
    }

    renderStep();
  }

  function initPendulum() {
    const form = document.getElementById('pendulum-form');
    const output = document.getElementById('pendulum-result');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('pendulum-question');
      const question = input?.value?.trim();
      if (!question) return;

      const r = analyzePendulum(question);
      output.classList.add('visible');
      output.innerHTML = `
        <div class="result-highlight">
          <p class="kicker">靈擺探索結果</p>
          <p class="muted" style="margin-bottom:14px">關於「${r.question}」，你現在真正需要確認的是：</p>
          <ul class="guide-list">${r.guides.map((g) => `<li>${g}</li>`).join('')}</ul>
        </div>
        <div class="result-highlight" style="margin-top:16px">
          <h3>${r.result}</h3>
        </div>
        <div class="result-grid">
          <div class="result-item"><div class="label">療癒產品</div><div class="value">${r.product}</div></div>
          <div class="result-item"><div class="label">療癒服務</div><div class="value">${r.service}</div></div>
          <div class="result-item"><div class="label">練習建議</div><div class="value">${r.practice}</div></div>
        </div>`;
    });
  }

  function initTarot() {
    const stage = document.getElementById('tarot-stage');
    const output = document.getElementById('tarot-result');
    const drawBtn = document.getElementById('tarot-draw');
    if (!stage) return;

    let cards = [];
    let flipped = 0;

    function shuffle(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function renderCards() {
      cards = shuffle(TAROT_CARDS).slice(0, 3);
      flipped = 0;
      stage.innerHTML = cards.map((card, i) => `
        <div>
          <div class="tarot-label">${TAROT_POSITIONS[i]}</div>
          <div class="tarot-card" data-idx="${i}">
            <div class="tarot-card__inner">
              <div class="tarot-card__face tarot-card__back">🌊</div>
              <div class="tarot-card__face tarot-card__front">
                <span class="card-icon">${card.icon}</span>
                <span class="card-name">${card.name}</span>
                <span class="card-keyword">${card.keyword}</span>
              </div>
            </div>
          </div>
        </div>`).join('');

      if (output) output.innerHTML = '<p class="muted">點選牌卡翻開，或點擊下方按鈕一次翻開三張。</p>';

      stage.querySelectorAll('.tarot-card').forEach((el) => {
        el.addEventListener('click', () => flipCard(el));
      });
    }

    function flipCard(el) {
      if (el.classList.contains('flipped')) return;
      el.classList.add('flipped');
      flipped++;
      if (flipped === 3) showResult();
    }

    function showResult() {
      if (!output) return;
      output.innerHTML = cards.map((card, i) => `
        <div class="result-item" style="margin-bottom:12px">
          <div class="label">${TAROT_POSITIONS[i]}｜${card.name}｜${card.keyword}</div>
          <div class="value" style="margin:8px 0">${card.message}</div>
          <div class="product-chips">${card.products.map((p) => `<span class="product-chip">${p}</span>`).join('')}</div>
        </div>`).join('');
    }

    drawBtn?.addEventListener('click', () => {
      renderCards();
      setTimeout(() => {
        stage.querySelectorAll('.tarot-card').forEach((el) => flipCard(el));
      }, 400);
    });

    renderCards();
  }

  function initProducts() {
    const container = document.getElementById('product-series');
    if (!container) return;

    const scan = load(KEYS.scan);
    const recommended = scan?.productSeries || '';

    const series = [
      { id: 'calm', name: '情緒安定系列', fit: '焦慮、睡不好、想放鬆', products: ['紫水晶', '白水晶', '月光石'] },
      { id: 'relation', name: '關係修復系列', fit: '自我懷疑、人際受傷、需要柔軟支持', products: ['粉晶', '草莓晶'] },
      { id: 'action', name: '表達與行動系列', fit: '想說出口、想開始新計畫、需要勇氣', products: ['海藍寶', '黃水晶'] },
      { id: 'protect', name: '保護與界線系列', fit: '容易被影響、能量耗損、需要穩定', products: ['黑曜石', '茶晶'] },
    ];

    container.innerHTML = series.map((s) => {
      const isRec = recommended.includes(s.name.replace('系列', '')) || recommended === s.name;
      return `
        <article class="series-card${isRec ? ' recommended' : ''}">
          <div class="series-card__header">
            <h3>${s.name}${isRec ? '<span class="badge-rec">為你推薦</span>' : ''}</h3>
            <p class="muted">適合：${s.fit}</p>
          </div>
          <div class="series-card__body">
            <div class="product-chips">${s.products.map((p) => `<span class="product-chip">${p}</span>`).join('')}</div>
          </div>
        </article>`;
    }).join('');
  }

  function initReport() {
    const recContainer = document.getElementById('course-recommendations');
    const trackerSection = document.getElementById('tracker-section');

    if (recContainer) {
      const scan = load(KEYS.scan);
      const theme = scan?.theme || '情緒安定';
      const stressLabel = scan?.stateLabel || '需要溫柔照顧的狀態';

      const courses = [
        {
          id: 'intro',
          title: '海洋療癒體驗課｜情緒安定篇',
          fit: '適合第一次接觸海洋療癒、目前壓力偏高或睡不好的人。',
          forThemes: ['情緒安定', 'calm-series'],
          highlight: '以海浪呼吸與聲音引導為主，協助身體真正鬆下來。',
        },
        {
          id: 'relation',
          title: '海洋療癒工作坊｜關係修復與自我接納',
          fit: '適合在人際關係中受傷、容易自我懷疑，或想練習溫柔說出真實感受的人。',
          forThemes: ['關係修復', 'relation-series'],
          highlight: '結合書寫與創作，整理你在關係裡的需求與界線。',
        },
        {
          id: 'action',
          title: '海風行動力課程｜表達與行動啟動',
          fit: '適合想開始新計畫、需要勇氣跨出下一步的人。',
          forThemes: ['表達與行動', 'action-series'],
          highlight: '透過靈擺探索與具體行動設計，幫你從卡住轉向前進。',
        },
        {
          id: 'protect',
          title: '深海保護圈｜敏感體質與界線練習',
          fit: '適合容易被他人情緒影響、覺得自己能量很容易被耗損的人。',
          forThemes: ['保護與界線', 'protect-series'],
          highlight: '學習能量保護儀式與日常界線練習，讓自己待在安全的內在空間。',
        },
      ];

      const preferred = courses.sort((a, b) => {
        const aMatch = a.forThemes.some((t) => theme.includes(t));
        const bMatch = b.forThemes.some((t) => theme.includes(t));
        if (aMatch === bMatch) return 0;
        return aMatch ? -1 : 1;
      });

      recContainer.innerHTML = `
        <div class="result-highlight">
          <p class="kicker">根據你的當下狀態</p>
          <h2>${stressLabel}</h2>
          <p class="muted" style="margin-top:8px">建議你可以從下列課程開始，慢慢建立屬於自己的海洋療癒節奏。</p>
        </div>
        <div class="product-series" style="margin-top:18px">
          ${preferred.map((c) => `
            <article class="series-card">
              <div class="series-card__header">
                <h3>${c.title}</h3>
                <p class="muted">適合：${c.fit}</p>
              </div>
              <div class="series-card__body">
                <p class="muted">${c.highlight}</p>
                <div class="actions" style="margin-top:10px">
                  <a class="btn btn-primary" href="/sherry-next-prototype/contact/?from=ocean-healing-course&course=${encodeURIComponent(c.title)}">預約這門課程</a>
                  <a class="btn" href="/sherry-next-prototype/contact/?type=consult&course=${encodeURIComponent(c.title)}">想先聊聊</a>
                </div>
              </div>
            </article>
          `).join('')}
        </div>`;
    }

    initTracker(trackerSection);
  }

  function initTracker(section) {
    if (!section) return;

    const data = load(KEYS.tracker) || { days: [], startDate: Date.now() };
    let currentDay = data.days.length;

    function render() {
      const dayDots = Array.from({ length: 7 }, (_, i) => {
        const cls = i < data.days.length ? 'done' : (i === currentDay ? 'today' : '');
        return `<div class="day-dot ${cls}">${i + 1}</div>`;
      }).join('');

      section.innerHTML = `
        <h2>7日海洋能量追蹤</h2>
        <p class="muted" style="margin:8px 0 16px">每天填一題：今天的我，感覺如何？</p>
        <div class="day-indicator">${dayDots}</div>
        ${currentDay < 7 ? `
          <p style="font-weight:600;margin-bottom:10px">第 ${currentDay + 1} 天</p>
          <div class="tracker-options" id="mood-options">
            ${TRACKER_MOODS.map((m) => `<button class="tracker-btn" data-mood="${m.id}" data-color="${m.color}">${m.label}</button>`).join('')}
          </div>` : renderChart(data)}
        ${currentDay >= 7 ? `
          <div class="actions" style="margin-top:20px">
            <a class="btn btn-primary" href="/sherry-next-prototype/contact/">預約下一堂療癒課</a>
            <a class="btn" href="${BASE}/products/">查看適合我的水晶</a>
            <a class="btn" href="${BASE}/scan/">加入深度療癒方案</a>
          </div>` : ''}`;

      if (currentDay < 7) {
        section.querySelectorAll('.tracker-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            data.days.push({ mood: btn.dataset.mood, color: btn.dataset.color, day: currentDay + 1 });
            save(KEYS.tracker, data);
            currentDay++;
            render();
          });
        });
      }
    }

    function renderChart(data) {
      const heights = { calm: 80, tired: 50, stress: 30, swing: 45, better: 90 };
      const bars = data.days.map((d, i) => `
        <div class="chart-bar-group">
          <div class="chart-bar chart-bar--${d.color}" style="height:${heights[d.color] || 50}px"></div>
          <span class="chart-day">D${i + 1}</span>
        </div>`).join('');

      return `
        <h3 style="margin-top:20px">七日能量變化圖</h3>
        <div class="chart-bars">${bars}</div>
        <p class="muted">追蹤完成！觀察你的能量曲線，選擇適合的下一步。</p>`;
    }

    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initScan();
    initPendulum();
    initTarot();
    initProducts();
    initReport();
  });

  return { BASE, KEYS, load, save, analyzeScan };
})();
