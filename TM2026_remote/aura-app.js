(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);

  const els = {
    start: $("#aura-start"),
    snapshot: $("#aura-snapshot"),
    video: $("#aura-video"),
    canvas: $("#aura-canvas"),
    status: $("#aura-status"),
    fps: $("#aura-fps"),
    score: $("#aura-score"),
    chakraList: $("#chakra-list"),
    intensity: $("#aura-intensity"),
    hue: $("#aura-hue"),
    smoothing: $("#aura-smoothing")
  };

  const ctx = els.canvas.getContext("2d", { alpha: false, desynchronized: true });
  const w = els.canvas.width;
  const h = els.canvas.height;

  const work = document.createElement("canvas");
  work.width = w;
  work.height = h;
  const wctx = work.getContext("2d", { alpha: false, willReadFrequently: true });

  const blur = document.createElement("canvas");
  blur.width = w;
  blur.height = h;
  const bctx = blur.getContext("2d", { alpha: false });

  const edge = document.createElement("canvas");
  edge.width = w;
  edge.height = h;
  const ectx = edge.getContext("2d", { alpha: true, willReadFrequently: true });

  const chakraNames = [
    "海底輪",
    "臍輪",
    "太陽神經叢輪",
    "心輪",
    "喉輪",
    "眉心輪",
    "頂輪"
  ];

  const chakraHues = [0, 28, 48, 120, 200, 245, 285];

  function clamp01(x) {
    return Math.max(0, Math.min(1, x));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function createChakraDom() {
    els.chakraList.innerHTML = chakraNames
      .map((name, i) => {
        return `
          <div class="chakra-row" data-idx="${i}">
            <div class="chakra-head">
              <div class="chakra-name">${name}</div>
              <div class="chakra-val" id="chakra-val-${i}">--</div>
            </div>
            <div class="chakra-bar">
              <div class="chakra-fill" id="chakra-fill-${i}" style="width:0%"></div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  createChakraDom();

  const chakraState = new Array(7).fill(0.5);

  function setStatus(text) {
    els.status.textContent = `狀態：${text}`;
  }

  function setEnabledSnapshot(enabled) {
    els.snapshot.disabled = !enabled;
  }

  function computeEnergyAndChakras(imageData) {
    const { data, width, height } = imageData;
    const cols = 32;
    const rows = 18;
    const sx = Math.floor(width / cols);
    const sy = Math.floor(height / rows);

    let totalL = 0;
    let totalC = 0;
    let samples = 0;

    const bands = new Array(7).fill(0).map(() => ({ l: 0, c: 0, n: 0 }));

    // Sample a coarse grid for speed.
    for (let gy = 0; gy < rows; gy++) {
      const y = Math.min(height - 1, gy * sy + Math.floor(sy / 2));
      for (let gx = 0; gx < cols; gx++) {
        const x = Math.min(width - 1, gx * sx + Math.floor(sx / 2));
        const i = (y * width + x) * 4;
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;

        const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const c = max - min; // simple chroma proxy

        totalL += l;
        totalC += c;
        samples++;

        // Map vertical position into 7 bands (bottom->top).
        const t = 1 - y / (height - 1);
        const band = Math.max(0, Math.min(6, Math.floor(t * 7)));
        bands[band].l += l;
        bands[band].c += c;
        bands[band].n++;
      }
    }

    const avgL = totalL / Math.max(1, samples);
    const avgC = totalC / Math.max(1, samples);

    // A "score" that feels responsive: brightness + colorfulness.
    const energy = clamp01(avgL * 0.85 + avgC * 0.9);

    // Chakra values: band brightness + band chroma, normalized.
    const raw = bands.map((b) => {
      const bl = b.l / Math.max(1, b.n);
      const bc = b.c / Math.max(1, b.n);
      return clamp01(bl * 0.8 + bc * 1.1);
    });

    return { energy, chakras: raw };
  }

  function sobelEdges(imageData, outCtx) {
    const { data, width, height } = imageData;
    const out = outCtx.createImageData(width, height);
    const o = out.data;

    const lum = new Float32Array(width * height);
    for (let i = 0, p = 0; i < lum.length; i++, p += 4) {
      lum[i] = 0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2];
    }

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;

        const a00 = lum[idx - width - 1];
        const a01 = lum[idx - width];
        const a02 = lum[idx - width + 1];
        const a10 = lum[idx - 1];
        const a12 = lum[idx + 1];
        const a20 = lum[idx + width - 1];
        const a21 = lum[idx + width];
        const a22 = lum[idx + width + 1];

        const gx = -a00 + a02 - 2 * a10 + 2 * a12 - a20 + a22;
        const gy = -a00 - 2 * a01 - a02 + a20 + 2 * a21 + a22;

        const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy));
        const p = idx * 4;
        o[p] = 255;
        o[p + 1] = 255;
        o[p + 2] = 255;
        o[p + 3] = mag;
      }
    }

    outCtx.putImageData(out, 0, 0);
  }

  function renderFrame(now) {
    if (!state.running) return;

    const vw = els.video.videoWidth;
    const vh = els.video.videoHeight;
    if (!vw || !vh) {
      requestAnimationFrame(renderFrame);
      return;
    }

    // Draw video "cover" into work canvas.
    const scale = Math.max(w / vw, h / vh);
    const dw = vw * scale;
    const dh = vh * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;
    wctx.drawImage(els.video, dx, dy, dw, dh);

    const img = wctx.getImageData(0, 0, w, h);
    const { energy, chakras } = computeEnergyAndChakras(img);

    const smoothing = Number(els.smoothing.value) / 100;
    state.energy = lerp(state.energy, energy, 1 - smoothing);

    for (let i = 0; i < 7; i++) {
      const target = chakras[i];
      chakraState[i] = lerp(chakraState[i], target, 1 - smoothing);
    }

    // Edge detection for a "glow" mask.
    sobelEdges(img, ectx);

    // Create a blurred glow from edges.
    bctx.clearRect(0, 0, w, h);
    bctx.filter = "blur(18px)";
    bctx.globalCompositeOperation = "source-over";
    bctx.drawImage(edge, 0, 0, w, h);
    bctx.filter = "none";

    // Base: the camera image
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(work, 0, 0, w, h);

    // Aura overlay: tint + screen blend.
    const intensity = Number(els.intensity.value) / 100;
    const baseHue = Number(els.hue.value);
    const hueShift = (baseHue + state.energy * 110) % 360;
    const alpha = 0.35 + 0.45 * intensity;

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = alpha;

    // Glow image
    ctx.drawImage(blur, 0, 0, w, h);

    // Color wash
    const g = ctx.createRadialGradient(w * 0.5, h * 0.45, Math.min(w, h) * 0.05, w * 0.5, h * 0.45, Math.min(w, h) * 0.62);
    g.addColorStop(0, `hsla(${hueShift}, 95%, 70%, 0.85)`);
    g.addColorStop(0.35, `hsla(${(hueShift + 45) % 360}, 90%, 60%, 0.55)`);
    g.addColorStop(1, `hsla(${(hueShift + 200) % 360}, 95%, 55%, 0.0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();

    // UI updates
    updateHud(now);
    updateChakras();

    requestAnimationFrame(renderFrame);
  }

  function updateChakras() {
    for (let i = 0; i < 7; i++) {
      const v = clamp01(chakraState[i]);
      const pct = Math.round(v * 100);
      const fill = document.getElementById(`chakra-fill-${i}`);
      const val = document.getElementById(`chakra-val-${i}`);
      if (!fill || !val) continue;
      fill.style.width = `${pct}%`;
      const hue = chakraHues[i];
      fill.style.background = `linear-gradient(90deg, hsla(${hue}, 95%, 55%, 0.95), hsla(${(hue + 28) % 360}, 92%, 62%, 0.95))`;
      val.textContent = `${pct}`;
    }
  }

  function updateHud(now) {
    state.frames++;
    const dt = now - state.fpsT0;
    if (dt >= 500) {
      const fps = Math.round((state.frames * 1000) / dt);
      els.fps.textContent = `FPS：${fps}`;
      state.frames = 0;
      state.fpsT0 = now;
    }
    els.score.textContent = `能量：${Math.round(state.energy * 100)}`;
  }

  const state = {
    running: false,
    stream: null,
    energy: 0.5,
    fpsT0: performance.now(),
    frames: 0
  };

  async function startCamera() {
    try {
      setStatus("請允許相機權限…");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false
      });
      state.stream = stream;
      els.video.srcObject = stream;
      await els.video.play();
      state.running = true;
      setStatus("已啟動（即時視覺化中）");
      setEnabledSnapshot(true);
      requestAnimationFrame(renderFrame);
    } catch (err) {
      console.error(err);
      setStatus("啟動失敗（請確認瀏覽器權限/是否用 http://localhost 開啟）");
      setEnabledSnapshot(false);
    }
  }

  function buildReportHtml({ dataUrl, energy, chakraValues }) {
    const dt = new Date();
    const now = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")} ${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
    const rows = chakraValues
      .map((v, i) => {
        const pct = Math.round(clamp01(v) * 100);
        return `<tr><td style="padding:8px 10px;border-bottom:1px solid #e7eef9;">${chakraNames[i]}</td><td style="padding:8px 10px;border-bottom:1px solid #e7eef9;text-align:right;font-weight:700;">${pct}</td></tr>`;
      })
      .join("");

    return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>能量視覺化報告</title>
  <style>
    :root{--bg:#f6f9ff;--panel:#fff;--line:#d9e6f8;--text:#22314D;--muted:#5B6F8C}
    body{margin:0;font-family:system-ui,-apple-system,"Segoe UI","Noto Sans TC","Microsoft JhengHei",sans-serif;background:var(--bg);color:var(--text)}
    .wrap{width:min(980px,calc(100% - 32px));margin:22px auto}
    .card{background:var(--panel);border:1px solid var(--line);border-radius:14px;box-shadow:0 10px 24px rgba(63,106,165,.14);overflow:hidden}
    header{padding:14px 16px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
    h1{font-size:18px;margin:0}
    .muted{color:var(--muted);font-size:13px}
    .grid{display:grid;grid-template-columns:1.2fr .8fr;gap:12px;padding:12px}
    img{width:100%;border-radius:12px;border:1px solid var(--line);display:block}
    .kpi{display:flex;gap:10px;flex-wrap:wrap}
    .pill{padding:8px 10px;border-radius:999px;border:1px solid var(--line);background:#f3f7ff;font-weight:700}
    table{width:100%;border-collapse:collapse;border:1px solid var(--line);border-radius:12px;overflow:hidden}
    caption{caption-side:top;text-align:left;padding:10px 10px;font-weight:800}
    .note{padding:12px 16px;border-top:1px solid var(--line);color:var(--muted);font-size:13px;line-height:1.6}
    @media (max-width: 860px){.grid{grid-template-columns:1fr}}
    @media print{.note{display:none}}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <header>
        <div>
          <h1>能量視覺化報告（MVP）</h1>
          <div class="muted">時間：${now}</div>
        </div>
        <div class="kpi">
          <div class="pill">能量：${Math.round(clamp01(energy) * 100)}</div>
          <div class="pill">來源：攝影機影像特徵</div>
        </div>
      </header>
      <div class="grid">
        <div>
          <img src="${dataUrl}" alt="snapshot" />
        </div>
        <div>
          <table>
            <caption>七項指標（示意）</caption>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
      <div class="note">
        本頁為互動視覺化展示：以影像特徵生成光暈與指標，非醫療/診斷工具。若要做成商業產品，建議改成「身心狀態/放鬆訓練/儀表板」定位並完善隱私與授權說明。
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  function snapshotAndReport() {
    if (!state.running) return;
    const dataUrl = els.canvas.toDataURL("image/png");
    const chakraValues = chakraState.slice();
    const html = buildReportHtml({ dataUrl, energy: state.energy, chakraValues });
    const win = window.open("", "_blank", "noopener,noreferrer");
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
  }

  els.start.addEventListener("click", () => {
    if (state.running) return;
    startCamera();
  });

  els.snapshot.addEventListener("click", snapshotAndReport);

  // Helpful default hint if served as file://
  if (location.protocol === "file:") {
    setStatus("建議用本機伺服器開啟（相機權限更穩）");
  }
})();

