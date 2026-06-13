import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Menu,
  X,
  Play,
  Volume2,
  Scale,
  CalendarDays,
  ShieldCheck,
  Leaf,
  Truck,
  Syringe,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Calculator as CalcIcon,
  Search,
  MapPin,
  Phone,
  Mail,
  Clock,
  Plus,
  Minus,
  Check,
  Star,
  Heart,
  Award,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
  Package,
  FileText,
  Tag,
  ClipboardList,
  Settings,
  Bell,
  Pencil,
  Trash2,
  Copy,
  Download,
  LogOut,
  ExternalLink,
  Image as ImageIcon,
  Video,
  ArrowUp,
  ArrowDown,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Wallet,
  Upload,
  Store,
  Eye,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

/* ===================== HELPER & KONSTANTA ===================== */
const STATUS = {
  tersedia: { label: "Tersedia", cls: "st-avail" },
  booked: { label: "Booked", cls: "st-booked" },
  terjual: { label: "Terjual", cls: "st-sold" },
};
const TINTS = [
  "#6F8B7C",
  "#7A8B6F",
  "#8B7F6F",
  "#6F8589",
  "#7C8267",
  "#6F7E8B",
  "#86827A",
];
const ICONS = {
  shield: ShieldCheck,
  scale: Scale,
  truck: Truck,
  leaf: Leaf,
  syringe: Syringe,
  heart: Heart,
  award: Award,
  clock: Clock,
};
const DP_PCT = 0.3;

const uid = (p = "k_") => p + Math.random().toString(36).slice(2, 9);
const now = () => new Date().toISOString();
const idr = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(n) || 0));
const idrShort = (n) => {
  n = Number(n) || 0;
  return n >= 1e6
    ? "Rp " + (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1).replace(".", ",") + " jt"
    : idr(n);
};
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
const fmtTime = (iso) =>
  new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
const est = (s) => (Number(s.hargaPerKg) || 0) * (Number(s.bobot) || 0);

const waInquiry = (st, s) => {
  const url = `${st.siteUrl}/domba/${s.id}`;
  const t = `Halo ${st.brand}, saya tertarik dengan domba *${s.id}* (${
    s.jenis
  }).\n\nBobot ${s.bobot} kg × ${idr(s.hargaPerKg)}/kg ≈ ${idr(
    est(s)
  )}.\nApakah masih tersedia?\n\nLink: ${url}`;
  return `https://wa.me/${st.waNumber}?text=${encodeURIComponent(t)}`;
};
const waCalc = (st, { sheep, weight, rate, qty, total }) => {
  const L = [
    `Halo ${st.brand}, saya mau pesan domba dengan estimasi berikut:`,
    "",
  ];
  if (sheep) L.push(`Domba: *${sheep.id}* (${sheep.jenis})`);
  L.push(`Berat: ${weight} kg`, `Harga: ${idr(rate)}/kg`);
  if (qty > 1) L.push(`Jumlah: ${qty} ekor`);
  L.push(`Estimasi total: *${idr(total)}*`);
  if (sheep) L.push("", `Link: ${st.siteUrl}/domba/${sheep.id}`);
  return `https://wa.me/${st.waNumber}?text=${encodeURIComponent(
    L.join("\n")
  )}`;
};

/* ===================== DATA AWAL ===================== */
function makeSeed() {
  const base = [
    [
      "DMB-001",
      "Domba Garut",
      42,
      14,
      "tersedia",
      110000,
      "Hitam–Putih",
      true,
      "Garut jantan postur tegap, leher tebal. Cocok untuk kontes maupun kurban premium.",
      "Rumput gajah + konsentrat, 2× sehari",
      "SE & cacing — lengkap",
    ],
    [
      "DMB-002",
      "Dorper",
      55,
      18,
      "tersedia",
      115000,
      "Putih–Kepala Hitam",
      true,
      "Dorper bobot besar, pertumbuhan cepat, daging padat. Temperamen tenang.",
      "Hijauan + pakan fermentasi",
      "SE & cacing — lengkap",
    ],
    [
      "DMB-003",
      "Ekor Gemuk (DEG)",
      38,
      12,
      "booked",
      95000,
      "Putih",
      false,
      "DEG lokal adaptif & tahan cuaca. Pilihan ekonomis kondisi sehat terjaga.",
      "Rumput lapangan + ampas tahu",
      "Cacing — lengkap",
    ],
    [
      "DMB-004",
      "Merino Cross",
      47,
      16,
      "tersedia",
      112000,
      "Krem Wol Tebal",
      false,
      "Persilangan Merino, bulu wol tebal & rapat. Ideal untuk display.",
      "Hijauan + konsentrat tinggi protein",
      "SE & cacing — lengkap",
    ],
    [
      "DMB-005",
      "Texel",
      51,
      17,
      "terjual",
      118000,
      "Putih",
      false,
      "Texel berotot, proporsi karkas baik. Sudah terjual.",
      "Hijauan + konsentrat",
      "SE & cacing — lengkap",
    ],
    [
      "DMB-006",
      "Domba Garut",
      40,
      13,
      "tersedia",
      100000,
      "Coklat–Putih",
      false,
      "Garut muda, tanduk mulai melingkar, gerak lincah.",
      "Rumput gajah + konsentrat",
      "Cacing — lengkap",
    ],
    [
      "DMB-007",
      "Domba Batur",
      49,
      15,
      "booked",
      108000,
      "Putih Wol Tebal",
      false,
      "Batur dataran tinggi, wol tebal tahan dingin. Menunggu pelunasan.",
      "Hijauan dataran tinggi + konsentrat",
      "SE & cacing — lengkap",
    ],
  ];
  const sheep = base.map((b, i) => ({
    _k: uid(),
    id: b[0],
    jenis: b[1],
    bobot: b[2],
    umur: b[3],
    status: b[4],
    hargaPerKg: b[5],
    warna: b[6],
    featured: b[7],
    desc: b[8],
    pakan: b[9],
    vaksin: b[10],
    tint: TINTS[i % TINTS.length],
    media: [
      {
        id: uid("m_"),
        type: "foto",
        name: "foto-utama.jpg",
        url: null,
        cover: true,
      },
    ],
    log: [
      { id: uid("l_"), t: "12 Mei", x: "Penimbangan rutin" },
      { id: uid("l_"), t: "28 Apr", x: "Vaksin SE" },
    ],
    createdAt: now(),
    updatedAt: now(),
  }));
  return {
    sheep,
    breeds: [
      "Domba Garut",
      "Dorper",
      "Ekor Gemuk (DEG)",
      "Merino Cross",
      "Texel",
      "Domba Batur",
    ],
    content: {
      hero: {
        eyebrow: "Peternakan Domba Premium · Sejak 2015",
        title: "Domba sehat, terawat,\ndibeli per kilogram.",
        sub: "Harga transparan per kg dan bobot tertimbang. Pilih dari katalog, hitung estimasi, lalu konfirmasi cepat lewat WhatsApp.",
        ctaLabel: "Lihat Katalog",
      },
      badges: [
        { ic: "shield", text: "Sehat & bervaksin" },
        { ic: "scale", text: "Ditimbang transparan" },
        { ic: "truck", text: "Antar ke lokasi" },
      ],
      about: {
        title: "Tentang HouseSheep",
        body: "Peternakan domba di Garut yang fokus pada kualitas dan kesehatan ternak. Setiap domba ditimbang, diperiksa dokter hewan, dan punya riwayat perawatan yang tercatat. Harga dihitung adil berdasarkan bobot hidup per kilogram.",
      },
    },
    settings: {
      brand: "HouseSheep",
      tagline: "Peternakan Domba Premium",
      waNumber: "6281234567890",
      siteUrl: "https://HouseSheep.id",
      location: "Garut, Jawa Barat",
      email: "halo@housesheep.id",
      hours: "Setiap hari, 07.00–17.00",
      accent: "#059669",
    },
    log: [
      {
        id: uid(),
        at: now(),
        who: "Admin",
        action: "Data contoh dimuat",
        kind: "create",
      },
    ],
  };
}

/* ===================== PENYIMPANAN ===================== */
function useDB() {
  const [db, setDb] = useState(null);
  const [persist, setPersist] = useState(true);
  useEffect(() => {
    (async () => {
      if (typeof window === "undefined" || !window.storage) {
        setPersist(false);
        setDb(makeSeed());
        return;
      }
      try {
        const r = await window.storage.get("etalase:db:v2");
        if (r && r.value) {
          setDb(JSON.parse(r.value));
          return;
        }
      } catch (e) {}
      const seed = makeSeed();
      setDb(seed);
      try {
        await window.storage.set("etalase:db:v2", JSON.stringify(seed));
      } catch (e) {
        setPersist(false);
      }
    })();
  }, []);
  const commit = useCallback((next) => {
    setDb(next);
    if (window.storage)
      window.storage
        .set("etalase:db:v2", JSON.stringify(next))
        .catch(() => setPersist(false));
  }, []);
  return { db, commit, persist };
}

/* ===================== KOMPONEN DASAR ===================== */
const SheepThumb = ({
  tint = "#6F8B7C",
  url,
  size = 44,
  radius = 9,
  kind = "foto",
  playing = false,
}) => {
  if (url)
    return kind === "klip" ? (
      <video
        src={url}
        muted
        loop
        playsInline
        autoPlay
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          objectFit: "cover",
        }}
      />
    ) : (
      <img
        src={url}
        alt=""
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          objectFit: "cover",
        }}
      />
    );
  return (
    <div
      className={"thumb-ph" + (playing ? " play" : "")}
      style={{ width: size, height: size, borderRadius: radius, "--t": tint }}
    >
      <svg
        viewBox="0 0 220 170"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {[78, 96, 128, 146].map((x, i) => (
          <rect
            key={i}
            x={x}
            y={104}
            width={9}
            height={30}
            rx={4}
            fill={tint}
            opacity={i < 2 ? 0.95 : 0.8}
          />
        ))}
        <ellipse cx={110} cy={86} rx={58} ry={34} fill="#fff" opacity={0.92} />
        <ellipse cx={110} cy={86} rx={58} ry={34} fill={tint} opacity={0.32} />
        {[64, 84, 106, 128, 150].map((x, i) => (
          <circle
            key={i}
            cx={x}
            cy={58 + (i % 2) * 4}
            r={13}
            fill="#fff"
            opacity={0.92}
          />
        ))}
        {[64, 84, 106, 128, 150].map((x, i) => (
          <circle
            key={"t" + i}
            cx={x}
            cy={58 + (i % 2) * 4}
            r={13}
            fill={tint}
            opacity={0.22}
          />
        ))}
        <ellipse cx={165} cy={playing ? 96 : 78} rx={17} ry={21} fill={tint} />
        <ellipse
          cx={154}
          cy={playing ? 84 : 66}
          rx={6}
          ry={9}
          fill={tint}
          opacity={0.7}
        />
        <circle cx={168} cy={playing ? 92 : 74} r={2.4} fill="#1b2a22" />
      </svg>
    </div>
  );
};
const Pill = ({ status, float }) => (
  <span className={"pill " + STATUS[status].cls + (float ? " float" : "")}>
    {STATUS[status].label}
  </span>
);
const Field = ({ label, hint, required, children }) => (
  <label className="field">
    <span className="field-label">
      {label}
      {required && <em>*</em>}
    </span>
    {children}
    {hint && <span className="field-hint">{hint}</span>}
  </label>
);
const Toggle = ({ on, onChange, label }) => (
  <button
    type="button"
    className={"toggle" + (on ? " is-on" : "")}
    onClick={() => onChange(!on)}
  >
    <span className="toggle-dot" />
    <span>{label}</span>
  </button>
);

/* ===================== KALKULATOR (dipakai ulang) ===================== */
function Calculator({ db, lockSheep = null, showCta = true, onResult }) {
  const st = db.settings;
  const avail = db.sheep.filter((s) => s.status !== "terjual");
  const [key, setKey] = useState(
    lockSheep ? lockSheep._k : avail[0]?._k || "manual"
  );
  const picked =
    lockSheep || (key !== "manual" ? db.sheep.find((s) => s._k === key) : null);
  const [rate, setRate] = useState(picked ? picked.hargaPerKg : 110000);
  const [weight, setWeight] = useState(picked ? picked.bobot : 40);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (lockSheep) return;
    const s = key === "manual" ? null : db.sheep.find((x) => x._k === key);
    if (s) {
      setRate(s.hargaPerKg);
      setWeight(s.bobot);
    }
  }, [key]); // eslint-disable-line

  const total = Math.round(rate * weight * qty);
  const dp = Math.round(total * DP_PCT);
  useEffect(() => {
    onResult &&
      onResult({ weight, rate, qty, total, dp, sheep: picked || null });
  }, [weight, rate, qty, total]); // eslint-disable-line

  const wmin = lockSheep ? Math.max(5, lockSheep.bobot - 12) : 5;
  const wmax = lockSheep ? lockSheep.bobot + 18 : 120;
  const clampW = (v) => Math.min(wmax, Math.max(wmin, Math.round(v) || wmin));

  return (
    <div className="calc">
      <div className="calc-controls">
        {!lockSheep && (
          <Field label="Pilih domba">
            <select value={key} onChange={(e) => setKey(e.target.value)}>
              {avail.map((s) => (
                <option key={s._k} value={s._k}>
                  {s.id} — {s.jenis} ({s.bobot} kg)
                </option>
              ))}
              <option value="manual">— Masukkan manual —</option>
            </select>
          </Field>
        )}

        <Field
          label="Harga per kg"
          hint={
            lockSheep
              ? "Sesuai daftar untuk domba ini"
              : key === "manual"
              ? "Masukkan harga Anda"
              : "Otomatis dari daftar, bisa diubah"
          }
        >
          {lockSheep ? (
            <div className="calc-fixed">
              {idr(rate)}
              <small>/kg</small>
            </div>
          ) : (
            <div className="calc-input">
              <span>Rp</span>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value) || 0)}
              />
              <b>/kg</b>
            </div>
          )}
        </Field>

        <Field label={`Berat (kg) — ${weight} kg`}>
          <input
            className="slider"
            type="range"
            min={wmin}
            max={wmax}
            step={1}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
          />
          <div className="calc-input mt">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(clampW(e.target.value))}
            />
            <b>kg</b>
          </div>
        </Field>

        {!lockSheep && (
          <Field label="Jumlah ekor">
            <div className="stepper">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus size={15} />
              </button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(99, q + 1))}>
                <Plus size={15} />
              </button>
            </div>
          </Field>
        )}
      </div>

      <div className="calc-result">
        <span className="eyebrow">Estimasi harga</span>
        <div className="calc-total">{idr(total)}</div>
        <div className="calc-break">
          <span>
            {idr(rate)}/kg × {weight} kg{qty > 1 ? ` × ${qty}` : ""}
          </span>
        </div>
        <div className="calc-dp">
          <Wallet size={14} /> Estimasi DP {Math.round(DP_PCT * 100)}% ·{" "}
          <b>{idr(dp)}</b>
        </div>
        <p className="calc-note">
          <AlertCircle size={13} /> Berat final ditimbang ulang saat serah
          terima.
        </p>
        {showCta && (
          <a
            className="btn btn-primary btn-block"
            href={waCalc(st, { sheep: picked, weight, rate, qty, total })}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WaIcon size={18} /> Pesan via WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

const WaIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zM12.04 20.15h-.004a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.42 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
  </svg>
);

/* ===================== STOREFRONT ===================== */
function PriceTag({ s, big }) {
  return (
    <div className={"price" + (big ? " big" : "")}>
      <span className="rate">
        {idr(s.hargaPerKg)}
        <small>/kg</small>
      </span>
      <span className="est">
        ≈ {idrShort(est(s))} · {s.bobot} kg
      </span>
    </div>
  );
}

function ProductCard({ s, onOpen, delay }) {
  const [hover, setHover] = useState(false);
  const cover = s.media.find((m) => m.cover) || s.media[0];
  return (
    <article
      className="card-prod rise"
      style={{ animationDelay: delay + "ms" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onOpen(s)}
    >
      <div className="prod-media">
        <SheepThumb
          tint={s.tint}
          url={cover?.url}
          kind={cover?.type}
          size={"100%"}
          radius={0}
          playing={hover && !cover?.url}
        />
        <Pill status={s.status} float />
        <span className="clip">
          <span className="clip-play">
            <Play size={10} fill="currentColor" />
          </span>
          {hover ? "Memutar klip" : "Klip · 4 dtk"}
          <Volume2 size={11} />
        </span>
      </div>
      <div className="prod-body">
        <div className="prod-top">
          <span className="mono">{s.id}</span>
          <span className="muted sm">{s.warna}</span>
        </div>
        <h3>
          {s.jenis}
          {s.featured && <Star size={13} fill="#B97309" color="#B97309" />}
        </h3>
        <div className="prod-meta">
          <span>
            <Scale size={14} /> {s.bobot} kg
          </span>
          <span>
            <CalendarDays size={14} /> {s.umur} bln
          </span>
        </div>
        <div className="prod-foot">
          <PriceTag s={s} />
          <span className="detail-link">
            Detail <ChevronRight size={15} />
          </span>
        </div>
      </div>
    </article>
  );
}

function ProductDetail({ s, db, onClose }) {
  const [active, setActive] = useState(0);
  const [res, setRes] = useState({
    weight: s.bobot,
    rate: s.hargaPerKg,
    qty: 1,
    total: est(s),
    sheep: s,
  });
  const media = useMemo(
    () => [
      { kind: "foto", label: "Foto utama" },
      { kind: "foto", label: "Tampak samping" },
      { kind: "klip", label: "Klip video" },
      { kind: "foto", label: "Tampak depan" },
    ],
    []
  );
  const sold = s.status === "terjual";
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  const go = (d) => setActive((a) => (a + d + media.length) % media.length);
  const cover = s.media.find((m) => m.cover) || s.media[0];

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="scrim" onClick={onClose} />
      <div className="sheet">
        <button className="icon-btn close" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="detail-grid">
          <div className="gallery">
            <div className="gallery-main">
              <SheepThumb
                tint={s.tint}
                url={media[active].kind === "klip" ? null : cover?.url}
                kind={media[active].kind}
                size={"100%"}
                radius={0}
                playing={media[active].kind === "klip"}
              />
              <Pill status={s.status} float />
              <button className="nav nav-l" onClick={() => go(-1)}>
                <ChevronLeft size={18} />
              </button>
              <button className="nav nav-r" onClick={() => go(1)}>
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="thumbs">
              {media.map((m, i) => (
                <button
                  key={i}
                  className={"thumb" + (i === active ? " on" : "")}
                  onClick={() => setActive(i)}
                >
                  <SheepThumb
                    tint={s.tint}
                    url={null}
                    size={"100%"}
                    radius={0}
                  />
                  {m.kind === "klip" && (
                    <span className="thumb-play">
                      <Play size={12} fill="currentColor" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="detail-info">
            <span className="eyebrow">
              {s.id} · {s.warna}
            </span>
            <h2>{s.jenis}</h2>
            <PriceTag s={s} big />
            <p className="detail-desc">{s.desc}</p>
            <div className="spec">
              <div className="spec-cell">
                <span>Bobot</span>
                <strong>{s.bobot} kg</strong>
              </div>
              <div className="spec-cell">
                <span>Umur</span>
                <strong>{s.umur} bulan</strong>
              </div>
              <div className="spec-cell">
                <span>Harga/kg</span>
                <strong>{idr(s.hargaPerKg)}</strong>
              </div>
              <div className="spec-cell">
                <span>Status</span>
                <strong className={"sp-st " + STATUS[s.status].cls}>
                  {STATUS[s.status].label}
                </strong>
              </div>
            </div>
            <div className="care">
              <div className="care-row">
                <Leaf size={16} />
                <div>
                  <span>Pakan</span>
                  <p>{s.pakan}</p>
                </div>
              </div>
              <div className="care-row">
                <Syringe size={16} />
                <div>
                  <span>Vaksin & kesehatan</span>
                  <p>{s.vaksin}</p>
                </div>
              </div>
            </div>
            <div className="timeline">
              <span className="tl-head">
                <Clock size={14} /> Riwayat perawatan
              </span>
              {s.log.map((l) => (
                <div key={l.id} className="tl-item">
                  <span className="tl-dot" />
                  <b>{l.t}</b> {l.x}
                </div>
              ))}
            </div>

            {!sold && (
              <div className="detail-calc">
                <span className="tl-head">
                  <CalcIcon size={14} /> Hitung estimasi harga
                </span>
                <Calculator
                  db={db}
                  lockSheep={s}
                  showCta={false}
                  onResult={setRes}
                />
              </div>
            )}
          </div>
        </div>

        <div className="sticky-bar">
          <div className="sticky-price">
            <span>{sold ? "Status" : "Estimasi"}</span>
            <strong>{sold ? "Terjual" : idr(res.total)}</strong>
          </div>
          {sold ? (
            <button className="btn wa is-disabled" disabled>
              <Check size={18} /> Sudah Terjual
            </button>
          ) : (
            <a
              className="btn wa"
              href={waCalc(db.settings, res)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WaIcon size={20} /> Pesan via WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Storefront({ db, onAdmin }) {
  const c = db.content,
    st = db.settings;
  const [filter, setFilter] = useState("semua");
  const [jenis, setJenis] = useState("semua");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);
  const [menu, setMenu] = useState(false);

  const list = useMemo(
    () =>
      db.sheep.filter(
        (s) =>
          (filter === "semua" || s.status === filter) &&
          (jenis === "semua" || s.jenis === jenis) &&
          (!q || (s.id + s.jenis).toLowerCase().includes(q.toLowerCase()))
      ),
    [db.sheep, filter, jenis, q]
  );

  const scroll = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenu(false);
  };

  return (
    <div className="shop">
      <header className="shop-head">
        <div className="wrap head-in">
          <button
            className="brand"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span className="brand-mark">
              <Leaf size={18} />
            </span>
            <span className="brand-name">{st.brand}</span>
          </button>
          <nav className={"shop-nav" + (menu ? " open" : "")}>
            <button onClick={() => scroll("katalog")}>Katalog</button>
            <button onClick={() => scroll("kalkulator")}>Kalkulator</button>
            <button onClick={() => scroll("tentang")}>Tentang</button>
            <button onClick={() => scroll("kontak")}>Kontak</button>
            <button className="nav-admin" onClick={onAdmin}>
              <LayoutDashboard size={15} /> Admin
            </button>
            <a
              className="nav-wa"
              href={`https://wa.me/${st.waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WaIcon size={16} /> Hubungi
            </a>
          </nav>
          <button
            className="icon-btn burger"
            onClick={() => setMenu((v) => !v)}
          >
            {menu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="wrap hero">
        <div className="hero-copy rise">
          <span className="eyebrow">{c.hero.eyebrow}</span>
          <h1>{c.hero.title}</h1>
          <p>{c.hero.sub}</p>
          <div className="hero-cta">
            <button
              className="btn btn-primary"
              onClick={() => scroll("katalog")}
            >
              {c.hero.ctaLabel} <ArrowRight size={17} />
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => scroll("kalkulator")}
            >
              <CalcIcon size={17} /> Hitung Harga
            </button>
          </div>
          <div className="trust">
            {c.badges.map((b, i) => {
              const I = ICONS[b.ic] || Leaf;
              return (
                <span key={i}>
                  <I size={15} /> {b.text}
                </span>
              );
            })}
          </div>
        </div>
        <div className="hero-video rise" style={{ animationDelay: "120ms" }}>
          <div className="pasture">
            <div className="sun" />
            <div className="cloud c1" />
            <div className="cloud c2" />
            <div className="hill h1" />
            <div className="hill h2" />
            <div className="graze">
              <SheepThumb
                tint="#5f7a6c"
                url={null}
                size={120}
                radius={0}
                playing
              />
            </div>
            <div className="graze g2">
              <SheepThumb
                tint="#6b8478"
                url={null}
                size={88}
                radius={0}
                playing
              />
            </div>
          </div>
          <span className="rec">
            <span className="rec-dot" /> Cuplikan kandang · loop
          </span>
        </div>
      </section>

      {/* KATALOG */}
      <section id="katalog" className="wrap section">
        <div className="sec-head-row">
          <div>
            <span className="eyebrow">{list.length} ekor</span>
            <h2 className="sec-title">Katalog Domba</h2>
          </div>
          <div className="search-in">
            <Search size={16} />
            <input
              placeholder="Cari ID atau jenis…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
        <div className="filters">
          {["semua", "tersedia", "booked", "terjual"].map((f) => (
            <button
              key={f}
              className={"chip" + (filter === f ? " on" : "")}
              onClick={() => setFilter(f)}
            >
              {f === "semua" ? "Semua" : STATUS[f].label}
            </button>
          ))}
          <select
            className="chip-sel"
            value={jenis}
            onChange={(e) => setJenis(e.target.value)}
          >
            <option value="semua">Semua jenis</option>
            {db.breeds.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        {list.length === 0 ? (
          <div className="empty">
            <Eye size={26} />
            <p>Tidak ada domba yang cocok. Ubah filter atau kata kunci.</p>
          </div>
        ) : (
          <div className="grid">
            {list.map((s, i) => (
              <ProductCard key={s._k} s={s} onOpen={setSel} delay={i * 50} />
            ))}
          </div>
        )}
      </section>

      {/* KALKULATOR */}
      <section id="kalkulator" className="wrap section">
        <div className="calc-band">
          <div className="calc-intro">
            <span className="eyebrow">Transparan</span>
            <h2 className="sec-title">Kalkulator Harga Domba</h2>
            <p className="muted">
              Domba dijual <b>per kilogram</b>. Pilih domba atau masukkan harga
              sendiri, atur perkiraan berat, dan lihat estimasi totalnya secara
              langsung.
            </p>
            <ul className="calc-points">
              <li>
                <Check size={15} /> Hitungan adil sesuai bobot hidup
              </li>
              <li>
                <Check size={15} /> Estimasi DP otomatis
              </li>
              <li>
                <Check size={15} /> Langsung kirim rincian ke WhatsApp
              </li>
            </ul>
          </div>
          <div className="calc-card">
            <Calculator db={db} />
          </div>
        </div>
      </section>

      {/* PROSES */}
      <section className="wrap section">
        <span className="eyebrow center">Mudah</span>
        <h2 className="sec-title center">Cara pemesanan</h2>
        <div className="steps">
          {[
            [
              Search,
              "Pilih domba",
              "Telusuri katalog & lihat detail tiap domba.",
            ],
            [
              CalcIcon,
              "Hitung estimasi",
              "Pakai kalkulator untuk perkiraan harga per kg.",
            ],
            [
              WaIcon,
              "Konfirmasi WhatsApp",
              "Kirim rincian, sepakati harga & jadwal.",
            ],
            [
              Truck,
              "Timbang & antar",
              "Ditimbang ulang saat serah terima, lalu diantar.",
            ],
          ].map((x, i) => {
            const I = x[0];
            return (
              <div key={i} className="step">
                <span className="step-no">{i + 1}</span>
                <span className="step-ic">
                  <I size={18} />
                </span>
                <b>{x[1]}</b>
                <p>{x[2]}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* TENTANG */}
      <section id="tentang" className="wrap section">
        <div className="about">
          <div className="about-art">
            <SheepThumb tint="#6F8B7C" url={null} size={"100%"} radius={18} />
          </div>
          <div className="about-copy">
            <span className="eyebrow">Tentang kami</span>
            <h2 className="sec-title">{c.about.title}</h2>
            <p>{c.about.body}</p>
            <div className="about-stats">
              <div>
                <strong>{db.sheep.length}</strong>
                <span>domba di katalog</span>
              </div>
              <div>
                <strong>
                  {db.sheep.filter((s) => s.status === "tersedia").length}
                </strong>
                <span>siap dibeli</span>
              </div>
              <div>
                <strong>{db.breeds.length}</strong>
                <span>jenis tersedia</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="wrap section">
        <span className="eyebrow center">Pertanyaan umum</span>
        <h2 className="sec-title center">FAQ</h2>
        <div className="faq">
          {[
            [
              "Bagaimana cara harganya dihitung?",
              "Harga dihitung per kilogram bobot hidup. Estimasi di situs memakai bobot terakhir; berat final ditimbang ulang saat serah terima.",
            ],
            [
              "Apakah bisa diantar?",
              "Bisa. Pengiriman ke lokasi Anda diatur saat konfirmasi via WhatsApp, ongkos menyesuaikan jarak.",
            ],
            [
              "Apakah ada DP?",
              "Untuk mengamankan domba (status Booked), umumnya DP 30%. Pelunasan dilakukan saat serah terima.",
            ],
            [
              "Apakah domba sehat & bervaksin?",
              "Setiap domba diperiksa dokter hewan dengan riwayat pakan dan vaksin yang tercatat pada halaman detailnya.",
            ],
          ].map((f, i) => (
            <FaqItem key={i} q={f[0]} a={f[1]} />
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer id="kontak" className="shop-foot">
        <div className="wrap foot-in">
          <div>
            <div className="brand">
              <span className="brand-mark">
                <Leaf size={16} />
              </span>
              <span className="brand-name">{st.brand}</span>
            </div>
            <p className="foot-tag">
              {st.tagline}. Harga per kg, transparan, sehat & bervaksin.
            </p>
            <a
              className="btn btn-primary sm"
              href={`https://wa.me/${st.waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WaIcon size={16} /> Chat WhatsApp
            </a>
          </div>
          <div className="foot-meta">
            <span>
              <MapPin size={14} /> {st.location}
            </span>
            <span>
              <Clock size={14} /> {st.hours}
            </span>
            <a
              href={`https://wa.me/${st.waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Phone size={14} /> +{st.waNumber}
            </a>
            <a href={`mailto:${st.email}`}>
              <Mail size={14} /> {st.email}
            </a>
          </div>
        </div>
        <div className="wrap foot-fine">
          © {new Date().getFullYear()} {st.brand} · Etalase domba
        </div>
      </footer>

      {sel && <ProductDetail s={sel} db={db} onClose={() => setSel(null)} />}
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={"faq-item" + (open ? " open" : "")}>
      <button onClick={() => setOpen((o) => !o)}>
        <span>{q}</span>
        <ChevronDown size={18} />
      </button>
      {open && <p>{a}</p>}
    </div>
  );
}

/* ===================== CMS ===================== */
function Login({ onLogin, brand, onBack }) {
  return (
    <div className="login">
      <div className="login-card">
        <div className="brand brand-lg">
          <span className="brand-mark">
            <Leaf size={20} />
          </span>
          <span className="brand-name">{brand}</span>
        </div>
        <h1 className="login-title">Masuk ke Panel Admin</h1>
        <p className="login-sub">
          Kelola katalog, harga, konten, dan pengaturan etalase.
        </p>
        <Field label="Email">
          <input defaultValue="admin@housesheep.id" />
        </Field>
        <Field label="Kata sandi">
          <input type="password" placeholder="••••••••" />
        </Field>
        <button className="btn btn-primary btn-block" onClick={onLogin}>
          Masuk
        </button>
        <button className="link center-link" onClick={onBack}>
          <ChevronLeft size={14} /> Kembali ke etalase
        </button>
        <p className="login-note">
          <AlertCircle size={13} /> Mode demo — kredensial apa pun diterima.
          Produksi: JWT, session timeout, rate-limit.
        </p>
      </div>
    </div>
  );
}

function Dashboard({ db, go }) {
  const c = useMemo(() => {
    const s = db.sheep;
    return {
      total: s.length,
      tersedia: s.filter((x) => x.status === "tersedia").length,
      booked: s.filter((x) => x.status === "booked").length,
      terjual: s.filter((x) => x.status === "terjual").length,
      featured: s.filter((x) => x.featured).length,
      nilai: s
        .filter((x) => x.status !== "terjual")
        .reduce((a, x) => a + est(x), 0),
    };
  }, [db.sheep]);
  const statusData = [
    { name: "Tersedia", value: c.tersedia, color: "#059669" },
    { name: "Booked", value: c.booked, color: "#B97309" },
    { name: "Terjual", value: c.terjual, color: "#8B948C" },
  ].filter((d) => d.value);
  const jenisData = useMemo(() => {
    const m = {};
    db.sheep.forEach((s) => (m[s.jenis] = (m[s.jenis] || 0) + 1));
    return Object.entries(m)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [db.sheep]);
  const kpis = [
    ["Total stok", c.total, <Package size={18} />, ""],
    ["Tersedia", c.tersedia, <CheckCircle2 size={18} />, "k-green"],
    ["Booked", c.booked, <Clock size={18} />, "k-amber"],
    ["Terjual", c.terjual, <TrendingUp size={18} />, "k-gray"],
  ];
  return (
    <div className="page">
      <div className="kpis">
        {kpis.map((x) => (
          <div key={x[0]} className={"kpi " + x[3]}>
            <span className="kpi-ic">{x[2]}</span>
            <div>
              <strong>{x[1]}</strong>
              <span>{x[0]}</span>
            </div>
          </div>
        ))}
        <div className="kpi k-wide">
          <span className="kpi-ic">
            <Wallet size={18} />
          </span>
          <div>
            <strong>{idr(c.nilai)}</strong>
            <span>Estimasi nilai inventaris</span>
          </div>
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <h3>Distribusi status</h3>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={84}
                  paddingAngle={2}
                  stroke="none"
                >
                  {statusData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <strong>{c.total}</strong>
              <span>domba</span>
            </div>
          </div>
          <div className="legend">
            {statusData.map((d) => (
              <span key={d.name}>
                <i style={{ background: d.color }} />
                {d.name} · {d.value}
              </span>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <h3>Stok per jenis</h3>
          </div>
          <ResponsiveContainer width="100%" height={262}>
            <BarChart
              data={jenisData}
              layout="vertical"
              margin={{ left: 8, right: 16 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 12, fill: "#5B6B62" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip cursor={{ fill: "rgba(5,150,105,.06)" }} />
              <Bar
                dataKey="value"
                fill="#059669"
                radius={[0, 6, 6, 0]}
                barSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <h3>Aktivitas terbaru</h3>
            <button className="link" onClick={() => go("log")}>
              Lihat semua <ChevronRight size={14} />
            </button>
          </div>
          <div className="feed">
            {db.log.slice(0, 6).map((l) => (
              <div key={l.id} className="feed-row">
                <span className={"feed-dot " + l.kind} />
                <div>
                  <p>{l.action}</p>
                  <span>
                    {fmtTime(l.at)} · {l.who}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card card-cta">
          <h3>Tindakan cepat</h3>
          <div className="qa">
            <button className="qa-btn" onClick={() => go("inventory:new")}>
              <Plus size={16} /> Tambah domba
            </button>
            <button className="qa-btn" onClick={() => go("content")}>
              <FileText size={16} /> Edit konten
            </button>
            <button className="qa-btn" onClick={() => go("etalase")}>
              <Eye size={16} /> Lihat etalase
            </button>
            <button className="qa-btn" onClick={() => go("settings")}>
              <Settings size={16} /> Pengaturan
            </button>
          </div>
          <div className="hint-box">
            <Sparkles size={15} /> {c.featured} domba ditandai <b>unggulan</b> &
            tampil menonjol.
          </div>
        </div>
      </div>
    </div>
  );
}

function SheepEditor({ initial, breeds, onSave, onClose, toast }) {
  const [s, setS] = useState(() => initial);
  const fileRef = useRef(null);
  const set = (k, v) => setS((p) => ({ ...p, [k]: v }));
  const cover = s.media.find((m) => m.cover) || s.media[0];
  const addMedia = (file) => {
    if (!file) return;
    const type = file.type.startsWith("video") ? "klip" : "foto";
    const url = URL.createObjectURL(file);
    setS((p) => ({
      ...p,
      media: [
        ...p.media,
        {
          id: uid("m_"),
          type,
          name: file.name,
          url,
          cover: p.media.length === 0,
        },
      ],
    }));
  };
  const setCover = (id) =>
    setS((p) => ({
      ...p,
      media: p.media.map((m) => ({ ...m, cover: m.id === id })),
    }));
  const moveMedia = (i, d) =>
    setS((p) => {
      const a = [...p.media];
      const j = i + d;
      if (j < 0 || j >= a.length) return p;
      [a[i], a[j]] = [a[j], a[i]];
      return { ...p, media: a };
    });
  const delMedia = (id) =>
    setS((p) => {
      const a = p.media.filter((m) => m.id !== id);
      if (a.length && !a.some((m) => m.cover)) a[0].cover = true;
      return { ...p, media: a };
    });
  const addLog = () =>
    setS((p) => ({ ...p, log: [...p.log, { id: uid("l_"), t: "", x: "" }] }));
  const setLog = (id, k, v) =>
    setS((p) => ({
      ...p,
      log: p.log.map((l) => (l.id === id ? { ...l, [k]: v } : l)),
    }));
  const delLog = (id) =>
    setS((p) => ({ ...p, log: p.log.filter((l) => l.id !== id) }));
  const submit = () => {
    if (!s.id.trim()) return toast("ID domba wajib diisi", "err");
    if (!s.jenis.trim()) return toast("Jenis wajib diisi", "err");
    onSave({
      ...s,
      bobot: Number(s.bobot) || 0,
      umur: Number(s.umur) || 0,
      hargaPerKg: Number(s.hargaPerKg) || 0,
    });
  };
  const estTotal = (Number(s.hargaPerKg) || 0) * (Number(s.bobot) || 0);

  return (
    <div className="drawer-overlay">
      <div className="scrim" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <div>
            <span className="eyebrow">
              {initial._isNew ? "Domba baru" : "Edit domba"}
            </span>
            <h2>{s.id || "Tanpa ID"}</h2>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="drawer-body">
          <div className="editor-grid">
            <div className="editor-main">
              <section className="form-sec">
                <h4>Informasi dasar</h4>
                <div className="row-2">
                  <Field label="ID Domba" required hint="Unik, mis. DMB-008">
                    <input
                      value={s.id}
                      onChange={(e) => set("id", e.target.value)}
                      placeholder="DMB-008"
                    />
                  </Field>
                  <Field label="Jenis" required>
                    <input
                      list="brds"
                      value={s.jenis}
                      onChange={(e) => set("jenis", e.target.value)}
                      placeholder="Pilih / ketik"
                    />
                    <datalist id="brds">
                      {breeds.map((b) => (
                        <option key={b} value={b} />
                      ))}
                    </datalist>
                  </Field>
                </div>
                <div className="row-3">
                  <Field label="Bobot (kg)">
                    <input
                      type="number"
                      value={s.bobot}
                      onChange={(e) => set("bobot", e.target.value)}
                    />
                  </Field>
                  <Field label="Umur (bln)">
                    <input
                      type="number"
                      value={s.umur}
                      onChange={(e) => set("umur", e.target.value)}
                    />
                  </Field>
                  <Field label="Harga / kg (Rp)" required>
                    <input
                      type="number"
                      value={s.hargaPerKg}
                      onChange={(e) => set("hargaPerKg", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="est-line">
                  <CalcIcon size={14} /> Estimasi total: <b>{idr(estTotal)}</b>{" "}
                  <span className="muted">
                    ({idr(s.hargaPerKg || 0)}/kg × {s.bobot || 0} kg)
                  </span>
                </div>
                <div className="row-2">
                  <Field label="Warna / corak">
                    <input
                      value={s.warna}
                      onChange={(e) => set("warna", e.target.value)}
                    />
                  </Field>
                  <Field label="Status">
                    <select
                      value={s.status}
                      onChange={(e) => set("status", e.target.value)}
                    >
                      {Object.entries(STATUS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Toggle
                  on={s.featured}
                  onChange={(v) => set("featured", v)}
                  label="Tampilkan sebagai domba unggulan"
                />
              </section>
              <section className="form-sec">
                <h4>Deskripsi & perawatan</h4>
                <Field label="Deskripsi">
                  <textarea
                    rows={3}
                    value={s.desc}
                    onChange={(e) => set("desc", e.target.value)}
                  />
                </Field>
                <div className="row-2">
                  <Field label="Pakan">
                    <input
                      value={s.pakan}
                      onChange={(e) => set("pakan", e.target.value)}
                    />
                  </Field>
                  <Field label="Vaksin & kesehatan">
                    <input
                      value={s.vaksin}
                      onChange={(e) => set("vaksin", e.target.value)}
                    />
                  </Field>
                </div>
              </section>
              <section className="form-sec">
                <div className="sec-head">
                  <h4>Media (foto & klip)</h4>
                  <span className="auto-chip">
                    <Sparkles size={12} /> dikompres otomatis
                  </span>
                </div>
                <div className="media-grid">
                  {s.media.map((m, i) => (
                    <div
                      key={m.id}
                      className={"media-cell" + (m.cover ? " is-cover" : "")}
                    >
                      <SheepThumb
                        tint={s.tint}
                        url={m.url}
                        kind={m.type}
                        size={"100%"}
                        radius={10}
                      />
                      <span className="media-type">
                        {m.type === "klip" ? (
                          <Video size={11} />
                        ) : (
                          <ImageIcon size={11} />
                        )}
                        {m.type}
                      </span>
                      {m.cover && (
                        <span className="media-cover">
                          <Star size={11} fill="currentColor" /> sampul
                        </span>
                      )}
                      <div className="media-ops">
                        <button onClick={() => setCover(m.id)}>
                          <Star size={13} />
                        </button>
                        <button onClick={() => moveMedia(i, -1)}>
                          <ArrowUp size={13} />
                        </button>
                        <button onClick={() => moveMedia(i, 1)}>
                          <ArrowDown size={13} />
                        </button>
                        <button onClick={() => delMedia(m.id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    className="media-add"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload size={18} />
                    <span>Unggah foto / video</span>
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,video/*"
                    hidden
                    onChange={(e) => {
                      addMedia(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </div>
                <p className="field-hint">
                  Klip vertikal 3–5 detik diputar otomatis tanpa suara di kartu
                  produk.
                </p>
              </section>
              <section className="form-sec">
                <div className="sec-head">
                  <h4>Riwayat perawatan</h4>
                  <button className="link" onClick={addLog}>
                    <Plus size={14} /> Tambah
                  </button>
                </div>
                {s.log.length === 0 && (
                  <p className="field-hint">Belum ada catatan.</p>
                )}
                {s.log.map((l) => (
                  <div key={l.id} className="log-edit">
                    <input
                      className="log-t"
                      placeholder="Tgl"
                      value={l.t}
                      onChange={(e) => setLog(l.id, "t", e.target.value)}
                    />
                    <input
                      className="log-x"
                      placeholder="Catatan"
                      value={l.x}
                      onChange={(e) => setLog(l.id, "x", e.target.value)}
                    />
                    <button
                      className="icon-btn sm"
                      onClick={() => delLog(l.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </section>
            </div>
            <aside className="editor-aside">
              <span className="eyebrow">Pratinjau kartu</span>
              <div className="prev-card">
                <div className="prev-media">
                  <SheepThumb
                    tint={s.tint}
                    url={cover?.url}
                    kind={cover?.type}
                    size={"100%"}
                    radius={0}
                  />
                  <span className={"pill float " + STATUS[s.status].cls}>
                    {STATUS[s.status].label}
                  </span>
                </div>
                <div className="prev-body">
                  <div className="prod-top">
                    <span className="mono">{s.id || "DMB-???"}</span>
                    <span className="muted sm">{s.warna || "—"}</span>
                  </div>
                  <h3>{s.jenis || "Jenis"}</h3>
                  <div className="prod-meta">
                    <span>
                      <Scale size={13} /> {s.bobot || 0} kg
                    </span>
                  </div>
                  <PriceTag s={s} />
                </div>
              </div>
              <div className="tints">
                {TINTS.map((t) => (
                  <button
                    key={t}
                    className={"tint-dot" + (s.tint === t ? " is-on" : "")}
                    style={{ background: t }}
                    onClick={() => set("tint", t)}
                  />
                ))}
              </div>
              <p className="field-hint">
                Warna placeholder dipakai bila foto belum diunggah.
              </p>
            </aside>
          </div>
        </div>
        <div className="drawer-foot">
          <button className="btn btn-ghost" onClick={onClose}>
            Batal
          </button>
          <button className="btn btn-primary" onClick={submit}>
            <Save size={16} /> Simpan domba
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="drawer-overlay center">
      <div className="scrim" onClick={onCancel} />
      <div className="confirm">
        <span className="confirm-ic">
          <AlertCircle size={22} />
        </span>
        <p>{message}</p>
        <div className="confirm-act">
          <button className="btn btn-ghost" onClick={onCancel}>
            Batal
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

function Inventory({ db, actions, toast, openNew, onConsumedNew }) {
  const [q, setQ] = useState("");
  const [fS, setFS] = useState("semua");
  const [fJ, setFJ] = useState("semua");
  const [sort, setSort] = useState("baru");
  const [sel, setSel] = useState([]);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const blank = () => ({
    _k: uid(),
    _isNew: true,
    id: "",
    jenis: db.breeds[0] || "",
    bobot: "",
    umur: "",
    status: "tersedia",
    hargaPerKg: 110000,
    warna: "",
    featured: false,
    desc: "",
    pakan: "",
    vaksin: "",
    tint: TINTS[Math.floor(Math.random() * TINTS.length)],
    media: [],
    log: [],
    createdAt: now(),
    updatedAt: now(),
  });
  useEffect(() => {
    if (openNew) {
      setEditing(blank());
      onConsumedNew();
    }
  }, [openNew]); // eslint-disable-line
  const dup = (s) =>
    setEditing({
      ...s,
      _k: uid(),
      _isNew: true,
      id: s.id + "-COPY",
      media: s.media.map((m) => ({ ...m, id: uid("m_") })),
      log: s.log.map((l) => ({ ...l, id: uid("l_") })),
    });
  const rows = useMemo(() => {
    let r = db.sheep.filter(
      (s) =>
        (fS === "semua" || s.status === fS) &&
        (fJ === "semua" || s.jenis === fJ) &&
        (!q || (s.id + s.jenis).toLowerCase().includes(q.toLowerCase()))
    );
    return [...r].sort((a, b) =>
      sort === "bobot"
        ? b.bobot - a.bobot
        : sort === "harga"
        ? b.hargaPerKg - a.hargaPerKg
        : sort === "id"
        ? a.id.localeCompare(b.id)
        : new Date(b.updatedAt) - new Date(a.updatedAt)
    );
  }, [db.sheep, q, fS, fJ, sort]);
  const allSel = rows.length > 0 && rows.every((r) => sel.includes(r._k));
  const toggle = (k) =>
    setSel((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  const exportCSV = (l) => {
    const h = [
      "ID",
      "Jenis",
      "Bobot",
      "Umur",
      "HargaPerKg",
      "EstimasiTotal",
      "Status",
    ];
    const lines = [h.join(",")].concat(
      l.map((s) =>
        [s.id, s.jenis, s.bobot, s.umur, s.hargaPerKg, est(s), s.status].join(
          ","
        )
      )
    );
    const blob = new Blob(["\ufeff" + lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = "katalog-domba.csv";
    a.click();
    URL.revokeObjectURL(u);
    toast("CSV diunduh");
  };
  return (
    <div className="page">
      <div className="toolbar">
        <div className="search-in">
          <Search size={16} />
          <input
            placeholder="Cari ID atau jenis…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select value={fS} onChange={(e) => setFS(e.target.value)}>
          <option value="semua">Semua status</option>
          {Object.entries(STATUS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <select value={fJ} onChange={(e) => setFJ(e.target.value)}>
          <option value="semua">Semua jenis</option>
          {db.breeds.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="baru">Terbaru</option>
          <option value="bobot">Bobot ↓</option>
          <option value="harga">Harga/kg ↓</option>
          <option value="id">ID A–Z</option>
        </select>
        <div className="tb-spacer" />
        <button className="btn btn-ghost" onClick={() => exportCSV(rows)}>
          <Download size={15} /> Export
        </button>
        <button className="btn btn-primary" onClick={() => setEditing(blank())}>
          <Plus size={16} /> Tambah Domba
        </button>
      </div>
      {sel.length > 0 && (
        <div className="bulkbar">
          <span>{sel.length} dipilih</span>
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                actions.bulkStatus(sel, e.target.value);
                setSel([]);
                e.target.value = "";
              }
            }}
          >
            <option value="">Ubah status…</option>
            {Object.entries(STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <button
            className="btn btn-danger sm"
            onClick={() =>
              setConfirm({
                msg: `Hapus ${sel.length} domba?`,
                fn: () => {
                  actions.bulkDelete(sel);
                  setSel([]);
                },
              })
            }
          >
            <Trash2 size={14} /> Hapus
          </button>
          <button className="link" onClick={() => setSel([])}>
            Batal
          </button>
        </div>
      )}
      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th className="c-check">
                <input
                  type="checkbox"
                  checked={allSel}
                  onChange={() => setSel(allSel ? [] : rows.map((r) => r._k))}
                />
              </th>
              <th>Domba</th>
              <th>Bobot</th>
              <th>Harga/kg</th>
              <th>Estimasi</th>
              <th>Status</th>
              <th className="c-act"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const cover = s.media.find((m) => m.cover) || s.media[0];
              return (
                <tr key={s._k} className={sel.includes(s._k) ? "is-sel" : ""}>
                  <td className="c-check">
                    <input
                      type="checkbox"
                      checked={sel.includes(s._k)}
                      onChange={() => toggle(s._k)}
                    />
                  </td>
                  <td>
                    <div className="cell-sheep">
                      <SheepThumb
                        tint={s.tint}
                        url={cover?.url}
                        kind={cover?.type}
                      />
                      <div>
                        <b>
                          {s.jenis}{" "}
                          {s.featured && (
                            <Star size={12} fill="#B97309" color="#B97309" />
                          )}
                        </b>
                        <span className="mono">{s.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>{s.bobot} kg</td>
                  <td>{idr(s.hargaPerKg)}</td>
                  <td className="muted">{idrShort(est(s))}</td>
                  <td>
                    <select
                      className={"status-sel " + STATUS[s.status].cls}
                      value={s.status}
                      onChange={(e) => actions.setStatus(s._k, e.target.value)}
                    >
                      {Object.entries(STATUS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="c-act">
                    <button
                      className="icon-btn sm"
                      onClick={() => setEditing({ ...s })}
                    >
                      <Pencil size={15} />
                    </button>
                    <button className="icon-btn sm" onClick={() => dup(s)}>
                      <Copy size={15} />
                    </button>
                    <button
                      className="icon-btn sm danger"
                      onClick={() =>
                        setConfirm({
                          msg: `Hapus ${s.id}?`,
                          fn: () => actions.delSheep(s._k),
                        })
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-row">
                  <Eye size={22} />
                  <p>Tidak ada domba yang cocok.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="table-foot">
        Menampilkan {rows.length} dari {db.sheep.length} domba
      </p>
      {editing && (
        <SheepEditor
          initial={editing}
          breeds={db.breeds}
          toast={toast}
          onClose={() => setEditing(null)}
          onSave={(s) => {
            if (actions.saveSheep(s)) {
              setEditing(null);
              toast(s._isNew ? "Domba ditambahkan" : "Perubahan disimpan");
            }
          }}
        />
      )}
      {confirm && (
        <ConfirmDialog
          message={confirm.msg}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            confirm.fn();
            setConfirm(null);
          }}
        />
      )}
    </div>
  );
}

function ContentEditor({ db, save, toast }) {
  const [c, setC] = useState(db.content);
  const setHero = (k, v) =>
    setC((p) => ({ ...p, hero: { ...p.hero, [k]: v } }));
  const setAbout = (k, v) =>
    setC((p) => ({ ...p, about: { ...p.about, [k]: v } }));
  const setBadge = (i, k, v) =>
    setC((p) => ({
      ...p,
      badges: p.badges.map((b, j) => (j === i ? { ...b, [k]: v } : b)),
    }));
  return (
    <div className="page">
      <div className="grid-2 top">
        <div className="card">
          <div className="card-head">
            <h3>Hero / banner</h3>
          </div>
          <Field label="Eyebrow">
            <input
              value={c.hero.eyebrow}
              onChange={(e) => setHero("eyebrow", e.target.value)}
            />
          </Field>
          <Field label="Judul utama" hint="Gunakan Enter untuk pindah baris">
            <textarea
              rows={2}
              value={c.hero.title}
              onChange={(e) => setHero("title", e.target.value)}
            />
          </Field>
          <Field label="Sub-judul">
            <textarea
              rows={3}
              value={c.hero.sub}
              onChange={(e) => setHero("sub", e.target.value)}
            />
          </Field>
          <Field label="Teks tombol CTA">
            <input
              value={c.hero.ctaLabel}
              onChange={(e) => setHero("ctaLabel", e.target.value)}
            />
          </Field>
        </div>
        <div className="card">
          <div className="card-head">
            <h3>Pratinjau hero</h3>
          </div>
          <div className="hero-prev">
            <span className="eyebrow">{c.hero.eyebrow}</span>
            <h2>{c.hero.title}</h2>
            <p>{c.hero.sub}</p>
            <span className="prev-cta">{c.hero.ctaLabel || "Tombol"}</span>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <h3>Badge kepercayaan</h3>
          <button
            className="link"
            onClick={() =>
              setC((p) => ({
                ...p,
                badges: [...p.badges, { ic: "leaf", text: "Keunggulan baru" }],
              }))
            }
          >
            <Plus size={14} /> Tambah
          </button>
        </div>
        <div className="badge-list">
          {c.badges.map((b, i) => (
            <div key={i} className="badge-edit">
              <select
                value={b.ic}
                onChange={(e) => setBadge(i, "ic", e.target.value)}
              >
                {Object.keys(ICONS).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
              <input
                value={b.text}
                onChange={(e) => setBadge(i, "text", e.target.value)}
              />
              <button
                className="icon-btn sm danger"
                onClick={() =>
                  setC((p) => ({
                    ...p,
                    badges: p.badges.filter((_, j) => j !== i),
                  }))
                }
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <h3>Tentang peternakan</h3>
        </div>
        <Field label="Judul">
          <input
            value={c.about.title}
            onChange={(e) => setAbout("title", e.target.value)}
          />
        </Field>
        <Field label="Isi">
          <textarea
            rows={4}
            value={c.about.body}
            onChange={(e) => setAbout("body", e.target.value)}
          />
        </Field>
      </div>
      <div className="save-bar">
        <button
          className="btn btn-primary"
          onClick={() => {
            save(c);
            toast("Konten halaman disimpan");
          }}
        >
          <Save size={16} /> Simpan konten
        </button>
      </div>
    </div>
  );
}

function Breeds({ db, save, toast }) {
  const [val, setVal] = useState("");
  const counts = useMemo(() => {
    const m = {};
    db.sheep.forEach((s) => (m[s.jenis] = (m[s.jenis] || 0) + 1));
    return m;
  }, [db.sheep]);
  const add = () => {
    const v = val.trim();
    if (!v) return;
    if (db.breeds.some((b) => b.toLowerCase() === v.toLowerCase()))
      return toast("Jenis sudah ada", "err");
    save([...db.breeds, v]);
    setVal("");
    toast("Jenis ditambahkan");
  };
  const del = (b) => {
    if (counts[b]) return toast(`Masih dipakai ${counts[b]} domba`, "err");
    save(db.breeds.filter((x) => x !== b));
    toast("Jenis dihapus");
  };
  return (
    <div className="page">
      <div className="card narrow">
        <div className="card-head">
          <h3>Jenis / ras domba</h3>
        </div>
        <div className="add-row">
          <input
            placeholder="Nama jenis baru…"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <button className="btn btn-primary" onClick={add}>
            <Plus size={16} /> Tambah
          </button>
        </div>
        <div className="breed-list">
          {db.breeds.map((b) => (
            <div key={b} className="breed-row">
              <span className="breed-ic">
                <Tag size={15} />
              </span>
              <b>{b}</b>
              <span className="breed-count">{counts[b] || 0} domba</span>
              <button className="icon-btn sm danger" onClick={() => del(b)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsPage({ db, save, onReset, toast, persist }) {
  const [s, setS] = useState(db.settings);
  const set = (k, v) => setS((p) => ({ ...p, [k]: v }));
  return (
    <div className="page">
      <div className="grid-2 top">
        <div className="card">
          <div className="card-head">
            <h3>Identitas peternakan</h3>
          </div>
          <Field label="Nama brand">
            <input
              value={s.brand}
              onChange={(e) => set("brand", e.target.value)}
            />
          </Field>
          <Field label="Tagline">
            <input
              value={s.tagline}
              onChange={(e) => set("tagline", e.target.value)}
            />
          </Field>
          <Field label="Lokasi">
            <input
              value={s.location}
              onChange={(e) => set("location", e.target.value)}
            />
          </Field>
          <Field label="Jam operasional">
            <input
              value={s.hours}
              onChange={(e) => set("hours", e.target.value)}
            />
          </Field>
        </div>
        <div className="card">
          <div className="card-head">
            <h3>Kontak & WhatsApp</h3>
          </div>
          <Field
            label="Nomor WhatsApp"
            hint="Format internasional tanpa +, mis. 6281234567890"
          >
            <div className="wa-test">
              <input
                value={s.waNumber}
                onChange={(e) => set("waNumber", e.target.value)}
              />
              <a
                className="btn btn-ghost sm"
                href={`https://wa.me/${s.waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Phone size={14} /> Tes
              </a>
            </div>
          </Field>
          <Field label="Email">
            <input
              value={s.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field
            label="URL situs"
            hint="Dipakai untuk link pada pesan WhatsApp"
          >
            <input
              value={s.siteUrl}
              onChange={(e) => set("siteUrl", e.target.value)}
            />
          </Field>
          <Field label="Warna aksen">
            <div className="color-row">
              <input
                type="color"
                value={s.accent}
                onChange={(e) => set("accent", e.target.value)}
              />
              <input
                value={s.accent}
                onChange={(e) => set("accent", e.target.value)}
              />
            </div>
          </Field>
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <h3>Data & sistem</h3>
        </div>
        <div className="sys-row">
          <div>
            <b>Status penyimpanan</b>
            <p className="muted">
              {persist
                ? "Aktif — perubahan tersimpan & menetap antar sesi."
                : "Sementara (memori) — perubahan hilang saat ditutup."}
            </p>
          </div>
          <span className={"sys-chip " + (persist ? "ok" : "warn")}>
            {persist ? <Check size={13} /> : <AlertCircle size={13} />}
            {persist ? "Tersimpan" : "Memori"}
          </span>
        </div>
        <div className="sys-row">
          <div>
            <b>Reset data contoh</b>
            <p className="muted">Mengembalikan seluruh data ke kondisi awal.</p>
          </div>
          <button className="btn btn-ghost sm" onClick={onReset}>
            <RotateCcw size={14} /> Reset
          </button>
        </div>
        <div className="hint-box">
          <ShieldCheck size={15} /> Produksi: JWT + session timeout, security
          headers (CSP/HSTS), sanitasi unggahan, backup DB di server.
        </div>
      </div>
      <div className="save-bar">
        <button
          className="btn btn-primary"
          onClick={() => {
            save(s);
            toast("Pengaturan disimpan");
          }}
        >
          <Save size={16} /> Simpan pengaturan
        </button>
      </div>
    </div>
  );
}

function ActivityLog({ db }) {
  const [f, setF] = useState("semua");
  const kinds = {
    create: "Tambah",
    update: "Ubah",
    delete: "Hapus",
    status: "Status",
    content: "Konten",
    settings: "Pengaturan",
  };
  const rows = db.log.filter((l) => f === "semua" || l.kind === f);
  return (
    <div className="page">
      <div className="toolbar">
        <select value={f} onChange={(e) => setF(e.target.value)}>
          <option value="semua">Semua tipe</option>
          {Object.entries(kinds).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Pengguna</th>
              <th>Tipe</th>
              <th>Aktivitas</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id}>
                <td className="muted">{fmtTime(l.at)}</td>
                <td>
                  <b>{l.who}</b>
                </td>
                <td>
                  <span className={"kind-chip " + l.kind}>
                    {kinds[l.kind] || l.kind}
                  </span>
                </td>
                <td>{l.action}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="empty-row">
                  <ClipboardList size={22} />
                  <p>Belum ada aktivitas.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const NAV = [
  {
    group: "Utama",
    items: [
      ["dashboard", "Dashboard", LayoutDashboard],
      ["inventory", "Katalog Domba", Package],
    ],
  },
  {
    group: "Konten",
    items: [
      ["content", "Konten Halaman", FileText],
      ["breeds", "Jenis Domba", Tag],
    ],
  },
  {
    group: "Sistem",
    items: [
      ["log", "Log Aktivitas", ClipboardList],
      ["settings", "Pengaturan", Settings],
    ],
  },
];
const TITLES = {
  dashboard: "Dashboard",
  inventory: "Katalog Domba",
  content: "Konten Halaman",
  breeds: "Jenis Domba",
  log: "Log Aktivitas",
  settings: "Pengaturan",
};

function AdminApp({ db, actions, persist, toast, onExit }) {
  const [route, setRoute] = useState("dashboard");
  const [sidebar, setSidebar] = useState(false);
  const [openNew, setOpenNew] = useState(false);
  const go = (r) => {
    if (r === "etalase") return onExit();
    if (r === "inventory:new") {
      setRoute("inventory");
      setOpenNew(true);
    } else setRoute(r);
    setSidebar(false);
  };
  return (
    <div className="cms-app">
      <aside className={"sidebar" + (sidebar ? " open" : "")}>
        <div className="brand">
          <span className="brand-mark">
            <Leaf size={18} />
          </span>
          <span className="brand-name">{db.settings.brand}</span>
        </div>
        <nav className="side-nav">
          {NAV.map((g) => (
            <div key={g.group} className="nav-group">
              <span className="nav-group-t">{g.group}</span>
              {g.items.map(([k, l, I]) => (
                <button
                  key={k}
                  className={"nav-item" + (route === k ? " is-active" : "")}
                  onClick={() => go(k)}
                >
                  <I size={17} /> {l}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="side-foot">
          <div className="side-acc">
            <span className="avatar">A</span>
            <div>
              <b>Admin</b>
              <span>Akses penuh</span>
            </div>
          </div>
          <button className="nav-item" onClick={onExit}>
            <Store size={16} /> Lihat etalase
          </button>
        </div>
      </aside>
      {sidebar && (
        <div className="side-scrim" onClick={() => setSidebar(false)} />
      )}
      <div className="main">
        <header className="topbar">
          <button
            className="icon-btn only-mobile"
            onClick={() => setSidebar(true)}
          >
            <Menu size={20} />
          </button>
          <h1 className="top-title">{TITLES[route]}</h1>
          <div className="tb-spacer" />
          <button className="btn btn-ghost sm only-desk" onClick={onExit}>
            <ExternalLink size={14} /> Lihat etalase
          </button>
          <button className="icon-btn">
            <Bell size={18} />
          </button>
          <span className="avatar">A</span>
        </header>
        <main className="content">
          {route === "dashboard" && <Dashboard db={db} go={go} />}
          {route === "inventory" && (
            <Inventory
              db={db}
              actions={actions}
              toast={toast}
              openNew={openNew}
              onConsumedNew={() => setOpenNew(false)}
            />
          )}
          {route === "content" && (
            <ContentEditor db={db} save={actions.saveContent} toast={toast} />
          )}
          {route === "breeds" && (
            <Breeds db={db} save={actions.saveBreeds} toast={toast} />
          )}
          {route === "log" && <ActivityLog db={db} />}
          {route === "settings" && (
            <SettingsPage
              db={db}
              save={actions.saveSettings}
              onReset={actions.reset}
              toast={toast}
              persist={persist}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/* ===================== ROOT ===================== */
export default function App() {
  const { db, commit, persist } = useDB();
  const [mode, setMode] = useState("shop"); // shop | admin
  const [authed, setAuthed] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const id = "etl-fonts";
    if (!document.getElementById(id)) {
      const l = document.createElement("link");
      l.id = id;
      l.rel = "stylesheet";
      l.href =
        "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
      document.head.appendChild(l);
    }
  }, []);

  const toast = useCallback((msg, type = "ok") => {
    const id = uid();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);
  const logE = (action, kind) => ({
    id: uid(),
    at: now(),
    who: "Admin",
    action,
    kind,
  });
  const actions = useMemo(
    () => ({
      saveSheep: (s) => {
        if (
          db.sheep.some(
            (x) => x.id.toLowerCase() === s.id.toLowerCase() && x._k !== s._k
          )
        ) {
          toast("ID sudah dipakai", "err");
          return false;
        }
        const ex = db.sheep.some((x) => x._k === s._k);
        const cl = { ...s };
        delete cl._isNew;
        const sheep = ex
          ? db.sheep.map((x) =>
              x._k === s._k ? { ...cl, updatedAt: now() } : x
            )
          : [{ ...cl, createdAt: now(), updatedAt: now() }, ...db.sheep];
        commit({
          ...db,
          sheep,
          log: [
            logE(
              `${ex ? "Memperbarui" : "Menambah"} ${s.id}`,
              ex ? "update" : "create"
            ),
            ...db.log,
          ].slice(0, 200),
        });
        return true;
      },
      delSheep: (k) => {
        const s = db.sheep.find((x) => x._k === k);
        commit({
          ...db,
          sheep: db.sheep.filter((x) => x._k !== k),
          log: [logE(`Menghapus ${s?.id}`, "delete"), ...db.log].slice(0, 200),
        });
        toast("Domba dihapus");
      },
      setStatus: (k, status) => {
        const s = db.sheep.find((x) => x._k === k);
        commit({
          ...db,
          sheep: db.sheep.map((x) =>
            x._k === k ? { ...x, status, updatedAt: now() } : x
          ),
          log: [
            logE(`${s?.id} → ${STATUS[status].label}`, "status"),
            ...db.log,
          ].slice(0, 200),
        });
      },
      bulkStatus: (keys, status) => {
        commit({
          ...db,
          sheep: db.sheep.map((x) =>
            keys.includes(x._k) ? { ...x, status, updatedAt: now() } : x
          ),
          log: [
            logE(
              `Ubah status ${keys.length} domba → ${STATUS[status].label}`,
              "status"
            ),
            ...db.log,
          ].slice(0, 200),
        });
        toast("Status diperbarui");
      },
      bulkDelete: (keys) => {
        commit({
          ...db,
          sheep: db.sheep.filter((x) => !keys.includes(x._k)),
          log: [
            logE(`Menghapus ${keys.length} domba`, "delete"),
            ...db.log,
          ].slice(0, 200),
        });
        toast("Domba dihapus");
      },
      saveContent: (content) =>
        commit({
          ...db,
          content,
          log: [logE("Memperbarui konten halaman", "content"), ...db.log].slice(
            0,
            200
          ),
        }),
      saveBreeds: (breeds) =>
        commit({
          ...db,
          breeds,
          log: [logE("Memperbarui daftar jenis", "content"), ...db.log].slice(
            0,
            200
          ),
        }),
      saveSettings: (settings) =>
        commit({
          ...db,
          settings,
          log: [logE("Memperbarui pengaturan", "settings"), ...db.log].slice(
            0,
            200
          ),
        }),
      reset: () => {
        commit(makeSeed());
        toast("Data direset");
      },
    }),
    [db, commit, toast]
  );

  if (!db)
    return (
      <div className="boot">
        <div className="boot-dot" /> Memuat…
      </div>
    );

  return (
    <div
      className="app"
      style={{ "--accent": db.settings.accent || "#059669" }}
    >
      <style>{CSS}</style>
      {mode === "shop" ? (
        <Storefront db={db} onAdmin={() => setMode("admin")} />
      ) : authed ? (
        <AdminApp
          db={db}
          actions={actions}
          persist={persist}
          toast={toast}
          onExit={() => setMode("shop")}
        />
      ) : (
        <Login
          brand={db.settings.brand}
          onLogin={() => setAuthed(true)}
          onBack={() => setMode("shop")}
        />
      )}
      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={"toast " + t.type}>
            {t.type === "err" ? (
              <AlertCircle size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== STYLE ===================== */
const CSS = `
*{box-sizing:border-box;}
.app{--bg:#F6F8F4;--surf:#fff;--ink:#16241D;--soft:#5B6B62;--line:#E6EAE3;--accent:#059669;--acc-d:#04795b;--acc-soft:#E8F6EE;--amber:#B97309;--amber-soft:#FBF1E0;--gray:#8B948C;--gray-soft:#EEF0EC;--red:#C0392B;--red-soft:#FBECEA;--sh-sm:0 1px 2px rgba(20,40,30,.05),0 2px 6px rgba(20,40,30,.04);--sh-md:0 8px 24px rgba(20,40,30,.08),0 2px 8px rgba(20,40,30,.05);--sh-lg:0 22px 50px rgba(20,40,30,.16);--disp:'Fraunces',Georgia,serif;--body:'Plus Jakarta Sans',system-ui,sans-serif;font-family:var(--body);color:var(--ink);-webkit-font-smoothing:antialiased;line-height:1.5;}
.boot{min-height:100vh;display:flex;align-items:center;justify-content:center;gap:10px;background:#F6F8F4;color:#5B6B62;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;}
.boot-dot{width:12px;height:12px;border-radius:50%;background:#059669;animation:bp 1s infinite;}@keyframes bp{0%,100%{opacity:.3;transform:scale(.8);}50%{opacity:1;transform:scale(1.1);}}
.wrap{max-width:1140px;margin:0 auto;padding:0 22px;}
.eyebrow{font-size:11.5px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--accent);}
.eyebrow.center,.sec-title.center{display:block;text-align:center;}
.sec-title{font-family:var(--disp);font-weight:600;font-size:30px;line-height:1.1;margin:5px 0 0;letter-spacing:-.01em;}
.mono{font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--soft);}
.muted{color:var(--soft);} .sm{font-size:11.5px;}
.brand{display:flex;align-items:center;gap:10px;background:none;border:0;cursor:pointer;padding:0;color:var(--ink);}
.brand-mark{width:32px;height:32px;border-radius:9px;background:var(--accent);color:#fff;display:grid;place-items:center;box-shadow:var(--sh-sm);}
.brand-name{font-family:var(--disp);font-weight:600;font-size:18px;}
.brand-lg .brand-mark{width:40px;height:40px;border-radius:11px;} .brand-lg .brand-name{font-size:22px;}
.link{display:inline-flex;align-items:center;gap:3px;background:none;border:0;cursor:pointer;color:var(--acc-d);font-weight:700;font-size:13px;font-family:var(--body);}
.center-link{justify-content:center;width:100%;margin-top:12px;}

.btn{display:inline-flex;align-items:center;gap:7px;border:0;cursor:pointer;font-family:var(--body);font-weight:700;font-size:14px;padding:11px 18px;border-radius:11px;transition:.16s;white-space:nowrap;text-decoration:none;}
.btn.sm{padding:8px 13px;font-size:13px;border-radius:9px;}
.btn-primary{background:var(--accent);color:#fff;box-shadow:var(--sh-sm);}.btn-primary:hover{background:var(--acc-d);transform:translateY(-1px);}
.btn-ghost{background:var(--surf);color:var(--ink);border:1px solid var(--line);}.btn-ghost:hover{border-color:var(--accent);color:var(--acc-d);}
.btn-danger{background:var(--red-soft);color:var(--red);}.btn-danger:hover{background:var(--red);color:#fff;}
.btn-block{width:100%;justify-content:center;}
.icon-btn{width:36px;height:36px;border-radius:9px;border:1px solid transparent;background:none;cursor:pointer;display:grid;place-items:center;color:var(--soft);transition:.15s;}
.icon-btn:hover{background:var(--gray-soft);color:var(--ink);}.icon-btn.sm{width:30px;height:30px;}.icon-btn.danger:hover{background:var(--red-soft);color:var(--red);}

input,select,textarea{font-family:var(--body);font-size:14px;color:var(--ink);border:1px solid var(--line);border-radius:9px;padding:9px 12px;background:var(--bg);outline:0;width:100%;transition:.15s;}
input:focus,select:focus,textarea:focus{border-color:var(--accent);background:var(--surf);box-shadow:0 0 0 3px var(--acc-soft);}
textarea{resize:vertical;line-height:1.5;}
.field{display:block;margin-bottom:14px;}.field-label{display:block;font-size:12.5px;font-weight:700;margin-bottom:6px;}.field-label em{color:var(--red);font-style:normal;margin-left:2px;}.field-hint{display:block;font-size:12px;color:var(--soft);margin-top:5px;}
.row-2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}.row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
.toggle{display:flex;align-items:center;gap:10px;background:none;border:0;cursor:pointer;font-family:var(--body);font-size:13.5px;font-weight:600;color:var(--ink);padding:6px 0;}
.toggle-dot{width:40px;height:23px;border-radius:20px;background:var(--gray-soft);position:relative;transition:.18s;flex:none;}
.toggle-dot::after{content:"";position:absolute;top:3px;left:3px;width:17px;height:17px;border-radius:50%;background:#fff;box-shadow:var(--sh-sm);transition:.18s;}
.toggle.is-on .toggle-dot{background:var(--accent);}.toggle.is-on .toggle-dot::after{left:20px;}

.pill{display:inline-flex;font-size:11.5px;font-weight:700;padding:4px 10px;border-radius:30px;}
.pill.float{position:absolute;top:11px;right:11px;box-shadow:var(--sh-sm);z-index:2;}
.st-avail{background:var(--acc-soft);color:var(--acc-d);}.st-booked{background:var(--amber-soft);color:var(--amber);}.st-sold{background:var(--gray-soft);color:var(--gray);}
.thumb-ph{background:radial-gradient(120% 100% at 20% 0%,#fff,color-mix(in srgb,var(--t) 18%,#fff));display:grid;place-items:center;overflow:hidden;flex:none;}
.thumb-ph svg{width:78%;transition:transform 4s ease;}.thumb-ph.play svg{transform:scale(1.08);}

.price{display:flex;flex-direction:column;}
.price .rate{font-weight:800;font-size:17px;color:var(--ink);}.price .rate small{font-size:12px;font-weight:600;color:var(--soft);margin-left:1px;}
.price .est{font-size:12px;color:var(--soft);font-weight:600;margin-top:1px;}
.price.big .rate{font-size:24px;}.price.big{margin:10px 0 4px;}

/* ===== STOREFRONT ===== */
.shop-head{position:sticky;top:0;z-index:40;background:rgba(246,248,244,.82);backdrop-filter:saturate(1.4) blur(12px);border-bottom:1px solid var(--line);}
.head-in{display:flex;align-items:center;justify-content:space-between;height:64px;}
.shop-nav{display:flex;align-items:center;gap:4px;}
.shop-nav>button{background:none;border:0;cursor:pointer;font-family:var(--body);font-size:14px;font-weight:600;color:var(--soft);padding:8px 13px;border-radius:9px;transition:.16s;}
.shop-nav>button:hover{color:var(--ink);background:var(--gray-soft);}
.nav-admin{display:inline-flex;align-items:center;gap:6px;}
.nav-wa{display:inline-flex;align-items:center;gap:7px;margin-left:6px;text-decoration:none;font-size:14px;font-weight:700;color:#fff;background:var(--accent);padding:9px 15px;border-radius:10px;box-shadow:var(--sh-sm);}.nav-wa:hover{background:var(--acc-d);}
.burger{display:none;}

.hero{display:grid;grid-template-columns:1.05fr .95fr;gap:48px;align-items:center;padding:60px 0 30px;}
.hero-copy h1{font-family:var(--disp);font-weight:600;font-size:48px;line-height:1.05;letter-spacing:-.02em;margin:16px 0 0;white-space:pre-line;}
.hero-copy p{font-size:17px;color:var(--soft);max-width:460px;margin:18px 0 26px;}
.hero-cta{display:flex;gap:12px;flex-wrap:wrap;}
.trust{display:flex;gap:20px;flex-wrap:wrap;margin-top:28px;}
.trust span{display:inline-flex;align-items:center;gap:7px;font-size:13.5px;font-weight:600;color:var(--soft);}.trust svg{color:var(--accent);}
.hero-video{position:relative;border-radius:22px;overflow:hidden;box-shadow:var(--sh-lg);aspect-ratio:4/3.1;border:1px solid var(--line);}
.pasture{position:absolute;inset:0;background:linear-gradient(180deg,#cfe7f2,#e7f3ec 52%,#dcecd6);overflow:hidden;}
.sun{position:absolute;top:14%;right:16%;width:80px;height:80px;border-radius:50%;background:radial-gradient(circle,#fff7df,#ffe9a8 55%,rgba(255,233,168,0) 72%);}
.cloud{position:absolute;height:26px;border-radius:30px;background:rgba(255,255,255,.85);filter:blur(2px);}
.c1{top:18%;width:90px;left:-30%;animation:drift 26s linear infinite;}.c2{top:30%;width:60px;left:-30%;animation:drift 38s linear infinite;animation-delay:-8s;opacity:.7;}
.hill{position:absolute;left:-5%;right:-5%;border-radius:50% 50% 0 0;}
.h1{bottom:-14%;height:46%;background:linear-gradient(180deg,#a9cf9b,#8cbf86);}.h2{bottom:-22%;height:40%;left:-20%;right:30%;background:linear-gradient(180deg,#bcd9ac,#9ec894);}
.graze{position:absolute;bottom:6%;left:18%;width:120px;animation:bob 3.4s ease-in-out infinite;}.g2{left:54%;bottom:3%;width:88px;animation-delay:-1.5s;opacity:.92;}
.graze .thumb-ph{background:none;}
.rec{position:absolute;top:14px;left:14px;display:inline-flex;align-items:center;gap:7px;background:rgba(20,36,29,.62);color:#fff;font-size:11.5px;font-weight:600;padding:6px 11px;border-radius:30px;backdrop-filter:blur(4px);}
.rec-dot{width:7px;height:7px;border-radius:50%;background:#ff5d5d;animation:pulse 1.6s ease-in-out infinite;}
@keyframes drift{to{left:130%;}}@keyframes bob{0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.3;}}

.section{padding:42px 0;}
.sec-head-row{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-bottom:18px;}
.search-in{display:flex;align-items:center;gap:8px;background:var(--surf);border:1px solid var(--line);border-radius:11px;padding:0 14px;box-shadow:var(--sh-sm);color:var(--soft);min-width:240px;}
.search-in input{border:0;background:none;padding:10px 0;}.search-in input:focus{box-shadow:none;}
.filters{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:24px;align-items:center;}
.chip{background:var(--surf);border:1px solid var(--line);cursor:pointer;font-family:var(--body);font-weight:600;font-size:13.5px;color:var(--soft);padding:8px 16px;border-radius:30px;transition:.16s;}
.chip:hover{border-color:var(--accent);}.chip.on{background:var(--ink);color:#fff;border-color:var(--ink);}
.chip-sel{width:auto;border-radius:30px;background:var(--surf);font-weight:600;color:var(--soft);}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;}
.empty{text-align:center;padding:64px 20px;color:var(--soft);}.empty svg{color:var(--accent);margin-bottom:12px;}

.card-prod{background:var(--surf);border:1px solid var(--line);border-radius:20px;overflow:hidden;cursor:pointer;box-shadow:var(--sh-sm);transition:transform .22s cubic-bezier(.2,.7,.3,1),box-shadow .22s;}
.card-prod:hover{transform:translateY(-4px);box-shadow:var(--sh-lg);}
.prod-media{position:relative;aspect-ratio:4/3.4;overflow:hidden;}
.prod-media .thumb-ph,.prod-media img,.prod-media video{width:100%;height:100%;}
.clip{position:absolute;left:11px;bottom:10px;display:inline-flex;align-items:center;gap:6px;background:rgba(20,36,29,.55);color:#fff;font-size:11px;font-weight:600;padding:5px 10px 5px 7px;border-radius:30px;backdrop-filter:blur(3px);}
.clip-play{width:16px;height:16px;border-radius:50%;background:#fff;color:var(--ink);display:grid;place-items:center;}
.card-prod:hover .clip{background:var(--accent);}
.prod-body{padding:16px 17px 17px;}
.prod-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;}
.prod-body h3{font-family:var(--disp);font-weight:600;font-size:21px;margin:0 0 9px;display:flex;align-items:center;gap:6px;}
.prod-meta{display:flex;gap:16px;margin-bottom:14px;}
.prod-meta span{display:inline-flex;align-items:center;gap:6px;font-size:13.5px;font-weight:600;color:var(--soft);}.prod-meta svg{color:var(--accent);}
.prod-foot{display:flex;align-items:flex-end;justify-content:space-between;border-top:1px solid var(--line);padding-top:13px;}
.detail-link{display:inline-flex;align-items:center;gap:2px;font-size:13.5px;font-weight:700;color:var(--acc-d);}

/* Kalkulator */
.calc-band{display:grid;grid-template-columns:.85fr 1.15fr;gap:30px;align-items:center;background:radial-gradient(120% 100% at 0% 0%,#e8f4ec,var(--surf));border:1px solid var(--line);border-radius:22px;padding:30px;}
.calc-intro p{margin:12px 0 16px;max-width:380px;}
.calc-points{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:9px;}
.calc-points li{display:flex;align-items:center;gap:9px;font-size:14px;font-weight:600;}.calc-points svg{color:var(--accent);}
.calc-card{background:var(--surf);border:1px solid var(--line);border-radius:18px;box-shadow:var(--sh-md);overflow:hidden;}
.calc{display:grid;grid-template-columns:1fr 1fr;}
.calc-controls{padding:20px;border-right:1px solid var(--line);}
.calc-fixed{font-weight:800;font-size:18px;padding:8px 0;}.calc-fixed small{font-size:12px;font-weight:600;color:var(--soft);}
.calc-input{display:flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:9px;padding:0 12px;background:var(--bg);}
.calc-input span{color:var(--soft);font-size:14px;}.calc-input input{border:0;background:none;padding:9px 0;}.calc-input input:focus{box-shadow:none;}.calc-input b{color:var(--soft);font-size:13px;}.calc-input.mt{margin-top:8px;}
.slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:6px;background:var(--gray-soft);padding:0;}
.slider::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:var(--accent);cursor:pointer;box-shadow:var(--sh-sm);}
.slider::-moz-range-thumb{width:20px;height:20px;border:0;border-radius:50%;background:var(--accent);cursor:pointer;}
.stepper{display:inline-flex;align-items:center;gap:0;border:1px solid var(--line);border-radius:9px;overflow:hidden;background:var(--bg);}
.stepper button{width:38px;height:38px;border:0;background:var(--surf);cursor:pointer;display:grid;place-items:center;color:var(--ink);}.stepper button:hover{background:var(--gray-soft);}
.stepper span{min-width:42px;text-align:center;font-weight:700;}
.calc-result{padding:20px;display:flex;flex-direction:column;background:linear-gradient(180deg,var(--acc-soft),var(--surf));}
.calc-total{font-family:var(--disp);font-weight:600;font-size:34px;line-height:1;margin:4px 0 6px;}
.calc-break span{font-size:13px;color:var(--soft);font-weight:600;}
.calc-dp{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:var(--ink);margin:12px 0 6px;background:var(--surf);border:1px solid var(--line);padding:7px 11px;border-radius:9px;align-self:flex-start;}
.calc-dp svg{color:var(--accent);}
.calc-note{display:flex;gap:6px;align-items:flex-start;font-size:12px;color:var(--soft);margin:6px 0 14px;line-height:1.45;}.calc-note svg{color:var(--amber);flex:none;margin-top:1px;}
.calc-result .btn{margin-top:auto;}

/* Steps */
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:24px;}
.step{position:relative;background:var(--surf);border:1px solid var(--line);border-radius:16px;padding:20px 18px;box-shadow:var(--sh-sm);}
.step-no{position:absolute;top:16px;right:18px;font-family:var(--disp);font-size:26px;font-weight:600;color:var(--gray-soft);}
.step-ic{width:42px;height:42px;border-radius:11px;background:var(--acc-soft);color:var(--acc-d);display:grid;place-items:center;margin-bottom:13px;}
.step b{font-size:15px;display:block;margin-bottom:5px;}.step p{font-size:13px;color:var(--soft);margin:0;}

/* About */
.about{display:grid;grid-template-columns:.8fr 1.2fr;gap:34px;align-items:center;}
.about-art{aspect-ratio:1;border-radius:18px;overflow:hidden;box-shadow:var(--sh-md);border:1px solid var(--line);}
.about-art .thumb-ph{width:100%;height:100%;}
.about-copy p{color:var(--soft);font-size:15.5px;margin:14px 0 22px;}
.about-stats{display:flex;gap:30px;}
.about-stats strong{font-family:var(--disp);font-size:30px;font-weight:600;display:block;line-height:1;}
.about-stats span{font-size:12.5px;color:var(--soft);font-weight:600;}

/* FAQ */
.faq{max-width:760px;margin:24px auto 0;display:flex;flex-direction:column;gap:10px;}
.faq-item{background:var(--surf);border:1px solid var(--line);border-radius:13px;overflow:hidden;}
.faq-item>button{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;background:none;border:0;cursor:pointer;font-family:var(--body);font-size:15px;font-weight:600;color:var(--ink);padding:16px 18px;text-align:left;}
.faq-item>button svg{color:var(--soft);transition:.2s;flex:none;}.faq-item.open>button svg{transform:rotate(180deg);color:var(--accent);}
.faq-item p{margin:0;padding:0 18px 16px;font-size:14px;color:var(--soft);}

/* Footer */
.shop-foot{border-top:1px solid var(--line);background:var(--surf);margin-top:20px;padding:38px 0 24px;}
.foot-in{display:flex;justify-content:space-between;gap:28px;flex-wrap:wrap;}
.foot-tag{font-size:14px;color:var(--soft);margin:12px 0 16px;max-width:340px;}
.foot-meta{display:flex;flex-direction:column;gap:10px;align-items:flex-start;}
.foot-meta span,.foot-meta a{display:inline-flex;align-items:center;gap:8px;font-size:13.5px;font-weight:600;color:var(--soft);text-decoration:none;}.foot-meta a:hover{color:var(--acc-d);}
.foot-fine{font-size:12.5px;color:var(--soft);margin-top:22px;padding-top:18px;border-top:1px solid var(--line);}

/* Detail overlay */
.overlay,.drawer-overlay{position:fixed;inset:0;z-index:60;display:flex;}
.overlay{align-items:flex-end;justify-content:center;}
.scrim{position:absolute;inset:0;background:rgba(20,36,29,.42);backdrop-filter:blur(2px);animation:fade .2s;}
.sheet{position:relative;background:var(--bg);width:100%;max-width:980px;max-height:94vh;overflow-y:auto;border-radius:24px 24px 0 0;box-shadow:var(--sh-lg);animation:up .3s cubic-bezier(.2,.7,.3,1);}
@media(min-width:760px){.overlay{align-items:center;}.sheet{border-radius:24px;max-height:90vh;}}
.close{position:absolute;top:14px;right:14px;z-index:5;background:var(--surf);border:1px solid var(--line);border-radius:50%;width:38px;height:38px;box-shadow:var(--sh-sm);}
.detail-grid{display:grid;grid-template-columns:1fr;}
@media(min-width:760px){.detail-grid{grid-template-columns:1fr 1fr;}}
.gallery{padding:22px 22px 0;}
.gallery-main{position:relative;border-radius:18px;overflow:hidden;box-shadow:var(--sh-md);border:1px solid var(--line);aspect-ratio:4/3.6;}
.gallery-main .thumb-ph,.gallery-main img,.gallery-main video{width:100%;height:100%;}
.nav{position:absolute;top:50%;transform:translateY(-50%);width:36px;height:36px;border-radius:50%;border:0;background:rgba(255,255,255,.9);cursor:pointer;display:grid;place-items:center;color:var(--ink);box-shadow:var(--sh-sm);}.nav-l{left:10px;}.nav-r{right:10px;}
.thumbs{display:flex;gap:9px;margin-top:12px;}
.thumb{position:relative;flex:1;aspect-ratio:1;border-radius:12px;overflow:hidden;border:2px solid var(--line);background:var(--gray-soft);cursor:pointer;padding:0;}
.thumb .thumb-ph{width:100%;height:100%;}.thumb.on{border-color:var(--accent);}
.thumb-play{position:absolute;inset:0;display:grid;place-items:center;background:rgba(20,36,29,.28);color:#fff;}
.detail-info{padding:22px;}
.detail-info h2{font-family:var(--disp);font-weight:600;font-size:32px;letter-spacing:-.02em;margin:6px 0 0;}
.detail-desc{font-size:15px;color:var(--soft);margin:14px 0 20px;}
.spec{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line);border:1px solid var(--line);border-radius:14px;overflow:hidden;margin-bottom:18px;}
.spec-cell{background:var(--surf);padding:12px 15px;}.spec-cell span{display:block;font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--soft);margin-bottom:3px;}.spec-cell strong{font-size:16px;}
.sp-st{font-size:13px !important;padding:3px 10px;border-radius:30px;}
.care{display:grid;gap:12px;margin-bottom:18px;}.care-row{display:flex;gap:11px;align-items:flex-start;}.care-row svg{color:var(--accent);margin-top:2px;flex:none;}.care-row span{font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--soft);}.care-row p{margin:1px 0 0;font-size:14.5px;font-weight:600;}
.timeline{border-top:1px solid var(--line);padding-top:16px;}
.tl-head{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--soft);margin-bottom:11px;}
.tl-item{position:relative;padding-left:18px;font-size:14px;margin-bottom:9px;}.tl-item b{color:var(--acc-d);margin-right:4px;}
.tl-dot{position:absolute;left:2px;top:7px;width:7px;height:7px;border-radius:50%;background:var(--accent);}
.detail-calc{border-top:1px solid var(--line);margin-top:18px;padding-top:16px;}
.detail-calc .calc{border:1px solid var(--line);border-radius:14px;overflow:hidden;margin-top:6px;}
.detail-calc .calc-controls{padding:16px;}.detail-calc .calc-result{padding:16px;}
.sticky-bar{position:sticky;bottom:0;display:flex;align-items:center;justify-content:space-between;gap:14px;background:rgba(255,255,255,.94);backdrop-filter:blur(10px);border-top:1px solid var(--line);padding:14px 22px;margin-top:8px;}
.sticky-price span{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--soft);display:block;}
.sticky-price strong{font-size:21px;font-family:var(--disp);font-weight:600;}
.wa{flex:1;max-width:340px;justify-content:center;background:var(--accent);color:#fff;font-size:15.5px;padding:14px 20px;border-radius:13px;box-shadow:var(--sh-md);}.wa:hover{background:var(--acc-d);}
.wa.is-disabled{background:var(--gray-soft);color:var(--gray);box-shadow:none;cursor:not-allowed;}

/* ===== CMS ===== */
.login{min-height:100vh;display:grid;place-items:center;background:radial-gradient(120% 90% at 50% -10%,#e8f4ec,var(--bg) 60%);padding:24px;}
.login-card{width:100%;max-width:400px;background:var(--surf);border:1px solid var(--line);border-radius:20px;padding:34px;box-shadow:var(--sh-lg);}
.login-title{font-family:var(--disp);font-weight:600;font-size:25px;margin:20px 0 4px;}.login-sub{color:var(--soft);font-size:14px;margin:0 0 22px;}
.login-note{display:flex;gap:7px;align-items:flex-start;font-size:12px;color:var(--soft);margin-top:16px;line-height:1.5;}.login-note svg{color:var(--amber);flex:none;margin-top:1px;}

.cms-app{display:grid;grid-template-columns:248px 1fr;min-height:100vh;background:var(--bg);}
.sidebar{background:var(--surf);border-right:1px solid var(--line);display:flex;flex-direction:column;padding:18px 14px;position:sticky;top:0;height:100vh;}
.side-nav{margin-top:18px;flex:1;overflow-y:auto;}.nav-group{margin-bottom:16px;}
.nav-group-t{display:block;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--soft);padding:0 10px 7px;}
.nav-item{display:flex;align-items:center;gap:11px;width:100%;background:none;border:0;cursor:pointer;font-family:var(--body);font-size:14px;font-weight:600;color:var(--soft);padding:10px 11px;border-radius:9px;transition:.14s;text-align:left;}
.nav-item:hover{background:var(--gray-soft);color:var(--ink);}.nav-item.is-active{background:var(--acc-soft);color:var(--acc-d);}
.side-foot{border-top:1px solid var(--line);padding-top:12px;}.side-acc{display:flex;align-items:center;gap:10px;padding:6px 10px 12px;}
.side-acc b{display:block;font-size:13.5px;}.side-acc span{font-size:11.5px;color:var(--soft);}
.avatar{width:32px;height:32px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;font-weight:700;font-size:14px;flex:none;}
.side-scrim{display:none;}
.main{min-width:0;display:flex;flex-direction:column;}
.topbar{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:12px;height:62px;padding:0 22px;background:rgba(246,248,244,.85);backdrop-filter:blur(10px);border-bottom:1px solid var(--line);}
.top-title{font-family:var(--disp);font-weight:600;font-size:21px;margin:0;}.tb-spacer{flex:1;}
.content{padding:24px 22px 60px;max-width:1180px;width:100%;}.page{display:flex;flex-direction:column;gap:18px;}
.only-mobile{display:none;}

.card{background:var(--surf);border:1px solid var(--line);border-radius:16px;padding:18px;box-shadow:var(--sh-sm);}.card.narrow{max-width:560px;}
.card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}.card-head h3{font-family:var(--disp);font-weight:600;font-size:18px;margin:0;}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:18px;}.grid-2.top{align-items:start;}
.kpis{display:grid;grid-template-columns:repeat(4,1fr) 1.4fr;gap:14px;}
.kpi{display:flex;align-items:center;gap:13px;background:var(--surf);border:1px solid var(--line);border-radius:15px;padding:16px 17px;box-shadow:var(--sh-sm);}
.kpi-ic{width:40px;height:40px;border-radius:11px;display:grid;place-items:center;background:var(--gray-soft);color:var(--soft);flex:none;}
.kpi strong{display:block;font-size:24px;font-family:var(--disp);font-weight:600;line-height:1;}.kpi span{font-size:12px;font-weight:600;color:var(--soft);}
.k-green .kpi-ic,.k-wide .kpi-ic{background:var(--acc-soft);color:var(--acc-d);}.k-amber .kpi-ic{background:var(--amber-soft);color:var(--amber);}.k-gray .kpi-ic{background:var(--gray-soft);color:var(--gray);}.k-wide strong{font-size:19px;}
.chart-wrap{position:relative;}.donut-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;}
.donut-center strong{display:block;font-family:var(--disp);font-size:28px;font-weight:600;line-height:1;}.donut-center span{font-size:12px;color:var(--soft);}
.legend{display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin-top:8px;}.legend span{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:var(--soft);}.legend i{width:10px;height:10px;border-radius:3px;}
.feed{display:flex;flex-direction:column;}.feed-row{display:flex;gap:11px;padding:9px 0;border-bottom:1px dashed var(--line);}.feed-row:last-child{border-bottom:0;}
.feed-dot{width:8px;height:8px;border-radius:50%;margin-top:6px;flex:none;background:var(--accent);}.feed-dot.delete{background:var(--red);}.feed-dot.status{background:var(--amber);}.feed-dot.settings,.feed-dot.content{background:var(--gray);}
.feed-row p{margin:0;font-size:13.5px;font-weight:600;}.feed-row span{font-size:11.5px;color:var(--soft);}
.card-cta h3{font-family:var(--disp);font-weight:600;font-size:18px;margin:0 0 14px;}
.qa{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.qa-btn{display:flex;align-items:center;gap:8px;background:var(--bg);border:1px solid var(--line);border-radius:11px;padding:13px;font-family:var(--body);font-size:13.5px;font-weight:600;cursor:pointer;color:var(--ink);transition:.14s;}
.qa-btn:hover{border-color:var(--accent);color:var(--acc-d);background:var(--acc-soft);}
.hint-box{display:flex;gap:9px;align-items:flex-start;background:var(--acc-soft);color:var(--acc-d);border-radius:11px;padding:11px 13px;font-size:13px;font-weight:600;margin-top:14px;line-height:1.45;}.hint-box svg{flex:none;margin-top:1px;}

.toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}.toolbar select{width:auto;min-width:140px;background:var(--surf);}.toolbar .search-in{flex:1;}
.bulkbar{display:flex;align-items:center;gap:12px;background:var(--ink);color:#fff;border-radius:12px;padding:10px 16px;font-size:13.5px;font-weight:600;flex-wrap:wrap;}
.bulkbar select{width:auto;background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.2);color:#fff;}.bulkbar .link{color:#fff;opacity:.8;}
.table-card{background:var(--surf);border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:var(--sh-sm);overflow-x:auto;}
.table{width:100%;border-collapse:collapse;font-size:14px;min-width:780px;}
.table th{text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--soft);padding:13px 16px;border-bottom:1px solid var(--line);background:var(--bg);}
.table td{padding:11px 16px;border-bottom:1px solid var(--line);vertical-align:middle;}.table tr:last-child td{border-bottom:0;}.table tr.is-sel{background:var(--acc-soft);}
.c-check{width:40px;}.c-act{width:110px;text-align:right;white-space:nowrap;}
.cell-sheep{display:flex;align-items:center;gap:11px;}.cell-sheep b{display:flex;align-items:center;gap:5px;font-size:14px;}.cell-sheep .mono{display:block;}
.empty-row{text-align:center;padding:46px 20px !important;color:var(--soft);}.empty-row svg{color:var(--accent);margin-bottom:8px;}.empty-row p{margin:0;}
.table-foot{font-size:12.5px;color:var(--soft);margin:0;}
.status-sel{width:auto;min-width:108px;border:0;border-radius:30px;padding:5px 10px;font-size:12.5px;font-weight:700;cursor:pointer;}.status-sel:focus{box-shadow:none;}
.status-sel.st-avail{background:var(--acc-soft);color:var(--acc-d);}.status-sel.st-booked{background:var(--amber-soft);color:var(--amber);}.status-sel.st-sold{background:var(--gray-soft);color:var(--gray);}

.drawer{position:relative;width:min(760px,96vw);height:100vh;margin-left:auto;background:var(--bg);box-shadow:var(--sh-lg);display:flex;flex-direction:column;animation:slide .28s cubic-bezier(.2,.7,.3,1);}
@keyframes slide{from{transform:translateX(40px);opacity:.6;}to{transform:translateX(0);opacity:1;}}@keyframes fade{from{opacity:0;}to{opacity:1;}}@keyframes up{from{transform:translateY(40px);opacity:.6;}to{transform:translateY(0);opacity:1;}}
.drawer-overlay{justify-content:flex-end;}.drawer-overlay.center{align-items:center;justify-content:center;}
.drawer-head{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid var(--line);background:var(--surf);}
.drawer-head h2{font-family:var(--disp);font-weight:600;font-size:22px;margin:3px 0 0;}
.drawer-body{flex:1;overflow-y:auto;padding:20px 22px;}
.drawer-foot{display:flex;justify-content:flex-end;gap:10px;padding:14px 22px;border-top:1px solid var(--line);background:var(--surf);}
.editor-grid{display:grid;grid-template-columns:1fr 268px;gap:22px;}
.form-sec{background:var(--surf);border:1px solid var(--line);border-radius:14px;padding:16px;margin-bottom:16px;}
.form-sec h4{font-size:14px;font-weight:700;margin:0 0 14px;}.sec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}.sec-head h4{margin:0;}
.auto-chip{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:var(--acc-d);background:var(--acc-soft);padding:4px 9px;border-radius:20px;}
.est-line{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:600;background:var(--acc-soft);color:var(--ink);border-radius:9px;padding:9px 12px;margin-bottom:14px;}.est-line svg{color:var(--acc-d);}
.media-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;}
.media-cell{position:relative;aspect-ratio:1;border-radius:11px;overflow:hidden;border:2px solid var(--line);background:var(--gray-soft);}.media-cell.is-cover{border-color:var(--accent);}
.media-cell>div:first-child,.media-cell img,.media-cell video{width:100%;height:100%;}
.media-type{position:absolute;top:6px;left:6px;display:inline-flex;align-items:center;gap:3px;font-size:9.5px;font-weight:700;text-transform:uppercase;background:rgba(20,36,29,.6);color:#fff;padding:3px 6px;border-radius:6px;}
.media-cover{position:absolute;bottom:6px;left:6px;display:inline-flex;align-items:center;gap:3px;font-size:9.5px;font-weight:700;background:var(--accent);color:#fff;padding:3px 6px;border-radius:6px;}
.media-ops{position:absolute;inset:0;background:rgba(20,36,29,.5);display:flex;align-items:center;justify-content:center;gap:4px;opacity:0;transition:.15s;}.media-cell:hover .media-ops{opacity:1;}
.media-ops button{width:26px;height:26px;border-radius:7px;border:0;background:rgba(255,255,255,.92);cursor:pointer;display:grid;place-items:center;color:var(--ink);}
.media-add{aspect-ratio:1;border:2px dashed var(--line);border-radius:11px;background:var(--bg);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:var(--soft);font-size:11.5px;font-weight:600;font-family:var(--body);transition:.14s;}.media-add:hover{border-color:var(--accent);color:var(--acc-d);}
.log-edit{display:flex;gap:8px;margin-bottom:8px;}.log-t{max-width:140px;}.log-x{flex:1;}
.editor-aside{position:sticky;top:0;align-self:start;}
.prev-card{background:var(--surf);border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:var(--sh-sm);margin:8px 0 12px;}
.prev-media{position:relative;aspect-ratio:4/3.4;overflow:hidden;}.prev-media .thumb-ph,.prev-media img,.prev-media video{width:100%;height:100%;}
.prev-body{padding:13px 14px;}.prev-body h3{font-family:var(--disp);font-weight:600;font-size:18px;margin:4px 0 8px;}
.tints{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:6px;}.tint-dot{width:22px;height:22px;border-radius:7px;border:2px solid transparent;cursor:pointer;}.tint-dot.is-on{border-color:var(--ink);}
.confirm{position:relative;background:var(--surf);border-radius:18px;padding:26px;width:min(380px,92vw);text-align:center;box-shadow:var(--sh-lg);animation:fade .2s;}
.confirm-ic{width:48px;height:48px;border-radius:50%;background:var(--red-soft);color:var(--red);display:grid;place-items:center;margin:0 auto 12px;}
.confirm p{font-weight:600;margin:0 0 18px;}.confirm-act{display:flex;gap:10px;justify-content:center;}
.hero-prev{background:radial-gradient(120% 90% at 0% 0%,#e8f4ec,var(--bg));border:1px solid var(--line);border-radius:14px;padding:22px;}
.hero-prev h2{font-family:var(--disp);font-weight:600;font-size:24px;line-height:1.1;margin:8px 0;white-space:pre-line;}.hero-prev p{color:var(--soft);font-size:14px;margin:0 0 16px;}
.prev-cta{display:inline-flex;background:var(--accent);color:#fff;font-weight:700;font-size:13px;padding:9px 16px;border-radius:9px;}
.badge-list{display:flex;flex-direction:column;gap:10px;}.badge-edit{display:grid;grid-template-columns:130px 1fr 36px;gap:8px;}
.save-bar{display:flex;justify-content:flex-end;position:sticky;bottom:0;padding:12px 0;}.save-bar .btn{box-shadow:var(--sh-md);}
.add-row{display:flex;gap:10px;margin-bottom:16px;}
.breed-list{display:flex;flex-direction:column;gap:8px;}.breed-row{display:flex;align-items:center;gap:12px;padding:11px 13px;border:1px solid var(--line);border-radius:11px;background:var(--bg);}
.breed-ic{width:30px;height:30px;border-radius:8px;background:var(--acc-soft);color:var(--acc-d);display:grid;place-items:center;flex:none;}.breed-row b{flex:1;font-size:14px;}.breed-count{font-size:12px;color:var(--soft);font-weight:600;}
.wa-test{display:flex;gap:8px;}.wa-test input{flex:1;}.wa-test .btn{flex:none;}
.color-row{display:flex;gap:10px;align-items:center;}.color-row input[type=color]{width:48px;height:42px;padding:3px;cursor:pointer;flex:none;}
.sys-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:13px 0;border-bottom:1px dashed var(--line);}.sys-row b{font-size:14px;}.sys-row p{margin:2px 0 0;font-size:12.5px;}
.sys-chip{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;padding:5px 11px;border-radius:20px;}.sys-chip.ok{background:var(--acc-soft);color:var(--acc-d);}.sys-chip.warn{background:var(--amber-soft);color:var(--amber);}
.kind-chip{display:inline-flex;font-size:11.5px;font-weight:700;padding:3px 9px;border-radius:20px;background:var(--gray-soft);color:var(--soft);}
.kind-chip.create{background:var(--acc-soft);color:var(--acc-d);}.kind-chip.delete{background:var(--red-soft);color:var(--red);}.kind-chip.status{background:var(--amber-soft);color:var(--amber);}

.toasts{position:fixed;bottom:22px;right:22px;z-index:90;display:flex;flex-direction:column;gap:9px;}
.toast{display:flex;align-items:center;gap:9px;background:var(--ink);color:#fff;font-size:13.5px;font-weight:600;padding:11px 16px;border-radius:11px;box-shadow:var(--sh-lg);animation:tin .25s;}
.toast.ok svg{color:#5ee0a4;}.toast.err{background:var(--red);}@keyframes tin{from{transform:translateY(10px);opacity:0;}to{transform:translateY(0);opacity:1;}}
.rise{opacity:0;animation:rise .6s cubic-bezier(.2,.7,.3,1) forwards;}@keyframes rise{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}

@media(max-width:1080px){.kpis{grid-template-columns:repeat(2,1fr);}.k-wide{grid-column:span 2;}}
@media(max-width:980px){.calc-band{grid-template-columns:1fr;}.about{grid-template-columns:1fr;}.about-art{max-width:320px;}}
@media(max-width:920px){.grid{grid-template-columns:repeat(2,1fr);}.steps{grid-template-columns:repeat(2,1fr);}.editor-grid{grid-template-columns:1fr;}.editor-aside{position:static;}.hero{grid-template-columns:1fr;gap:30px;padding:40px 0 20px;}.hero-copy h1{font-size:38px;}.hero-video{aspect-ratio:16/10;}}
@media(max-width:860px){.cms-app{grid-template-columns:1fr;}.sidebar{position:fixed;left:0;top:0;z-index:70;width:260px;transform:translateX(-100%);transition:.25s;}.sidebar.open{transform:translateX(0);box-shadow:var(--sh-lg);}.side-scrim{display:block;position:fixed;inset:0;background:rgba(20,36,29,.4);z-index:65;}.only-mobile{display:grid;}.only-desk{display:none;}}
@media(max-width:680px){.grid,.grid-2,.grid-2.top{grid-template-columns:1fr;}.steps{grid-template-columns:1fr;}.row-2,.row-3,.qa{grid-template-columns:1fr;}.calc{grid-template-columns:1fr;}.calc-controls{border-right:0;border-bottom:1px solid var(--line);}.media-grid{grid-template-columns:repeat(3,1fr);}.burger{display:grid;}.shop-nav{position:absolute;top:64px;left:0;right:0;flex-direction:column;align-items:stretch;background:var(--surf);border-bottom:1px solid var(--line);padding:12px 18px;gap:4px;box-shadow:var(--sh-md);display:none;}.shop-nav.open{display:flex;}.shop-nav>button{justify-content:flex-start;padding:11px 13px;}.nav-wa{margin:6px 0 0;justify-content:center;}.content{padding:18px 16px 50px;}.kpis{grid-template-columns:1fr 1fr;}.k-wide{grid-column:span 2;}}
@media(prefers-reduced-motion:reduce){.rise,.cloud,.graze,.rec-dot,.thumb-ph svg{animation:none !important;opacity:1 !important;transform:none !important;}}
`;
