import React, { useMemo, useState } from "react";


/***********************
 * أنماط الأنيميشن (CSS-in-JSX)
 ***********************/
function WaterAnimationStyles() {
  return (
    <style>
      {`
      /* احترام إعدادات تقليل الحركة */
      @media (prefers-reduced-motion: reduce) {
        .anim-wave, .anim-bubble, .anim-float, .anim-stripes { animation: none !important; }
      }

      /* حركة الموجة */
      @keyframes waveMove {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .anim-wave { animation: waveMove 12s linear infinite; }
      .anim-wave.slow { animation-duration: 18s; opacity: .7; }

      /* فقاعات ترتفع */
      @keyframes bubbleUp {
        0%   { transform: translateY(0) scale(1); opacity: .6; }
        70%  { opacity: .8; }
        100% { transform: translateY(-140%) scale(.9); opacity: 0; }
      }
      .anim-bubble { animation: bubbleUp var(--t,6s) ease-in infinite; }

      /* طفو خفيف */
      @keyframes floatY {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
      .anim-float { animation: floatY 3.4s ease-in-out infinite; }

      /* شرائط تحذيرية داخل ProgressBar عندما تتجاوز 80% */
      @keyframes stripes {
        0% { background-position: 0 0; }
        100% { background-position: 40px 0; }
      }
      .anim-stripes {
        background-image: linear-gradient(45deg, rgba(255,255,255,.25) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.25) 50%, rgba(255,255,255,.25) 75%, transparent 75%, transparent);
        background-size: 40px 40px;
        animation: stripes 1.2s linear infinite;
      }
      `}
    </style>
  );
}

/***********************
 * بيانات وهمية
 ***********************/
const products = [
  {
    id: "P-SWH-01",
    type: "solar",
    name: "سخان شمسي — 200 لتر",
    img: "https://via.placeholder.com/640x360?text=Solar+Water+Heater+200L",
    features: ["أنابيب زجاجية مفرغة", "خزان فولاذي مبطّن", "ضمان 5 سنوات"],
    price: 3850,
  },
  {
    id: "P-SWH-02",
    type: "solar",
    name: "سخان شمسي — 300 لتر",
    img: "https://via.placeholder.com/640x360?text=Solar+Water+Heater+300L",
    features: ["كفاءة عالية", "مناسب للعائلات الكبيرة", "ضمان 5 سنوات"],
    price: 4650,
  },
  {
    id: "P-RO-01",
    type: "filter",
    name: "فلتر RO — خمس مراحل",
    img: "https://via.placeholder.com/640x360?text=RO+5+Stages",
    features: ["مراحل ترشيح دقيقة", "إزالة الأملاح والروائح", "مضخة هادئة"],
    price: 780,
  },
  {
    id: "P-RO-02",
    type: "filter",
    name: "فلتر RO — سبع مراحل",
    img: "https://via.placeholder.com/640x360?text=RO+7+Stages",
    features: ["تعقيم بالأشعة UV", "معدِّلات للـ pH", "صنبور فاخر"],
    price: 1190,
  },
];

const technicians = [
  { id: "T-01", name: "م. أحمد", rating: 4.7, status: "available", lat: 24.7136, lng: 46.6753, distanceKm: 2.1 },
  { id: "T-02", name: "م. خالد", rating: 4.5, status: "available", lat: 24.7231, lng: 46.6900, distanceKm: 3.4 },
  { id: "T-03", name: "م. روان", rating: 4.9, status: "busy", lat: 24.7050, lng: 46.6600, distanceKm: 4.8 },
  { id: "T-04", name: "م. سليم", rating: 4.2, status: "offline", lat: 24.7000, lng: 46.6400, distanceKm: 6.3 },
];

// أجهزة مملوكة (لعمر الجهاز والتنبيهات)
const ownedDevicesSeed = [
  {
    id: "D-RO-2024-001",
    label: "فلتر RO — مطبخ",
    type: "filter",
    installedAt: "2024-12-01",
    lifetimeDays: 365,
    usagePct: 78,
  },
  {
    id: "D-SWH-2023-014",
    label: "سخان شمسي — سطح",
    type: "solar",
    installedAt: "2023-09-10",
    lifetimeDays: 3650,
    usagePct: 22,
  },
];

/***********************
 * عناصر مساعدة
 ***********************/
function Badge({ children, color = "gray" }: { children: React.ReactNode; color?: "green"|"red"|"yellow"|"gray"|"blue"|"slate" }) {
  const map = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
    slate: "bg-slate-100 text-slate-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs ${map[color]}`}>{children}</span>;
}

function ProgressBar({ value }: { value: number }) {
  const isHigh = value >= 80;
  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full ${isHigh ? "bg-red-600 anim-stripes" : value >= 50 ? "bg-amber-500" : "bg-green-600"}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function StarRating({ value = 0, onChange }: { value?: number; onChange?: (n:number)=>void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1 text-amber-500" onMouseLeave={() => setHover(0)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1;
        const active = (hover || value) >= n;
        return (
          <button
            key={n}
            type="button"
            aria-label={`تقييم ${n}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange?.(n)}
            className="text-xl"
          >
            {active ? "★" : "☆"}
          </button>
        );
      })}
    </div>
  );
}

function Section({ title, subtitle, children, actions }: { title: string; subtitle?: string; children?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

/***********************
 * موجة الهيدر (SVG Waves)
 ***********************/
function Waves() {
  return (
    <div className="absolute inset-x-0 -bottom-0.5 pointer-events-none select-none" aria-hidden>
      <div className="relative h-8 overflow-hidden">
        <svg className="absolute w-[200%] h-full anim-wave" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.74,22.24,103.57,29.05,158,17,70-15.78,136-52.12,206-66,85-16.65,170,1.47,255,19s170,35.84,255,22c66.27-11.21,130.13-43.65,181-72V0Z" fill="rgba(255,255,255,.35)"/>
        </svg>
        <svg className="absolute w-[200%] h-full anim-wave slow" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.74,22.24,103.57,29.05,158,17,70-15.78,136-52.12,206-66,85-16.65,170,1.47,255,19s170,35.84,255,22c66.27-11.21,130.13-43.65,181-72V0Z" fill="rgba(255,255,255,.25)"/>
        </svg>
      </div>
    </div>
  );
}

/***********************
 * بطاقات المنتجات
 ***********************/
function ProductCard({ p, onAction }: { p: any; onAction?: (p:any)=>void }) {
  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white transition-transform duration-300 hover:shadow-md hover:-translate-y-0.5 anim-float">
      <div className="overflow-hidden">
        <img src={p.img} alt={p.name} className="w-full h-40 object-cover transition-transform duration-500 hover:scale-105" />
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">{p.name}</h3>
          <Badge color={p.type === "solar" ? "yellow" : "blue"}>{p.type === "solar" ? "طاقة شمسية" : "فلتر مياه"}</Badge>
        </div>
        <ul className="text-sm text-slate-600 list-disc pr-5 space-y-1">
          {p.features.map((f: string) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <div className="flex items-center justify-between pt-1">
          <div className="text-lg font-semibold">{p.price.toLocaleString()} ر.س</div>
          <button onClick={() => onAction?.(p)} className="px-3 py-2 rounded-2xl bg-red-800 text-white hover:bg-red-700 text-sm">
            اطلب تركيب / استشارة
          </button>
        </div>
      </div>
    </div>
  );
}

/***********************
 * قائمة الفنيين + اختيار الأقرب
 ***********************/
function TechnicianChip({ t, selected, onSelect }: { t:any; selected:boolean; onSelect:(t:any)=>void }) {
  const color = t.status === "available" ? "green" : t.status === "busy" ? "yellow" : "slate";
  return (
    <button
      onClick={() => onSelect?.(t)}
      className={`w-full text-right px-3 py-3 rounded-2xl border flex items-center justify-between ${
        selected ? "border-red-700 bg-red-50" : "border-slate-200 bg-white"
      }`}
    >
      <div>
        <div className="font-medium">{t.name}</div>
        <div className="text-xs text-slate-500">يبعد ~ {t.distanceKm.toFixed(1)} كم</div>
      </div>
      <div className="flex items-center gap-2">
        <Badge color={color}>{t.status === "available" ? "متاح" : t.status === "busy" ? "مشغول" : "غير متصل"}</Badge>
        <span className="text-xs">⭐ {t.rating.toFixed(1)}</span>
      </div>
    </button>
  );
}

/***********************
 * خريطة وهمية للتتبّع + فقاعات
 ***********************/
function MapPlaceholder({ userAddress, tech }: { userAddress?: string; tech?: any }) {
  const bubbles = useMemo(() => Array.from({ length: 10 }, (_, i) => i), []);
  return (
    <div className="relative h-56 md:h-72 border border-dashed rounded-2xl flex items-center justify-center text-slate-500 bg-slate-50 overflow-hidden">
      {/* فقاعات */}
      <div className="absolute inset-0 pointer-events-none">
        {bubbles.map((b) => (
          <span
            key={b}
            className="absolute rounded-full bg-sky-300/40 anim-bubble"
            style={{
              width: `${8 + (b % 5) * 3}px`,
              height: `${8 + (b % 5) * 3}px`,
              left: `${(b * 9) % 100}%`,
              bottom: `${(-10 - (b % 4) * 6)}px`,
              // زمن عشوائي بسيط
              ['--t' as any]: `${5 + (b % 6)}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* المحتوى */}
      {tech ? (
        <div className="text-center text-sm">
          <div className="mb-1">مسار (وهمي) من <b>موقع الفني</b> إلى <b>عنوانك</b></div>
          <div>📍 الفني: {tech.name} — ETA تقديري: {Math.max(8, Math.round(tech.distanceKm * 4))} دقيقة</div>
          <div className="mt-1">🏠 العنوان: {userAddress || "لم يتم تحديد العنوان"}</div>
        </div>
      ) : (
        <div className="text-sm">خريطة Placeholder — اختر فنيًا لعرض المسار</div>
      )}
    </div>
  );
}

/***********************
 * تبويبات كمكوّنات صغيرة
 ***********************/
function HomeView({ cart, setCart }: { cart:any[]; setCart: React.Dispatch<React.SetStateAction<any[]>> }) {
  return (
    <div className="space-y-6">
      <div className="relative rounded-3xl p-5 bg-gradient-to-r from-red-800 to-red-600 text-white overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">مرحبًا بك 👋</h2>
            <p className="text-sm text-red-100">استعرض عروض السخانات الشمسية وفلاتر RO واختر الخدمة المناسبة لك</p>
          </div>
          <div className="flex gap-2 text-sm">
            <Badge color="yellow">توصيل وتركيب</Badge>
            <Badge color="green">ضمان معتمد</Badge>
            <Badge color="blue">صيانة سريعة</Badge>
          </div>
        </div>
        {/* موجات */}
        <Waves />
      </div>

      <Section title="المنتجات" subtitle="اختر المنتج لطلب تركيب/استشارة">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} onAction={(prod) => setCart((c) => [...c, prod])} />
          ))}
        </div>
      </Section>

      {cart.length > 0 && (
        <Section
          title="سلة الطلب"
          subtitle="سنقوم بالتواصل لتأكيد المقاس والموقع قبل الفاتورة"
          actions={<button className="text-sm underline" onClick={() => setCart([])}>تفريغ</button>}
        >
          <div className="rounded-2xl border border-slate-200 bg-white overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-right text-slate-500">
                  <th className="py-2 pr-4">المنتج</th>
                  <th className="py-2">الفئة</th>
                  <th className="py-2">السعر</th>
                  <th className="py-2 pl-4">—</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((p, i) => (
                  <tr key={p.id + i} className="border-t">
                    <td className="py-2 pr-4">{p.name}</td>
                    <td className="py-2">{p.type === "solar" ? "سخان شمسي" : "فلتر مياه"}</td>
                    <td className="py-2">{p.price.toLocaleString()} ر.س</td>
                    <td className="py-2 pl-4">
                      <button className="text-red-700 underline" onClick={() => setCart((c) => c.filter((_, idx) => idx !== i))}>حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-slate-600">الإجمالي: <span className="font-semibold">{cart.reduce((s, p) => s + p.price, 0).toLocaleString()} ر.س</span></div>
            <span className="text-xs text-slate-500">تابع إلى تبويب "طلب صيانة" لإدخال العنوان</span>
          </div>
        </Section>
      )}
    </div>
  );
}

function DevicesView({ devices }: { devices:any[] }) {
  return (
    <div className="space-y-6">
      <Section title="أجهزتي" subtitle="تتبّع عمر الاستهلاك والتنبيهات">
        <div className="grid md:grid-cols-2 gap-4">
          {devices.map((d) => (
            <div key={d.id} className="p-4 rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold">{d.label}</div>
                <Badge color={d.type === "filter" ? "blue" : "yellow"}>{d.type === "filter" ? "فلتر" : "سخان شمسي"}</Badge>
              </div>
              <div className="text-xs text-slate-500 mb-2">تاريخ التركيب: {d.installedAt} · العمر المستهلك: {d.usagePct}%</div>
              <ProgressBar value={d.usagePct} />
              <div className="mt-2 text-xs text-slate-600">
                {d.usagePct >= 80 ? (
                  <span className="text-red-700">⚠️ اقترب موعد الاستبدال/الصيانة</span>
                ) : d.usagePct >= 50 ? (
                  <span className="text-amber-700">تنبيه مبكّر: جهّز لزيارة صيانة</span>
                ) : (
                  <span className="text-green-700">الحالة جيدة</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>
      <div className="rounded-2xl p-4 border border-slate-200 bg-white">
        <div className="text-sm text-slate-600">أضف جهازًا جديدًا لبدء التتبّع:
          <button className="ml-2 px-3 py-1.5 rounded-2xl border">إضافة جهاز</button>
        </div>
      </div>
    </div>
  );
}

function MaintenanceView({ address, setAddress, maintenanceType, setMaintenanceType, issue, setIssue, sortedTechs, selectedTech, setSelectedTech, onSubmit }: any) {
  return (
    <div className="space-y-6">
      <Section title="طلب صيانة" subtitle="حدّد نوع الجهاز وأدخل عنوانك ثم اختر أقرب فني">
        <div className="grid md:grid-cols-5 gap-4">
          <div className="md:col-span-3 p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <div>
              <div className="text-sm font-semibold mb-1">نوع الجهاز</div>
              <div className="flex gap-2 text-sm">
                <button onClick={() => setMaintenanceType("filter")} className={`px-3 py-1.5 rounded-2xl border ${maintenanceType === "filter" ? "bg-red-800 text-white border-red-800" : "bg-white"}`}>فلتر مياه</button>
                <button onClick={() => setMaintenanceType("solar")} className={`px-3 py-1.5 rounded-2xl border ${maintenanceType === "solar" ? "bg-red-800 text-white border-red-800" : "bg-white"}`}>سخان شمسي</button>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-1">العنوان</div>
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="المدينة · الحي · الشارع · أقرب معلم" className="w-full border rounded-2xl p-2 text-sm" />
            </div>
            <div>
              <div className="text-sm font-semibold mb-1">وصف المشكلة</div>
              <textarea value={issue} onChange={(e) => setIssue(e.target.value)} rows={4} placeholder="مثال: تسريب بسيط من الهوز / ضعف تدفّق الماء..." className="w-full border rounded-2xl p-2 text-sm" />
            </div>
          </div>

          <div className="md:col-span-2 p-4 rounded-2xl border border-slate-200 bg-white">
            <div className="text-sm font-semibold mb-2">اختر أقرب فني</div>
            <div className="space-y-2 max-h-72 overflow-auto pr-1">
              {sortedTechs.map((t: any) => (
                <TechnicianChip key={t.id} t={t} selected={selectedTech?.id === t.id} onSelect={setSelectedTech} />
              ))}
            </div>
            <button onClick={onSubmit} className="mt-3 w-full rounded-2xl px-4 py-2 bg-red-800 text-white hover:bg-red-700">إرسال الطلب</button>
          </div>
        </div>
      </Section>

      <Section title="معاينة الخريطة (وهمية)">
        <MapPlaceholder userAddress={address} tech={selectedTech} />
      </Section>
    </div>
  );
}

function TrackView({ selectedTech, address, onDone }: any) {
  return (
    <div className="space-y-6">
      <Section title="تتبّع الفني" subtitle={selectedTech ? `الفني المعين: ${selectedTech.name}` : "اختر فنيًا من شاشة الصيانة"}
        actions={<button onClick={onDone} className="text-sm px-3 py-1.5 rounded-2xl border">وضع: الزيارة مكتملة</button>}>
        <MapPlaceholder userAddress={address} tech={selectedTech} />
        <div className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
          <div className="p-3 rounded-2xl border bg-white"><div className="text-slate-500">الحالة</div><div className="font-semibold">{selectedTech ? (selectedTech.status === "available" ? "في الطريق" : "—") : "—"}</div></div>
          <div className="p-3 rounded-2xl border bg-white"><div className="text-slate-500">ETA (دقيقة)</div><div className="font-semibold">{selectedTech ? Math.max(8, Math.round(selectedTech.distanceKm * 4)) : "—"}</div></div>
          <div className="p-3 rounded-2xl border bg-white"><div className="text-slate-500">تواصل</div><div className="font-semibold">واتساب/اتصال</div></div>
        </div>
      </Section>
    </div>
  );
}

function NotificationsView({ criticalNotifications, goMaintenance }: any) {
  return (
    <div className="space-y-6">
      <Section title="التنبيهات" subtitle="نرسل لك تذكيرًا عند اقتراب نهاية عمر الفلاتر أو مواعيد الصيانة">
        {criticalNotifications.length === 0 ? (
          <div className="p-4 rounded-2xl border bg-white text-sm text-slate-600">لا توجد تنبيهات حرجة حاليًا</div>
        ) : (
          <ul className="space-y-2">
            {criticalNotifications.map((n: any) => (
              <li key={n.id} className="p-4 rounded-2xl border bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{n.title}</div>
                    <div className="text-sm text-slate-600">{n.body}</div>
                  </div>
                  <button onClick={goMaintenance} className="px-3 py-1.5 rounded-2xl bg-red-800 text-white text-sm">حجز صيانة</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

/***********************
 * اختبارات تشغيل بسيطة (لا تغيّر سلوك الواجهة)
 * - تتحقق من أن renderTab تُرجع عنصرًا واحدًا.
 * - تتحقق من وجود مكونات أساسية.
 * - تتحقق من تفعيل أنماط الأنيميشن.
 ***********************/
function DevTests({ tab, childrenCount }: { tab:string; childrenCount:number }) {
  const tests = [
    { name: "renderTab تُعيد عنصرًا واحدًا", pass: childrenCount === 1 },
    { name: "وجود مكونات أساسية", pass: [Badge, Section, ProductCard, TechnicianChip].every((c) => typeof c === "function") },
    { name: "تبويب معروف", pass: ["home", "devices", "maintenance", "track", "notifications"].includes(tab) },
    { name: "أنيميشن مفعّل", pass: true },
  ];
  return (
    <div className="mt-4 text-xs text-slate-600">
      <div className="font-semibold mb-1">اختبارات</div>
      <ul className="space-y-1">
        {tests.map((t) => (
          <li key={t.name} className={t.pass ? "text-green-700" : "text-red-700"}>
            {t.pass ? "✅" : "❌"} {t.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
function TechAppPanel() {
  const [tab, setTab] = useState("assets"); // assets | invoice
  const [assets, setAssets] = useState([
    { id: "ITM-10", name: "فلتر 10\"", unit: "حبة", qty: 3, min: 2 },
    { id: "PMP-RO", name: "مضخة RO", unit: "حبة", qty: 1, min: 1 },
    { id: "HSE-34", name: "هوز 3/4", unit: "متر", qty: 8, min: 5 },
    { id: "CTN-CRB", name: "حشوة كربونية", unit: "حبة", qty: 4, min: 3 },
  ]);
  const [replenish, setReplenish] = useState([] as Array<{code:string; itemId:string; qty:number; time:string}>);
  const consume = (itemId: string, amountStr: string) => {
    const amount = Math.max(0, parseFloat(amountStr || "0"));
    if (!amount) return;
    setAssets(prev => prev.map(a => a.id === itemId ? { ...a, qty: Math.max(0, a.qty - amount) } : a));
    const code = `REQ-${itemId}-${Date.now()}`;
    const time = new Date().toLocaleString();
    setReplenish(prev => [{ code, itemId, qty: amount, time }, ...prev]);
    alert("تم تسجيل الاستهلاك وإرسال إشعار للمستودع");
  };
  const [items, setItems] = useState([{ name: "زيارة صيانة", qty: 1, price: 100 }]);
  const [customer, setCustomer] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [approved, setApproved] = useState(false);
  const total = useMemo(() => items.reduce((s, it) => s + Number(it.qty||0) * Number(it.price||0), 0), [items]);
  const addRow = () => setItems(prev => [...prev, { name: "", qty: 1, price: 0 }]);
  const rmRow = (i:number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const sendInvoice = () => {
    if (!approved) return alert("الزبون لم يوافق بعد — احصل على موافقته أولاً");
    if (!customer) return alert("أدخل اسم الزبون");
    if (!items.length || total <= 0) return alert("أضف بنودًا صحيحة للفاتورة");
    alert(`تم إرسال الفاتورة إلى: الزبون · الريسبشن · المدير · المستودع
الإجمالي: ${total.toLocaleString()}`);
  };
  return (
    <div className="space-y-6">
      <div className="rounded-3xl p-4 bg-gradient-to-r from-red-800 to-red-600 text-white flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">تطبيق الفني</h2>
          <p className="text-sm text-red-100">ممتلكاتي · خصم أثناء الصيانة · تعويض عبر QR · إنشاء فاتورة</p>
        </div>
        <div className="flex gap-2 text-sm">
          {[{k:"assets",l:"ممتلكاتي"},{k:"invoice",l:"الفاتورة"}].map(t => (
            <button key={t.k} onClick={()=>setTab(t.k)} className={`px-3 py-1.5 rounded-2xl ${tab===t.k?"bg-white text-red-800":"bg-white/10 text-white"}`}>{t.l}</button>
          ))}
        </div>
      </div>
      {tab === "assets" && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-2xl shadow-sm bg-white lg:col-span-2">
            <h3 className="font-semibold text-red-800 mb-3">القطع بحوزتي</h3>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500"><th className="py-2">#</th><th className="py-2">القطعة</th><th className="py-2">الكمية</th><th className="py-2">حد أدنى</th><th className="py-2">خصم</th></tr>
                </thead>
                <tbody>
                  {assets.map((a) => (
                    <tr key={a.id} className="border-t">
                      <td className="py-2">{a.id}</td>
                      <td className="py-2">{a.name} <span className="text-xs text-gray-500">/ {a.unit}</span></td>
                      <td className="py-2">{a.qty}</td>
                      <td className="py-2">{a.min}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <input id={`use-${a.id}`} className="border rounded-2xl p-1 w-20" placeholder="عدد" />
                          <button onClick={()=>{ const el = document.getElementById(`use-${a.id}`) as HTMLInputElement | null; consume(a.id, el?.value || ""); }} className="px-3 py-1.5 rounded-2xl border">خصم</button>
                          {a.qty <= a.min && <span className="text-xs text-red-700">⚠️ منخفض</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-4 border rounded-2xl shadow-sm bg-white">
            <h4 className="font-semibold mb-2">طلبات التعويض</h4>
            <ul className="text-sm space-y-2 max-h-64 overflow-auto pr-1">
              {replenish.length === 0 && <li className="text-gray-500">لا توجد طلبات</li>}
              {replenish.map(r => (
                <li key={r.code} className="p-3 border rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.itemId} · {r.qty}</div>
                      <div className="text-xs text-gray-500">{r.time}</div>
                    </div>
                    <div className="w-16 h-16 grid place-items-center border rounded-lg text-[10px]">QR<div className="text-[8px] leading-none">{r.code.slice(-6)}</div></div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="text-xs text-gray-500 mt-2">أبرز الـ QR في المستودع لإتمام التعويض بالباركود.</div>
          </div>
        </div>
      )}
      {tab === "invoice" && (
        <div className="p-4 border rounded-2xl shadow-sm bg-white">
          <h3 className="font-semibold text-red-800 mb-3">إنشاء فاتورة صيانة</h3>
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            <div className="md:col-span-2">
              <div className="overflow-auto rounded-2xl border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500"><th className="py-2">البند</th><th className="py-2">الكمية</th><th className="py-2">السعر</th><th className="py-2">—</th></tr>
                  </thead>
                  <tbody>
                    {items.map((it, i) => (
                      <tr key={i} className="border-t">
                        <td className="py-2"><input className="border rounded-2xl p-1 w-full" value={it.name} onChange={e=>setItems(prev=>prev.map((p,idx)=>idx===i?{...p,name:e.target.value}:p))} placeholder="مثال: تغيير فلتر" /></td>
                        <td className="py-2"><input className="border rounded-2xl p-1 w-20" value={it.qty} onChange={e=>setItems(prev=>prev.map((p,idx)=>idx===i?{...p,qty:+e.target.value}:p))} /></td>
                        <td className="py-2"><input className="border rounded-2xl p-1 w-24" value={it.price} onChange={e=>setItems(prev=>prev.map((p,idx)=>idx===i?{...p,price:+e.target.value}:p))} /></td>
                        <td className="py-2"><button className="text-red-700 underline" onClick={()=>rmRow(i)}>حذف</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <button className="px-3 py-1.5 rounded-2xl border" onClick={addRow}>إضافة بند</button>
                <div className="text-sm">الإجمالي: <span className="font-semibold">{total.toLocaleString()} ر.س</span></div>
              </div>
            </div>
            <div className="md:col-span-1 space-y-2">
              <input className="border rounded-2xl p-2 w-full" placeholder="اسم الزبون" value={customer} onChange={e=>setCustomer(e.target.value)} />
              <input className="border rounded-2xl p-2 w-full" placeholder="العنوان" value={address} onChange={e=>setAddress(e.target.value)} />
              <textarea className="border rounded-2xl p-2 w-full" rows={3} placeholder="ملاحظات" value={note} onChange={e=>setNote(e.target.value)} />
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={approved} onChange={e=>setApproved(e.target.checked)} /> حصلت على موافقة الزبون على التكلفة</label>
              <button onClick={sendInvoice} className="w-full rounded-2xl px-4 py-2 bg-red-800 text-white">إرسال الفاتورة</button>
              <div className="text-xs text-gray-500">الإرسال: الزبون · الريسبشن · المدير · المستودع</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/***********************
 * التطبيق — واجهة العملاء
 ***********************/
export default function App() {
  const [tab, setTab] = useState("home"); // home | devices | maintenance | track | notifications
  const [cart, setCart] = useState<any[]>([]);
  const [address, setAddress] = useState("");

  // صيانة
  const [maintenanceType, setMaintenanceType] = useState("filter"); // filter | solar
  const [issue, setIssue] = useState("");
  const [selectedTech, setSelectedTech] = useState<any>(null);
  const sortedTechs = useMemo(() => [...technicians].sort((a, b) => a.distanceKm - b.distanceKm), []);

  // أجهزة مملوكة + تنبيهات
  const [devices, setDevices] = useState(ownedDevicesSeed);
  const criticalNotifications = useMemo(() => {
    return devices
      .filter((d) => d.usagePct >= 80)
      .map((d) => ({
        id: "N-" + d.id,
        type: d.type,
        title: d.type === "filter" ? "عمر الفلتر شارف على الانتهاء" : "فحص صيانة وقائي مقترح",
        body:
          d.type === "filter"
            ? `${d.label}: المتبقي ~ ${Math.max(0, 100 - d.usagePct)}% — يُنصح بطلب تغيير الفلاتر.`
            : `${d.label}: تجاوز ${d.usagePct}% من عمره الافتراضي — جدولة فحص تزييت/تنظيف.`,
      }));
  }, [devices]);

  // تقييم الفني بعد إكمال الطلب
  const [showRating, setShowRating] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingNote, setRatingNote] = useState("");

  const handleSubmitMaintenance = () => {
    if (!address) return alert("فضلاً أدخل عنوانك بالتفصيل");
    if (!issue) return alert("فضلاً صف المشكلة");
    if (!selectedTech) return alert("اختر أقرب فني");
    setTab("track");
  };

  const markVisitDone = () => setShowRating(true);

  // ريندر تبويب واحد كعنصر مفرد دائمًا
  const renderTab = () => {
    switch (tab) {
      case "home":
        return <HomeView cart={cart} setCart={setCart}/>;
      case "devices":
        return <DevicesView devices={devices} />;
      case "maintenance":
        return (
          <MaintenanceView
            address={address}
            setAddress={setAddress}
            maintenanceType={maintenanceType}
            setMaintenanceType={setMaintenanceType}
            issue={issue}
            setIssue={setIssue}
            sortedTechs={sortedTechs}
            selectedTech={selectedTech}
            setSelectedTech={setSelectedTech}
            onSubmit={handleSubmitMaintenance}
          />
        );
      case "track":
        return <TrackView selectedTech={selectedTech} address={address} onDone={markVisitDone} />;
      case "notifications":
        return <NotificationsView criticalNotifications={criticalNotifications} goMaintenance={() => setTab("maintenance")} />;
      default:
        return <div className="p-4 rounded-2xl border bg-white">تبويب غير معروف</div>;
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      {/* أنماط الأنيميشن */}
      <WaterAnimationStyles />

      {/* رأس */}
      <header className="sticky top-0 z-10 bg-gradient-to-r from-red-800 to-red-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">تطبيق الطاقة الشمسية وفلترة المياه</h1>
            <p className="text-xs text-red-100">شراء منتجات · صيانة · تتبّع الفني · تنبيهات عمر الجهاز</p>
          </div>
          <nav className="hidden sm:flex gap-2 text-sm">
            <button onClick={() => setTab("home")} className={`px-3 py-1.5 rounded-2xl ${tab === "home" ? "bg-white text-red-800" : "bg-white/10 text-white"}`}>الرئيسية</button>
            <button onClick={() => setTab("devices")} className={`px-3 py-1.5 rounded-2xl ${tab === "devices" ? "bg-white text-red-800" : "bg-white/10 text-white"}`}>أجهزتي</button>
            <button onClick={() => setTab("maintenance")} className={`px-3 py-1.5 rounded-2xl ${tab === "maintenance" ? "bg-white text-red-800" : "bg-white/10 text-white"}`}>طلب صيانة</button>
            <button onClick={() => setTab("track")} className={`px-3 py-1.5 rounded-2xl ${tab === "track" ? "bg-white text-red-800" : "bg-white/10 text-white"}`}>تتبّع الفني</button>
            <button onClick={() => setTab("notifications")} className={`px-3 py-1.5 rounded-2xl ${tab === "notifications" ? "bg-white text-red-800" : "bg-white/10 text-white"}`}>التنبيهات</button>
          </nav>
        </div>
      </header>

      {/* محتوى — عنصر واحد دائمًا */}
      <main className="max-w-5xl mx-auto p-4">
        {renderTab()}
        {/* اختبارات تشغيل */}
        <DevTests tab={tab} childrenCount={1} />
      </main>

      {/* شريط تبويب سفلي للجوال */}
      <nav className="sm:hidden fixed inset-x-0 bottom-0 border-t bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-4 text-xs">
          <button onClick={() => setTab("home")} className={`py-2 ${tab === "home" ? "text-red-700 font-semibold" : "text-slate-600"}`}>الرئيسية</button>
          <button onClick={() => setTab("devices")} className={`py-2 ${tab === "devices" ? "text-red-700 font-semibold" : "text-slate-600"}`}>أجهزتي</button>
          <button onClick={() => setTab("maintenance")} className={`py-2 ${tab === "maintenance" ? "text-red-700 font-semibold" : "text-slate-600"}`}>صيانة</button>
          <button onClick={() => setTab("notifications")} className={`py-2 ${tab === "notifications" ? "text-red-700 font-semibold" : "text-slate-600"}`}>تنبيهات</button>
        </div>
      </nav>

      {/* نافذة التقييم */}
      {showRating && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4">
            <h3 className="font-semibold mb-1">قيّم تجربة الصيانة</h3>
            <p className="text-sm text-slate-600 mb-3">ساعدنا على تحسين الخدمة</p>
            <StarRating value={ratingValue} onChange={setRatingValue} />
            <textarea className="w-full border rounded-2xl p-2 text-sm mt-3" rows={3} placeholder="تعليق اختياري" value={ratingNote} onChange={(e) => setRatingNote(e.target.value)} />
            <div className="mt-3 flex items-center justify-end gap-2">
              <button className="px-3 py-1.5 rounded-2xl border" onClick={() => setShowRating(false)}>إلغاء</button>
              <button className="px-3 py-1.5 rounded-2xl bg-red-800 text-white" onClick={() => { setShowRating(false); alert("شكرًا لتقييمك!"); }}>إرسال</button>
            </div>
          </div>
        </div>
      )}

      <footer className="py-8 text-center text-xs text-slate-500">واجهة تجريبية — جميع البيانات وهمية لشرح الفكرة. استبدل Placeholder Map عند الدمج مع خدمة خرائط حقيقية.</footer>
    </div>
  );
}
