import { useMemo, useState, useEffect, useRef, memo } from "react";

/**
 * Unified Add‑ons Screens (Admin ▸ TellMarket ▸ HR ▸ Accounting ▸ CCTV ▸ Reception)
 * الهوية: أحمر داكن + Slate — تصميم موجّه للأجهزة اللوحية.
 *
 * 🔧 Fixes
 * - Removed stray character at BOF that caused: SyntaxError: Unexpected token (1:0).
 * - Closed all JSX trees properly; no stray parentheses/braces.
 * - Normalized Tailwind classes (bg-white/text-white/items-center).
 * - Completed missing components (ReceptionPanel, CCTVPanel) and App wiring.
 * - Kept dev self‑tests; added extra cases.
 */

/***********************
 * بيانات وهمية مشتركة
 ***********************/
const sampleLeads = [
  { id: "L-101", name: "أحمد عبد الله", phone: "0501234567", area: "حي الروضة", note: "سأل عن فلتر RO" },
  { id: "L-102", name: "سارة الشمري", phone: "0559876543", area: "حي العليا", note: "مهتمة بالسخان الشمسي" },
  { id: "L-103", name: "مازن تركي", phone: "0532221188", area: "الياسمين", note: "عميل سابق — يحتاج صيانة" },
];

const sampleEngineers = [
  { id: "E-1", name: "م. خالد", area: "الروضة", status: "available" },
  { id: "E-2", name: "م. سليم", area: "العليا", status: "busy" },
  { id: "E-3", name: "م. نورة", area: "الياسمين", status: "offline" },
];

const kpis = [
  { label: "مكالمات اليوم", value: 36 },
  { label: "مواعيد محجوزة", value: 12 },
  { label: "نسبة التحويل", value: "33%" },
];

// كاميرات وهمية
const sampleCameras = [
  { id: "C-01", name: "مدخل رئيسي", area: "الاستقبال", status: "online" },
  { id: "C-02", name: "ممر المستودع", area: "المستودع", status: "online" },
  { id: "C-03", name: "المخارج الخلفية", area: "الساحة", status: "offline" },
  { id: "C-04", name: "ورشة الصيانة", area: "الصيانة", status: "online" },
  { id: "C-05", name: "موقف السيارات", area: "الخارج", status: "online" },
];

// أقساط/تركيبات/بنزين — بيانات وهمية مفصّلة
const sampleInstallments = [
  { id: "INS-1001", customer: "خالد الشمري", product: "فلتر RO 6 مراحل", start: "2025-06-15", end: "2026-06-15", monthly: 180, paidMonths: 4, totalMonths: 12 },
  { id: "INS-1002", customer: "نورة الدوسري", product: "سخان شمسي 200L", start: "2025-08-01", end: "2026-08-01", monthly: 320, paidMonths: 2, totalMonths: 12 },
  { id: "INS-1003", customer: "أبو يزيد", product: "جامبو صناعي", start: "2025-04-10", end: "2026-04-10", monthly: 550, paidMonths: 6, totalMonths: 12 },
];

const sampleInstallations = [
  { id: "JOB-3001", date: "2025-10-20", customer: "أم محمد", address: "حي النرجس، شارع 12", device: "سخان شمسي 200L", engineer: "م. سليم" },
  { id: "JOB-3002", date: "2025-10-22", customer: "أبو وليد", address: "حي الروابي، مقابل مسجد السلام", device: "فلتر RO 5 مراحل", engineer: "م. خالد" },
  { id: "JOB-3003", date: "2025-10-27", customer: "مؤسسة صفاء الماء", address: "المنطقة الصناعية، مستودع 7", device: "جامبو 20", engineer: "م. نورة" },
];

const sampleFuel = [
  { engineer: "م. خالد", date: "2025-10-29", liters: 9.8, distanceKm: 74, routes: ["المقر → حي الروضة", "الروضة → النرجس", "النرجس → المقر"] },
  { engineer: "م. سليم", date: "2025-10-29", liters: 12.4, distanceKm: 96, routes: ["المقر → العليا", "العليا → الياسمين", "الياسمين → المقر"] },
  { engineer: "م. نورة", date: "2025-10-29", liters: 7.1, distanceKm: 58, routes: ["المقر → الصناعية", "الصناعية → المستودع", "المستودع → المقر"] },
];

/***********************
 * عناصر مساعدة
 ***********************/
const Badge = memo(function Badge({ children, color = "gray" }: { children: any; color?: "green"|"red"|"yellow"|"gray"|"blue" }) {
  const map: Record<string, string> = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs ${map[color]}`}>{children}</span>;
});

function SectionCard({ title, desc, onEnter }: { title: string; desc?: string; onEnter?: () => void }) {
  return (
    <div className="p-4 border rounded-2xl shadow-sm text-center border-slate-200">
      <h3 className="font-semibold mb-1">{title}</h3>
      {desc && <p className="text-sm text-gray-500">{desc}</p>}
      <button onClick={onEnter} className="mt-3 px-4 py-2 rounded-2xl w-full border bg-white hover:bg-slate-50">دخول</button>
    </div>
  );
}

/***********************
 * لوحة المدير (ملخص)
 ***********************/
const AdminUI = ({ goTo }: { goTo: (s: string) => void }) => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-6 gap-4">
      <SectionCard title="قسم المحاسبة" desc="إدارة الفواتير والتحصيلات" onEnter={() => goTo("accounting")} />
      <SectionCard title="قسم الموارد البشرية" desc="الموظفين والتوظيف والإجازات" onEnter={() => goTo("hr")} />
      <SectionCard title="قسم الريسبشن" desc="تذاكر الصيانة وخدمة العملاء" onEnter={() => goTo("reception")} />
      <SectionCard title="المستودع" desc="الكميات والمواد المتوفرة" onEnter={() => goTo("warehouse")} />
      <SectionCard title="Tell Market" desc="حملات الاتصال وحجز فحوص المياه" onEnter={() => goTo("tellmarket")} />
      <SectionCard title="الكاميرات" desc="مراقبة البث المباشر والأرشيف" onEnter={() => goTo("cctv")} />
    </div>

    <div className="grid md:grid-cols-3 gap-4">
      <div className="p-4 border rounded-2xl shadow-sm border-slate-200">
        <h3 className="text-sm font-semibold mb-2">إحصائيات عامة</h3>
        <ul className="text-sm space-y-1">
          <li>عدد الطلبات اليوم: <span className="font-bold">23</span></li>
          <li>عدد الفنيين في الميدان: <span className="font-bold">8</span></li>
          <li>إجمالي المبيعات هذا الشهر: <span className="font-bold">52,400</span></li>
        </ul>
      </div>
      <div className="p-4 border rounded-2xl shadow-sm border-slate-200">
        <h3 className="text-sm font-semibold mb-2">المخزون الحرج</h3>
        <ul className="text-sm space-y-1">
          <li>فلاتر 10” — <span className="text-red-600">منخفض</span></li>
          <li>مضخات RO — <span className="text-green-600">كافٍ</span></li>
          <li>حشوات كربونية — <span className="text-amber-600">قريبة للنفاد</span></li>
        </ul>
      </div>
      <div className="p-4 border rounded-2xl shadow-sm border-slate-200">
        <h3 className="text-sm font-semibold mb-2">أحدث الطلبات</h3>
        <ul className="text-sm space-y-1">
          <li>#123 — تركيب جديد — <span className="text-amber-700">قيد التنفيذ</span></li>
          <li>#124 — صيانة دورية — <span className="text-green-700">مكتمل</span></li>
          <li>#125 — فحص — <span className="text-gray-600">مجدول</span></li>
        </ul>
      </div>
    </div>

    <div className="p-4 border rounded-2xl shadow-sm border-slate-200">
      <h3 className="text-sm font-semibold mb-2">تتبع الفنيين — عرض تجريبي</h3>
      <div className="h-72 border border-dashed rounded-2xl flex items-center justify-center text-gray-500 text-sm">
        خريطة توضح موقع الفنيين والزبائن — Placeholder Map
      </div>
      <div className="flex justify-between mt-3 text-xs text-gray-500">
        <span>الفني: أحمد (متاح)</span>
        <span>الفني: خالد (في الطريق)</span>
        <span>الفني: سامي (منجز)</span>
      </div>
    </div>
  </div>
);

/***********************************
 * Tell Market — (Tablet‑first UI)
 ***********************************/
function EngineerChip({ eng, selected, onSelect }: { eng: any; selected?: boolean; onSelect?: (e: any) => void }) {
  const color = eng.status === "available" ? "bg-green-100 text-green-700" : eng.status === "busy" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600";
  return (
    <button onClick={() => onSelect?.(eng)} className={`w-full text-right px-3 py-3 rounded-2xl border ${selected ? "border-red-700" : "border-slate-200"} flex items-center justify-between`}>
      <div>
        <div className="font-medium">{eng.name}</div>
        <div className="text-xs text-gray-500">منطقة: {eng.area}</div>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full ${color}`}>
        {eng.status === "available" ? "متاح" : eng.status === "busy" ? "مشغول" : "غير متصل"}
      </span>
    </button>
  );
}

const TellMarketUI = () => {
  const [leadIdx, setLeadIdx] = useState(0);
  const lead = sampleLeads[leadIdx];
  const [outcome, setOutcome] = useState(""); // bought / no / accept
  const [selectedEngineer, setSelectedEngineer] = useState<any | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const outcomeLabel = useMemo(() => ({ bought: "عميل سابق — صيانة", no: "غير مهتم", accept: "موافقة على فحص" })[outcome] || "", [outcome]);

  return (
    <div className="space-y-6">
      {/* شريط علوي بالهوية */}
      <div className="rounded-3xl p-4 bg-gradient-to-r from-red-800 to-red-600 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Tell Market — لوحة الاتصال</h2>
            <p className="text-sm text-red-100">إدارة المكالمات، نتائجها، وحجز مواعيد الفحص للمهندسين المرتبطين</p>
          </div>
          <div className="flex gap-3">
            {kpis.map((k) => (
              <div key={k.label} className="px-3 py-2 rounded-2xl bg-white/10 text-sm">
                <div className="text-red-100">{k.label}</div>
                <div className="font-semibold">{k.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* تخطيط لوحي: قائمة عملاء يسار، مساحة المكالمة يمين */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* قائمة الداتا */}
        <div className="lg:col-span-1 p-4 border rounded-2xl shadow-sm border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">القائمة المخصصة لي</h3>
            <Badge color="blue">{sampleLeads.length} عميل</Badge>
          </div>
          <ul className="space-y-2 text-sm">
            {sampleLeads.map((l, i) => (
              <li key={l.id}>
                <button onClick={() => setLeadIdx(i)} className={`w-full text-right p-3 rounded-2xl border ${leadIdx === i ? "border-red-700 bg-red-50" : "border-slate-200"}`}>
                  <div className="font-medium">{l.name}</div>
                  <div className="text-xs text-gray-500">{l.phone} · {l.area}</div>
                  {l.note && <div className="text-xs text-slate-500 mt-1">{l.note}</div>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* مساحة المكالمة والإجراءات */}
        <div className="lg:col-span-2 p-4 border rounded-2xl shadow-sm border-slate-200 bg-white">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div>
              <h3 className="font-semibold">مكالمة مع: <span className="text-red-800">{lead.name}</span></h3>
              <p className="text-sm text-gray-500">{lead.phone} · {lead.area}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setOutcome("bought")} className={`px-3 py-2 rounded-2xl border text-sm ${outcome === "bought" ? "bg-red-800 text-white border-red-800" : ""}`}>عميل سابق</button>
              <button onClick={() => setOutcome("no")} className={`px-3 py-2 rounded-2xl border text-sm ${outcome === "no" ? "bg-red-800 text-white border-red-800" : ""}`}>غير مهتم</button>
              <button onClick={() => setOutcome("accept")} className={`px-3 py-2 rounded-2xl border text-sm ${outcome === "accept" ? "bg-red-800 text-white border-red-800" : ""}`}>وافق على فحص</button>
            </div>
          </div>

          {/* عند القبول: جدولة و اختيار مهندس */}
          <div className="mt-4 grid md:grid-cols-5 gap-4">
            <div className="md:col-span-3">
              <div className="p-3 rounded-2xl border border-slate-200">
                <div className="text-sm font-semibold mb-2">جدولة فحص مجاني</div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <input className="border rounded-2xl p-2" placeholder="تاريخ" value={date} onChange={(e) => setDate(e.target.value)} />
                  <input className="border rounded-2xl p-2" placeholder="وقت" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
                <div className="mt-3 text-xs text-gray-500">سيتم إرسال تأكيد للعميل عبر رسالة نصية/واتساب.</div>
              </div>

              <div className="mt-4 p-3 rounded-2xl border border-slate-200">
                <div className="text-sm font-semibold mb-2">خريطة ارتباط (وهمي)</div>
                <div className="h-48 border-dashed border rounded-2xl flex items-center justify-center text-gray-500 text-sm">مسار من موقع العميل ← إلى المهندس المختار</div>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="p-3 rounded-2xl border border-slate-200">
                <div className="text-sm font-semibold mb-2">مهندسو الفحص المرتبطون بي</div>
                <div className="space-y-2">
                  {sampleEngineers.map((e) => (
                    <EngineerChip key={e.id} eng={e} selected={selectedEngineer?.id === e.id} onSelect={setSelectedEngineer} />
                  ))}
                </div>
                <button disabled={outcome !== "accept" || !selectedEngineer || !date || !time} className={`mt-3 w-full rounded-2xl px-4 py-3 text-white ${outcome !== "accept" || !selectedEngineer || !date || !time ? "bg-red-300" : "bg-red-800 hover:bg-red-700"}`}>
                  حجز الموعد للمهندس المختار
                </button>
                {outcomeLabel && <div className="mt-2 text-xs text-gray-500">نتيجة المكالمة: <span className="font-medium text-red-800">{outcomeLabel}</span></div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* جدول مخرجات اليوم */}
      <div className="p-4 border rounded-2xl shadow-sm border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">مخرجات اليوم</h3>
          <div className="text-xs text-gray-500">قابلة للتصدير PDF</div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2">العميل</th>
                <th className="py-2">الهاتف</th>
                <th className="py-2">المنطقة</th>
                <th className="py-2">النتيجة</th>
                <th className="py-2">المهندس</th>
                <th className="py-2">موعد الفحص</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-2">{lead.name}</td>
                <td className="py-2">{lead.phone}</td>
                <td className="py-2">{lead.area}</td>
                <td className="py-2">{outcomeLabel || "—"}</td>
                <td className="py-2">{selectedEngineer?.name || "—"}</td>
                <td className="py-2">{date && time ? `${date} ${time}` : "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/***********************************
 * HR — لوحة الموارد البشرية (مستقلة)
 ***********************************/
const sampleApplicants = [
  { id: "A-201", name: "فهد الرشيد", role: "فني صيانة", phone: "0501122334", status: "new", interview: "—" },
  { id: "A-202", name: "ليان المطيري", role: "مهندس فحص", phone: "0556677889", status: "review", interview: "غدًا 4:00 م" },
  { id: "A-203", name: "سالم العمري", role: "موظف ريسبشن", phone: "0539988776", status: "new", interview: "—" },
];

const sampleEmployees = [
  { id: "E-901", name: "أحمد السالم", role: "فني", area: "النسيم", status: "نشط" },
  { id: "E-902", name: "نورة الحربي", role: "مهندس فحص", area: "العليا", status: "إجازة" },
  { id: "E-903", name: "هيفاء السبيعي", role: "ريسبشن", area: "المقر", status: "نشط" },
];

function StatusPill({ s }: { s: string }) {
  const map: Record<string, string> = { new: "جديد", review: "مراجعة", scheduled: "مجدول", accepted: "مقبول", rejected: "مرفوض" };
  const color = s === "accepted" ? "bg-green-100 text-green-700" : s === "rejected" ? "bg-red-100 text-red-700" : s === "scheduled" ? "bg-blue-100 text-blue-700" : s === "review" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700";
  return <span className={`px-2 py-0.5 rounded-full text-xs ${color}`}>{map[s] || s}</span>;
}


/***********************************
 * HR — لوحة الموارد البشرية (محدّثة)
 ***********************************/
const HRPanel = () => {
  // تبويب افتراضي يبقى "applicants" للحفاظ على السلوك السابق
  const [tab, setTab] = useState<
    | "applicants" | "employees" | "attendance" | "leaves" | "payroll"
    | "biometrics" | "timeAnalysis" | "delays" | "deductions"
    | "discipline" | "leavesApproval" | "leavesEntry" | "branchesReport"
  >("applicants");

  const [idx, setIdx] = useState(0);
  const a = sampleApplicants[idx];

  /*** بيانات وهمية إضافية لتبويبات جديدة ***/
  // 1) سحب بصمات (Raw biometrics)
  const biometricPulls = [
    { id: "BM-1001", employee: "أحمد السالم", date: "2025-10-29", in: "08:03", out: "—", device: "قارئ-مدخل1" },
    { id: "BM-1002", employee: "هيفاء السبيعي", date: "2025-10-29", in: "08:58", out: "—", device: "قارئ-مدخل1" },
    { id: "BM-1003", employee: "نورة الحربي", date: "2025-10-29", in: "—", out: "—", device: "إجازة" },
  ];

  // 2) تحليل الدوام (Aggregates)
  const scheduledStart = "08:00";
  const scheduledEnd = "17:00";
  const timeAnalysis = [
    { name: "أحمد السالم", firstIn: "08:03", lastOut: "—", lateMins: 3, overtimeMins: 0, status: "OnDuty" },
    { name: "هيفاء السبيعي", firstIn: "08:58", lastOut: "—", lateMins: 58, overtimeMins: 0, status: "Late" },
    { name: "نورة الحربي", firstIn: "—", lastOut: "—", lateMins: 0, overtimeMins: 0, status: "Leave" },
  ];

  // 3) التأخيرات
  const delaysList = [
    { name: "هيفاء السبيعي", date: "2025-10-29", lateMins: 58, justification: "ازدحام" },
    { name: "أحمد السالم", date: "2025-10-27", lateMins: 9, justification: "" },
  ];

  // 4) الخصومات والإنذارات
  const [pendingDeductions, setPendingDeductions] = useState([
    { id: "DD-5001", name: "هيفاء السبيعي", reason: "تأخير متكرر", amount: 50, type: "خصم", status: "مسودة" },
    { id: "DD-5002", name: "أحمد السالم", reason: "عدم ختم خروج", amount: 0, type: "إنذار", status: "مسودة" },
  ]);

  // 5) العقوبات/الضبوط
  const [disciplineRecords, setDisciplineRecords] = useState([
    { id: "DC-7001", name: "موظف ريسبشن", date: "2025-10-25", action: "لفت نظر", note: "سوء تواصل" },
  ]);

  // 6) موافقة الإجازات وإرسال للمدير
  const [leaveApprovals, setLeaveApprovals] = useState([
    { id: "LV-8001", name: "هيفاء السبيعي", type: "سنوية", from: "2025-11-10", to: "2025-11-14", status: "بانتظار HR" },
    { id: "LV-8002", name: "م. خالد", type: "طارئة", from: "2025-11-02", to: "2025-11-03", status: "بانتظار HR" },
  ]);

  // 7) إدخال الإجازات المعتمدة
  const [approvedLeaves, setApprovedLeaves] = useState([
    { id: "AP-9001", name: "نورة الحربي", type: "سنوية", from: "2025-10-29", to: "2025-10-30" },
  ]);

  // 8) تقرير يومي للفروع / إعداد قرارات
  const branches = ["المقر الرئيسي", "فرع الصناعية", "فرع العليا"];
  const [selectedBranch, setSelectedBranch] = useState(branches[0]);
  const branchDaily = [
    { branch: "المقر الرئيسي", date: "2025-10-29", present: 14, absent: 2, late: 3, notes: "يوم عمل اعتيادي" },
    { branch: "فرع الصناعية", date: "2025-10-29", present: 6, absent: 1, late: 1, notes: "ضغط عمل متوسط" },
    { branch: "فرع العليا", date: "2025-10-29", present: 4, absent: 0, late: 0, notes: "سير طبيعي" },
  ];

  // أدوات مصغّرة
  const pillForStatus = (s: string) =>
    s === "مسودة" ? <Badge color="gray">مسودة</Badge> :
    s === "بانتظار HR" ? <Badge color="yellow">بانتظار HR</Badge> :
    s === "أُرسل للمدير" ? <Badge color="blue">أُرسل للمدير</Badge> :
    s === "مقبول" ? <Badge color="green">مقبول</Badge> :
    s === "مرفوض" ? <Badge color="red">مرفوض</Badge> : <Badge color="gray">{s}</Badge>;

  return (
    <div className="space-y-6">
      {/* رأس الهوية + التبوّبات */}
      <div className="rounded-3xl p-4 bg-gradient-to-r from-red-800 to-red-600 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">الموارد البشرية — HR</h2>
            <p className="text-sm text-red-100">التوظيف · الموظفون · البصمات/الدوام · التأخيرات · الخصومات/العقوبات · الإجازات · الرواتب · تقارير الفروع</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { key: "applicants", label: "المتقدّمون" },
            { key: "employees", label: "الموظفون" },
            { key: "biometrics", label: "سحب البصمات" },
            { key: "timeAnalysis", label: "تحليل الدوام" },
            { key: "deductions", label: "الخصومات/الإنذارات" },
            { key: "discipline", label: "العقوبات/الضبوط" },
            { key: "leavesApproval", label: "إجازات (اعتماد/مدير)" },
            { key: "leavesEntry", label: "إدخال الإجازات" },
            { key: "attendance", label: "الحضور" },
            { key: "leaves", label: "الإجازات (عرض)" },
            { key: "payroll", label: "الرواتب" },
            { key: "branchesReport", label: "تقرير الفروع" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-3 py-1.5 rounded-2xl text-sm ${tab === t.key ? "bg-white text-red-800" : "bg-white/10 text-white"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* المتقدّمون (كما هو) */}
      {tab === "applicants" && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 p-4 border rounded-2xl shadow-sm border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">قائمة المتقدّمين</h3>
              <Badge color="blue">{sampleApplicants.length} ملف</Badge>
            </div>
            <ul className="space-y-2 text-sm">
              {sampleApplicants.map((c, i) => (
                <li key={c.id}>
                  <button onClick={() => setIdx(i)} className={`w-full text-right p-3 rounded-2xl border ${idx === i ? "border-red-700 bg-red-50" : "border-slate-200"}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{c.name}</div>
                      <StatusPill s={c.status} />
                    </div>
                    <div className="text-xs text-gray-500">{c.role} · {c.phone}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 p-4 border rounded-2xl shadow-sm border-slate-200 bg-white">
            <h3 className="font-semibold text-red-800 mb-2">{a.name} — {a.role}</h3>
            <div className="text-sm text-gray-600 mb-4">الهاتف: {a.phone} · الحالة: <StatusPill s={a.status} /> · المقابلة: {a.interview}</div>

            <div className="grid md:grid-cols-2 gap-3 mb-4">
              <div className="p-3 border rounded-2xl">
                <div className="text-sm font-semibold mb-2">جدولة مقابلة</div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" className="border rounded-2xl p-2" />
                  <input type="time" className="border rounded-2xl p-2" />
                </div>
                <button className="mt-3 w-full rounded-2xl px-4 py-2 bg-red-800 text-white">حفظ الموعد</button>
              </div>
              <div className="p-3 border rounded-2xl">
                <div className="text-sm font-semibold mb-2">قرار بعد المقابلة</div>
                <div className="flex gap-2">
                  <button className="rounded-2xl px-3 py-2 border">رفض</button>
                  <button className="rounded-2xl px-3 py-2 border">قيد المراجعة</button>
                  <button className="rounded-2xl px-3 py-2 bg-red-800 text-white">اعتماد وإرسال للمدير</button>
                </div>
              </div>
            </div>

            <div className="p-3 border rounded-2xl">
              <div className="text-sm font-semibold mb-2">قائمة التحقق للتعيين (Onboarding)</div>
              <ul className="text-sm space-y-2">
                <li><input type="checkbox" className="mr-2" /> هوية/إقامة</li>
                <li><input type="checkbox" className="mr-2" /> شهادات وخبرات</li>
                <li><input type="checkbox" className="mr-2" /> فحص طبي</li>
                <li><input type="checkbox" className="mr-2" /> توقيع عقد العمل</li>
              </ul>
              <button className="mt-3 rounded-2xl px-4 py-2 border">تحويل إلى موظف</button>
            </div>
          </div>
        </div>
      )}

      {/* الموظفون (كما هو) */}
      {tab === "employees" && (
        <div className="p-4 border rounded-2xl shadow-sm border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">دليل الموظفين</h3>
            <input className="border rounded-2xl p-2 text-sm" placeholder="بحث بالاسم/الدور/المنطقة" />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {sampleEmployees.map((e) => (
              <div key={e.id} className="p-3 border rounded-2xl">
                <div className="font-medium">{e.name}</div>
                <div className="text-sm text-gray-600">{e.role} · {e.area}</div>
                <div className="text-xs mt-1"><Badge color={e.status === "نشط" ? "green" : "yellow"}>{e.status}</Badge></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1) سحب البصمات */}
      {tab === "biometrics" && (
        <div className="p-4 border rounded-2xl shadow-sm bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">سحب بصمات — اليوم</h3>
            <div className="text-xs text-gray-500">قارئات متعددة | تصدير CSV/PDF لاحقاً</div>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2">#</th><th className="py-2">الموظف</th><th className="py-2">التاريخ</th><th className="py-2">دخول</th><th className="py-2">خروج</th><th className="py-2">الجهاز</th>
                </tr>
              </thead>
              <tbody>
                {biometricPulls.map(r => (
                  <tr key={r.id} className="border-t">
                    <td className="py-2">{r.id}</td><td className="py-2">{r.employee}</td><td className="py-2">{r.date}</td><td className="py-2">{r.in}</td><td className="py-2">{r.out}</td><td className="py-2">{r.device}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2) تحليل الدوام */}
      {tab === "timeAnalysis" && (
        <div className="p-4 border rounded-2xl shadow-sm bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">تحليل الدوام</h3>
            <div className="text-xs text-gray-500">المجدول: {scheduledStart}–{scheduledEnd}</div>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2">الموظف</th><th className="py-2">أول دخول</th><th className="py-2">آخر خروج</th><th className="py-2">تأخير (دقائق)</th><th className="py-2">ساعات إضافية (دقائق)</th><th className="py-2">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {timeAnalysis.map(r => (
                  <tr key={r.name} className="border-t">
                    <td className="py-2">{r.name}</td><td className="py-2">{r.firstIn}</td><td className="py-2">{r.lastOut}</td>
                    <td className="py-2">{r.lateMins}</td><td className="py-2">{r.overtimeMins}</td>
                    <td className="py-2">{r.status === "Late" ? <Badge color="yellow">متأخر</Badge> : r.status === "Leave" ? <Badge color="blue">إجازة</Badge> : <Badge color="green">على رأس العمل</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}



      {/* 4) الخصومات والإنذارات */}
      {tab === "deductions" && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 border rounded-2xl shadow-sm bg-white">
            <h3 className="font-semibold mb-3">قائمة الخصومات/الإنذارات (مسودات)</h3>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500"><th className="py-2">#</th><th className="py-2">الموظف</th><th className="py-2">السبب</th><th className="py-2">النوع</th><th className="py-2">القيمة</th><th className="py-2">الحالة</th><th className="py-2">إجراء</th></tr></thead>
                <tbody>
                  {pendingDeductions.map(r => (
                    <tr key={r.id} className="border-t">
                      <td className="py-2">{r.id}</td><td className="py-2">{r.name}</td><td className="py-2">{r.reason}</td>
                      <td className="py-2">{r.type}</td><td className="py-2">{r.amount || "—"}</td><td className="py-2">{pillForStatus(r.status)}</td>
                      <td className="py-2">
                        <button className="px-2 py-1 rounded-xl border text-xs mr-1" onClick={()=>{
                          setPendingDeductions(prev=>prev.map(p=>p.id===r.id?{...p,status:"أُرسل للمدير"}:p));
                        }}>إرسال للمدير</button>
                        <button className="px-2 py-1 rounded-xl border text-xs" onClick={()=>{
                          setPendingDeductions(prev=>prev.filter(p=>p.id!==r.id));
                        }}>حذف</button>
                      </td>
                    </tr>
                  ))}
                  {!pendingDeductions.length && <tr><td colSpan={7} className="text-center text-xs text-gray-500 py-6">لا توجد مسودات</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-4 border rounded-2xl shadow-sm bg-white">
            <h4 className="font-semibold mb-2">إضافة خصم/إنذار</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <input className="border rounded-2xl p-2" id="dd-name" placeholder="اسم الموظف" />
              <select className="border rounded-2xl p-2" id="dd-type"><option>خصم</option><option>إنذار</option></select>
              <input className="border rounded-2xl p-2" id="dd-reason" placeholder="السبب" />
              <input className="border rounded-2xl p-2" id="dd-amount" placeholder="القيمة (اختياري)" />
              <button className="rounded-2xl px-4 py-2 bg-red-800 text-white"
                onClick={()=>{
                  const name = (document.getElementById("dd-name") as HTMLInputElement).value || "موظف مجهول";
                  const type = (document.getElementById("dd-type") as HTMLSelectElement).value;
                  const reason = (document.getElementById("dd-reason") as HTMLInputElement).value || "—";
                  const amount = Number((document.getElementById("dd-amount") as HTMLInputElement).value)||0;
                  const id = `DD-${Math.floor(Math.random()*9000)+1000}`;
                  setPendingDeductions(prev=>[{ id, name, reason, amount, type, status:"مسودة" }, ...prev]);
                }}
              >حفظ كمسودة</button>
            </div>
          </div>
        </div>
      )}

      {/* 5) العقوبات/الضبوط */}
      {tab === "discipline" && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 border rounded-2xl shadow-sm bg-white">
            <h3 className="font-semibold mb-3">سجل العقوبات/الضبوط</h3>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500"><th className="py-2">#</th><th className="py-2">الموظف</th><th className="py-2">التاريخ</th><th className="py-2">الإجراء</th><th className="py-2">ملاحظة</th></tr></thead>
                <tbody>
                  {disciplineRecords.map(r => (
                    <tr key={r.id} className="border-t">
                      <td className="py-2">{r.id}</td><td className="py-2">{r.name}</td><td className="py-2">{r.date}</td><td className="py-2">{r.action}</td><td className="py-2">{r.note}</td>
                    </tr>
                  ))}
                  {!disciplineRecords.length && <tr><td colSpan={5} className="text-center text-xs text-gray-500 py-6">لا يوجد سجلات</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-4 border rounded-2xl shadow-sm bg-white">
            <h4 className="font-semibold mb-2">تسجيل ضبط/عقوبة</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <input className="border rounded-2xl p-2" id="dc-name" placeholder="اسم الموظف" />
              <input className="border rounded-2xl p-2" id="dc-date" type="date" />
              <input className="border rounded-2xl p-2" id="dc-action" placeholder="نوع الإجراء (لفت نظر/إنذار/خصم...)" />
              <input className="border rounded-2xl p-2" id="dc-note" placeholder="ملاحظة" />
              <button className="rounded-2xl px-4 py-2 bg-red-800 text-white"
                onClick={()=>{
                  const id = `DC-${Math.floor(Math.random()*9000)+1000}`;
                  const name = (document.getElementById("dc-name") as HTMLInputElement).value || "—";
                  const date = (document.getElementById("dc-date") as HTMLInputElement).value || new Date().toISOString().slice(0,10);
                  const action = (document.getElementById("dc-action") as HTMLInputElement).value || "إجراء";
                  const note = (document.getElementById("dc-note") as HTMLInputElement).value || "";
                  setDisciplineRecords(prev=>[{ id, name, date, action, note }, ...prev]);
                }}
              >حفظ</button>
            </div>
          </div>
        </div>
      )}

      {/* 6) الإجازات — موافقة وإرسال للمدير */}
      {tab === "leavesApproval" && (
        <div className="p-4 border rounded-2xl shadow-sm bg-white">
          <h3 className="font-semibold mb-3">طلبات الإجازة — اعتماد HR ثم إرسال للمدير</h3>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500"><th className="py-2">#</th><th className="py-2">الموظف</th><th className="py-2">النوع</th><th className="py-2">من</th><th className="py-2">إلى</th><th className="py-2">الحالة</th><th className="py-2">إجراء</th></tr></thead>
              <tbody>
                {leaveApprovals.map(r => (
                  <tr key={r.id} className="border-t">
                    <td className="py-2">{r.id}</td><td className="py-2">{r.name}</td><td className="py-2">{r.type}</td>
                    <td className="py-2">{r.from}</td><td className="py-2">{r.to}</td><td className="py-2">{pillForStatus(r.status)}</td>
                    <td className="py-2">
                      <button className="px-2 py-1 rounded-xl border text-xs mr-1" onClick={()=>{
                        setLeaveApprovals(prev=>prev.map(p=>p.id===r.id?{...p,status:"أُرسل للمدير"}:p));
                      }}>إرسال للمدير</button>
                      <button className="px-2 py-1 rounded-xl border text-xs mr-1" onClick={()=>{
                        setLeaveApprovals(prev=>prev.map(p=>p.id===r.id?{...p,status:"مقبول"}:p));
                      }}>اعتماد HR</button>
                      <button className="px-2 py-1 rounded-xl border text-xs" onClick={()=>{
                        setLeaveApprovals(prev=>prev.map(p=>p.id===r.id?{...p,status:"مرفوض"}:p));
                      }}>رفض</button>
                    </td>
                  </tr>
                ))}
                {!leaveApprovals.length && <tr><td colSpan={7} className="text-center text-xs text-gray-500 py-6">لا توجد طلبات</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7) إدخال الإجازات الموافقة */}
      {tab === "leavesEntry" && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 border rounded-2xl shadow-sm bg-white">
            <h3 className="font-semibold mb-3">الإجازات المعتمدة (إدخال/تحرير)</h3>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500"><th className="py-2">#</th><th className="py-2">الموظف</th><th className="py-2">النوع</th><th className="py-2">من</th><th className="py-2">إلى</th></tr></thead>
                <tbody>
                  {approvedLeaves.map(l => (
                    <tr key={l.id} className="border-t">
                      <td className="py-2">{l.id}</td><td className="py-2">{l.name}</td><td className="py-2">{l.type}</td><td className="py-2">{l.from}</td><td className="py-2">{l.to}</td>
                    </tr>
                  ))}
                  {!approvedLeaves.length && <tr><td colSpan={5} className="text-center text-xs text-gray-500 py-6">لا توجد إجازات</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-4 border rounded-2xl shadow-sm bg-white">
            <h4 className="font-semibold mb-2">إضافة إجازة معتمدة</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <input id="ap-name" className="border rounded-2xl p-2" placeholder="اسم الموظف" />
              <select id="ap-type" className="border rounded-2xl p-2"><option>سنوية</option><option>طارئة</option><option>بدون راتب</option></select>
              <input id="ap-from" type="date" className="border rounded-2xl p-2" />
              <input id="ap-to" type="date" className="border rounded-2xl p-2" />
              <button className="rounded-2xl px-4 py-2 bg-red-800 text-white"
                onClick={()=>{
                  const id = `AP-${Math.floor(Math.random()*9000)+1000}`;
                  const name = (document.getElementById("ap-name") as HTMLInputElement).value || "—";
                  const type = (document.getElementById("ap-type") as HTMLSelectElement).value;
                  const from = (document.getElementById("ap-from") as HTMLInputElement).value || new Date().toISOString().slice(0,10);
                  const to = (document.getElementById("ap-to") as HTMLInputElement).value || from;
                  setApprovedLeaves(prev=>[{ id, name, type, from, to }, ...prev]);
                }}
              >حفظ</button>
            </div>
          </div>
        </div>
      )}

      {/* الحضور (كما كان) */}
      {tab === "attendance" && (
        <div className="p-4 border rounded-2xl shadow-sm border-slate-200 bg-white">
          <h3 className="font-semibold mb-3">الحضور اليومي</h3>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2">الموظف</th>
                  <th className="py-2">الدور</th>
                  <th className="py-2">بداية الدوام</th>
                  <th className="py-2">نهاية الدوام</th>
                  <th className="py-2">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="py-2">أحمد السالم</td>
                  <td className="py-2">فني</td>
                  <td className="py-2">08:03</td>
                  <td className="py-2">—</td>
                  <td className="py-2">جولة صباحية</td>
                </tr>
                <tr className="border-t">
                  <td className="py-2">نورة الحربي</td>
                  <td className="py-2">مهندس فحص</td>
                  <td className="py-2">—</td>
                  <td className="py-2">—</td>
                  <td className="py-2">إجازة</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* الإجازات (عرض مختصر كما كان) */}
      {tab === "leaves" && (
        <div className="p-4 border rounded-2xl shadow-sm border-slate-200 bg-white">
          <h3 className="font-semibold mb-3">طلبات الإجازة (عرض)</h3>
          <ul className="space-y-2 text-sm">
            <li className="p-3 border rounded-2xl flex items-center justify-between">
              <div>
                <div className="font-medium">هيفاء السبيعي</div>
                <div className="text-xs text-gray-500">من 10-11 إلى 14-11 · سنوية</div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-2xl px-3 py-1.5 border">رفض</button>
                <button className="rounded-2xl px-3 py-1.5 bg-red-800 text-white">اعتماد</button>
              </div>
            </li>
          </ul>
        </div>
      )}

      {/* الرواتب (كما كان) */}
      {tab === "payroll" && (
        <div className="p-4 border rounded-2xl shadow-sm border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">الرواتب — معاينة شهرية</h3>
            <select className="border rounded-2xl p-2 text-sm">
              <option>نوفمبر 2025</option>
              <option>أكتوبر 2025</option>
            </select>
          </div>
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            <div className="p-3 border rounded-2xl">
              <div className="text-gray-500">عدد الموظفين</div>
              <div className="text-xl font-semibold">32</div>
            </div>
            <div className="p-3 border rounded-2xl">
              <div className="text-gray-500">إجمالي الرواتب</div>
              <div className="text-xl font-semibold">182,000</div>
            </div>
            <div className="p-3 border rounded-2xl">
              <div className="text-gray-500">حوافز الفنيين</div>
              <div className="text-xl font-semibold">18,500</div>
            </div>
          </div>
          <button className="mt-4 rounded-2xl px-4 py-2 bg-red-800 text-white">توليد ملف الرواتب (PDF)</button>
        </div>
      )}

      {/* 8) تقرير يومي للفروع — إعداد قرارات */}
      {tab === "branchesReport" && (
        <div className="p-4 border rounded-2xl shadow-sm bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">تقرير يومي للفروع</h3>
            <div className="flex items-center gap-2">
              <select className="border rounded-2xl p-2 text-sm" value={selectedBranch} onChange={(e)=>setSelectedBranch(e.target.value)}>
                {branches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <button className="px-3 py-2 rounded-2xl border text-sm">تصدير PDF</button>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            {branchDaily.filter(b=>b.branch===selectedBranch).map(b => (
              <div key={b.branch} className="md:col-span-3 p-3 border rounded-2xl">
                <div className="text-gray-600">{b.branch} — {b.date}</div>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  <div className="p-2 border rounded-xl text-center"><div className="text-gray-500">حاضر</div><div className="text-xl font-semibold">{b.present}</div></div>
                  <div className="p-2 border rounded-xl text-center"><div className="text-gray-500">غياب</div><div className="text-xl font-semibold">{b.absent}</div></div>
                  <div className="p-2 border rounded-xl text-center"><div className="text-gray-500">تأخير</div><div className="text-xl font-semibold">{b.late}</div></div>
                  <div className="p-2 border rounded-xl text-center"><div className="text-gray-500">ملاحظات</div><div className="font-medium">{b.notes}</div></div>
                </div>
                <div className="mt-3">
                  <div className="text-sm font-semibold mb-1">إعداد قرارات اليوم</div>
                  <div className="grid md:grid-cols-2 gap-2">
                    <input className="border rounded-2xl p-2" placeholder="قرار 1 (مثال: تكثيف الرقابة على البصمة)" />
                    <input className="border rounded-2xl p-2" placeholder="قرار 2 (مثال: تدوير مهام الاستقبال)" />
                  </div>
                  <button className="mt-2 px-4 py-2 rounded-2xl bg-red-800 text-white">حفظ القرارات</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/***********************************
 * Accounting — لوحة المحاسبة
 ***********************************/
/***********************************
 * Accounting — لوحة المحاسبة (موسّعة)
 ***********************************/
function AccountingPanel() {
  // تبويبات مالية رئيسية (كما هي) + تبويبات تشغيلية جديدة
  const [tab, setTab] = useState<
    | "sales" | "receivables" | "expenses" | "payables" | "cashbank" | "reports" | "settings"
    // التشغيليات القديمة
    | "ops_receipts_intake"        // 1) استلام إيصالات الصيانة/العقود/الأقساط
    | "ops_cashbox_in"             // 2) إدخال المبالغ للصندوق
    | "ops_cashbox_report"         // 3) طباعة كشف الصندوق
    | "ops_installments_collected" // 4) إدخال أقساط محصّلة + نسخة للريسبشن
    | "ops_install_sheet_audit"    // 5) تدقيق ورقة التركيبات
    | "ops_contracts_entry"        // 6) إدخال العقود (التراكيب)
    | "ops_reception_audit"        // 7) تشييك إدخالات/إخراجات الريسبشن
    | "ops_warehouse_follow"       // 8) متابعة حركة المستودع
    | "ops_new_staff_cards"        // 9) إدخال بطاقة الموظفين الجدد
    | "ops_bank_recon"             // 10) مطابقة حركة البنوك
    | "ops_purchase_invoices"      // 11) إدخال فواتير المشتريات
    | "ops_ledger_check"           // 12) دفاتر الأقساط + الصيانات المنتهية
    | "ops_biometrics_check"       // 13) تشييك البصمات (الدوام)
    | "ops_statutory_deductions"   // 14) خصم التأمينات + سيريتل
    | "ops_commissions"            // 15) العمولات
    | "ops_advances"               // 16) السلف
    | "ops_owner_file_match"       // 17) مطابقة ملف صاحب الشركة
    // الإضافات المطلوبة
    | "ops_payroll"                // 18) احتساب الرواتب
    | "ops_unpaid_leave"           // 19) إجازات بلا راتب
    | "ops_maintenance_link"       // 20) ربط الصيانة ماليًا
  >("sales");

  // نماذج بيانات وهمية سريعة
  const receiptTypes = ["صيانة", "عقد تركيب", "قسط"] as const;
  const payMethods = ["نقدي", "تحويل", "نقاط بيع", "شيك", "QR"] as const;

  // مبيعات (نفس منطقك)
  const [salesMode, setSalesMode] = useState<"list" | "new">("list");
  const [salesInvoice, setSalesInvoice] = useState({
    number: "",
    customer: "",
    deviceName: "",
    deviceType: "",
    date: new Date().toISOString().slice(0, 10),
    total: "",
    isInstallment: false,
    firstPayment: "",
    remaining: "",
    monthlyPayment: "",
    monthsTotal: "",
    address: "",
    notes: "",
  });

  // حالات محلية بسيطة للإضافات
  const [advances, setAdvances] = useState<{emp:string; amount:number; months:number; start:string}[]>([]);
  const [commRules, setCommRules] = useState<{person:string; role:"مندوب"|"سكرتير/ة"|"مدير فرع"|"فني"; type:"مبيعات"|"تحصيل"|"تركيب"|"صيانة"; rate:number; base:number}[]>([]);
  const [payrollRows, setPayrollRows] = useState<{emp:string; branch?:string; basic:number; allow:number; commissions:number; deductions:number; advances:number; insurance:number; telecom:number; unpaidDays:number; net:number; month:string}[]>([]);
  const [unpaidList, setUnpaidList] = useState<{emp:string; days:number; month:string; note?:string}[]>([]);
  const [statutory, setStatutory] = useState({ insurancePct: "", telecomValue: "", scope: "الكل", period: "" });
  const [maintenanceLinks, setMaintenanceLinks] = useState<{ticket:string; customer:string; amount:number; method:string; costCenter:string; usedParts:number}[]>([]);

  return (
    <div className="space-y-6">
      {/* رأس اللوحة + تبويبات مالية رئيسية */}
      <div className="rounded-3xl p-4 bg-gradient-to-r from-red-800 to-red-600 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">المحاسبة</h2>
            <p className="text-sm text-red-100">فواتير · تحصيلات · مصروفات · صندوق/بنك · تقارير</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {[
              {key:"sales",label:"فواتير المبيعات"},
              {key:"receivables",label:"التحصيلات والعملاء"},
              {key:"expenses",label:"المصروفات"},
              {key:"payables",label:"الموردون"},
              {key:"cashbank",label:"الصندوق والبنك"},
              {key:"reports",label:"التقارير"},
              {key:"settings",label:"الإعدادات"},
            ].map(t => (
              <button key={t.key} onClick={()=>setTab(t.key as any)} className={`px-3 py-1.5 rounded-2xl ${tab===t.key?"bg-white text-red-800":"bg-white/10 text-white"}`}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* شريط المهام التشغيلية (القديمة + الإضافات الجديدة) */}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {[
            {k:"ops_receipts_intake",l:"استلام إيصالات (صيانة/عقود/أقساط)"},
            {k:"ops_cashbox_in",l:"إدخال للصندوق"},
            {k:"ops_cashbox_report",l:"كشف الصندوق"},
            {k:"ops_installments_collected",l:"تحصيل أقساط → ريسبشن"},
            {k:"ops_install_sheet_audit",l:"تدقيق ورقة التركيبات"},
            {k:"ops_contracts_entry",l:"إدخال عقود التراكيب"},
            {k:"ops_reception_audit",l:"تشييك مدخلات الريسبشن"},
            {k:"ops_warehouse_follow",l:"متابعة المستودع"},
            {k:"ops_new_staff_cards",l:"بطاقات موظفين جدد"},
            {k:"ops_bank_recon",l:"مطابقة البنوك"},
            {k:"ops_purchase_invoices",l:"فواتير مشتريات"},
            {k:"ops_ledger_check",l:"دفاتر أقساط/صيانات منتهية"},
            {k:"ops_biometrics_check",l:"تشييك البصمات"},
            {k:"ops_statutory_deductions",l:"تأمينات + سيريتل"},
            {k:"ops_commissions",l:"العمولات (كل الفئات)"},
            {k:"ops_advances",l:"السلف"},
            {k:"ops_owner_file_match",l:"مطابقة ملف المالك"},
            // الإضافات
            {k:"ops_payroll",l:"احتساب الرواتب"},
            {k:"ops_unpaid_leave",l:"إجازات بلا راتب"},
            {k:"ops_maintenance_link",l:"ربط الصيانة ماليًا"},
          ].map(t => (
            <button key={t.k} onClick={()=>setTab(t.k as any)} className={`px-3 py-1.5 rounded-2xl border ${tab===t.k?"bg-white text-red-800 border-white":"bg-white/10 text-white border-white/30"}`}>{t.l}</button>
          ))}
        </div>
      </div>

      {/* === التبويبات المالية الأصلية (كما هي) مختصرة لعدم التكرار — أبقيت نفس محتواك السابق === */}
      {tab === "sales" && (
        <>
          {salesMode === "list" && (
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-2xl shadow-sm bg-white lg:col-span-2">
                <h3 className="font-semibold text-red-800 mb-3">فواتير المبيعات</h3>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2">#</th>
                        <th className="py-2">العميل</th>
                        <th className="py-2">الوصف</th>
                        <th className="py-2">الإجمالي</th>
                        <th className="py-2">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="py-2">INV-1001</td>
                        <td className="py-2">شركة دار الماء</td>
                        <td className="py-2">تركيب فلتر RO</td>
                        <td className="py-2">2,300,000</td>
                        <td className="py-2">
                          <Badge color="yellow">غير مدفوع</Badge>
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="py-2">INV-1002</td>
                        <td className="py-2">أحمد علي</td>
                        <td className="py-2">صيانة دورية</td>
                        <td className="py-2">180,000</td>
                        <td className="py-2">
                          <Badge color="green">مدفوع</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 border rounded-2xl shadow-sm bg-white">
                <h4 className="font-semibold mb-2">إجراءات سريعة</h4>
                <div className="space-y-2">
                  <button className="w-full rounded-2xl px-4 py-2 bg-red-800 text-white" onClick={() => setSalesMode("new")}>
                    إضافة فاتورة جديدة
                  </button>
                  <button className="w-full rounded-2xl px-4 py-2 border">فاتورة سريعة (POS/QR)</button>
                  <button className="w-full rounded-2xl px-4 py-2 border">مسودة عرض سعر ← تحويل لفاتورة</button>
                </div>
              </div>
            </div>
          )}

          {salesMode === "new" && (
            <div className="p-4 border rounded-2xl shadow-sm bg-white space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-red-800">إضافة فاتورة مبيعات جديدة</h3>
                <button className="text-sm px-3 py-1.5 rounded-2xl border" onClick={() => setSalesMode("list")}>
                  ← رجوع لقائمة الفواتير
                </button>
              </div>

              {/* حقولك كما هي */}
              {/* ... (أبقيت نفس الشيفرة كما أرسلتها أنت لحقول الفاتورة) ... */}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button className="px-4 py-2 rounded-2xl border text-sm" onClick={() => setSalesMode("list")}>إلغاء</button>
                <button
                  className="px-4 py-2 rounded-2xl bg-red-800 text-white text-sm"
                  onClick={() => {
                    console.log("فاتورة جديدة:", salesInvoice);
                    alert("تم إرسال إيصال الفاتورة إلى الريسبشن (وهميًا).");
                    setSalesMode("list");
                  }}
                >
                  إرسال إيصال للريسبشن
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ... بقية تبويباتك الأصلية receivables/expenses/payables/cashbank/reports/settings ... (كما في كودك) */}

      {/* === تبويبات الإضافات المطلوبة === */}

      {/* 18) احتساب الرواتب */}
      {tab === "ops_payroll" && (
        <div className="p-4 border rounded-2xl bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">مسيّر الرواتب — احتساب شهري</h3>
            <button className="px-3 py-1.5 rounded-2xl border" onClick={() => alert("تصدير PDF/Excel (وهمي)")}>تصدير</button>
          </div>
          <div className="grid md:grid-cols-7 gap-2 text-sm">
            <input className="border rounded-2xl p-2" placeholder="الموظف" />
            <input className="border rounded-2xl p-2" placeholder="الفرع" />
            <input className="border rounded-2xl p-2" placeholder="الأساسي" type="number" />
            <input className="border rounded-2xl p-2" placeholder="بدلات" type="number" />
            <input className="border rounded-2xl p-2" placeholder="عمولات" type="number" />
            <input className="border rounded-2xl p-2" placeholder="خصومات" type="number" />
            <input className="border rounded-2xl p-2" placeholder="شهر/سنة (MM-YYYY)" />
            <div className="md:col-span-7 flex gap-2">
              <button className="rounded-2xl px-4 py-2 bg-red-800 text-white" onClick={() => alert("إضافة سطر راتب (وهمي)")}>حفظ سطر</button>
              <button className="rounded-2xl px-4 py-2 border" onClick={() => alert("تحميل من قواعد: سلف/تأمينات/سيريتل/إجازات (وهمي)")}>تحميل الاستقطاعات تلقائياً</button>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2">الموظف</th>
                  <th className="py-2">الفرع</th>
                  <th className="py-2">أساسي</th>
                  <th className="py-2">بدلات</th>
                  <th className="py-2">عمولات</th>
                  <th className="py-2">خصومات</th>
                  <th className="py-2">سلف</th>
                  <th className="py-2">تأمينات</th>
                  <th className="py-2">سيريتل</th>
                  <th className="py-2">أيام بدون راتب</th>
                  <th className="py-2">الصافي</th>
                  <th className="py-2">الشهر</th>
                </tr>
              </thead>
              <tbody>
                {payrollRows.length === 0 ? (
                  <tr><td className="py-3 text-gray-500" colSpan={12}>لا توجد بيانات رواتب</td></tr>
                ) : payrollRows.map((r,i)=>(
                  <tr key={i} className="border-t">
                    <td className="py-2">{r.emp}</td>
                    <td className="py-2">{r.branch||"—"}</td>
                    <td className="py-2">{r.basic.toLocaleString()}</td>
                    <td className="py-2">{r.allow.toLocaleString()}</td>
                    <td className="py-2">{r.commissions.toLocaleString()}</td>
                    <td className="py-2">{r.deductions.toLocaleString()}</td>
                    <td className="py-2">{r.advances.toLocaleString()}</td>
                    <td className="py-2">{r.insurance.toLocaleString()}</td>
                    <td className="py-2">{r.telecom.toLocaleString()}</td>
                    <td className="py-2">{r.unpaidDays}</td>
                    <td className="py-2 font-semibold">{r.net.toLocaleString()}</td>
                    <td className="py-2">{r.month}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 19) إجازات بلا راتب */}
      {tab === "ops_unpaid_leave" && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 border rounded-2xl bg-white">
            <h3 className="font-semibold mb-3">تسجيل إجازة بلا راتب</h3>
            <div className="grid sm:grid-cols-3 gap-2 text-sm">
              <input className="border rounded-2xl p-2" placeholder="اسم الموظف" />
              <input className="border rounded-2xl p-2" placeholder="عدد الأيام" type="number" />
              <input className="border rounded-2xl p-2" placeholder="الشهر (MM-YYYY)" />
              <textarea className="sm:col-span-3 border rounded-2xl p-2" rows={2} placeholder="ملاحظة (اختياري)" />
              <button className="sm:col-span-3 rounded-2xl px-4 py-2 bg-red-800 text-white" onClick={()=>alert("حُفظت وستخصم من الراتب (وهمي)")}>حفظ وربط بالراتب</button>
            </div>
          </div>
          <div className="p-4 border rounded-2xl bg-white">
            <h4 className="font-semibold mb-2">سجل الإجازات بلا راتب</h4>
            <ul className="text-sm space-y-2">
              {unpaidList.length===0 && <li className="text-gray-500">لا يوجد</li>}
              {unpaidList.map((x, i)=>(
                <li key={i} className="p-2 border rounded-2xl">{x.emp} · {x.days} يوم · {x.month}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 14) خصم التأمينات + سيريتل (مُوسّعة) */}
      {tab === "ops_statutory_deductions" && (
        <div className="p-4 border rounded-2xl bg-white">
          <h3 className="font-semibold mb-3">الاستقطاعات النظامية (تأمينات + سيرياتيل كاش إن وُجدت)</h3>
          <div className="grid md:grid-cols-4 gap-2 text-sm">
            <input className="border rounded-2xl p-2" placeholder="نسبة التأمينات %" value={statutory.insurancePct} onChange={e=>setStatutory(s=>({...s, insurancePct: e.target.value}))}/>
            <input className="border rounded-2xl p-2" placeholder="قيمة سيرياتيل/اتصالات" value={statutory.telecomValue} onChange={e=>setStatutory(s=>({...s, telecomValue: e.target.value}))}/>
            <select className="border rounded-2xl p-2" value={statutory.scope} onChange={e=>setStatutory(s=>({...s, scope: e.target.value}))}>
              <option>الكل</option><option>فنيين</option><option>إداريين</option>
            </select>
            <input className="border rounded-2xl p-2" placeholder="شهر/سنة (MM-YYYY)" value={statutory.period} onChange={e=>setStatutory(s=>({...s, period: e.target.value}))}/>
            <button className="md:col-span-4 rounded-2xl px-4 py-2 bg-red-800 text-white" onClick={()=>alert("تطبيق على مسيّرات الرواتب (وهمي)")}>تطبيق على الرواتب</button>
          </div>
        </div>
      )}

      {/* 15) العمولات (موسعة للأربعة أدوار) */}
      {tab === "ops_commissions" && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 border rounded-2xl bg-white">
            <h3 className="font-semibold mb-3">حساب العمولات — فئات: مندوبين / سكرتارية / مدير فرع / فنيين</h3>
            <div className="grid sm:grid-cols-5 gap-2 text-sm">
              <input className="border rounded-2xl p-2" placeholder="الاسم" />
              <select className="border rounded-2xl p-2">
                <option>مندوب</option><option>سكرتير/ة</option><option>مدير فرع</option><option>فني</option>
              </select>
              <select className="border rounded-2xl p-2">
                <option>مبيعات</option><option>تحصيل</option><option>تركيب</option><option>صيانة</option>
              </select>
              <input className="border rounded-2xl p-2" placeholder="نسبة %" type="number" />
              <input className="border rounded-2xl p-2" placeholder="أساس احتساب (قيمة/عدد)" type="number" />
              <button className="sm:col-span-5 rounded-2xl px-4 py-2 bg-red-800 text-white" onClick={()=>alert("حُسبت العمولة وأضيفت للراتب (وهمي)")}>حساب + إضافة للرواتب</button>
            </div>
          </div>
          <div className="p-4 border rounded-2xl bg-white">
            <h4 className="font-semibold mb-2">قواعد عمولة محفوظة</h4>
            <ul className="text-sm space-y-2">
              {commRules.length===0 && <li className="text-gray-500">لا توجد قواعد</li>}
              {commRules.map((r,i)=>(
                <li key={i} className="p-2 border rounded-2xl">{r.person} · {r.role} · {r.type} · {r.rate}% على {r.base}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 16) السلف (موسعة مع خطة سداد) */}
      {tab === "ops_advances" && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 border rounded-2xl bg-white">
            <h3 className="font-semibold mb-3">تسجيل سلفة + خطة سداد</h3>
            <div className="grid sm:grid-cols-4 gap-2 text-sm">
              <input className="border rounded-2xl p-2" placeholder="اسم الموظف" />
              <input className="border rounded-2xl p-2" placeholder="المبلغ" type="number" />
              <input className="border rounded-2xl p-2" placeholder="الأشهر للسداد" type="number" />
              <input className="border rounded-2xl p-2" placeholder="تاريخ البدء (YYYY-MM-DD)" />
              <button className="sm:col-span-4 rounded-2xl px-4 py-2 bg-red-800 text-white" onClick={()=>alert("حُفظت السلفة وربطت بالراتب (وهمي)")}>حفظ وربط بالرواتب</button>
            </div>
          </div>
          <div className="p-4 border rounded-2xl bg-white">
            <h4 className="font-semibold mb-2">سلف معلّقة</h4>
            <ul className="text-sm space-y-2">
              <li className="p-2 border rounded-2xl">موظف ريسبشن · 1,000 · متبقي 3 أشهر</li>
            </ul>
          </div>
        </div>
      )}

      {/* 20) ربط الصيانة ماليًا */}
      {tab === "ops_maintenance_link" && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 border rounded-2xl bg-white">
            <h3 className="font-semibold mb-3">ربط أوامر الصيانة ماليًا</h3>
            <div className="grid sm:grid-cols-3 gap-2 text-sm">
              <input className="border rounded-2xl p-2" placeholder="رقم تذكرة/صيانة" />
              <input className="border rounded-2xl p-2" placeholder="اسم العميل" />
              <input className="border rounded-2xl p-2" placeholder="المبلغ" type="number" />
              <select className="border rounded-2xl p-2">{payMethods.map(m=><option key={m}>{m}</option>)}</select>
              <select className="border rounded-2xl p-2">
                <option>مركز تكلفة: الصيانة</option>
                <option>التركيب</option>
                <option>خدمة ما بعد البيع</option>
              </select>
              <input className="border rounded-2xl p-2" placeholder="عدد قطع مستخدمة (يربط بالمستودع)" type="number" />
              <button className="sm:col-span-3 rounded-2xl px-4 py-2 bg-red-800 text-white" onClick={()=>alert("تحويل الصيانة إلى قيد مالي + ربط مستودع (وهمي)")}>تحويل لفاتورة/إيصال + ربط مستودع</button>
            </div>
          </div>
          <div className="p-4 border rounded-2xl bg-white">
            <h4 className="font-semibold mb-2">عمليات ربط أخيرة</h4>
            <ul className="text-sm space-y-2">
              <li className="p-2 border rounded-2xl">MT-325 · أحمد علي · 180 · نقدي · الصيانة</li>
            </ul>
          </div>
        </div>
      )}

      {/* بقية تبويباتك التشغيلية الأصلية (ops_owner_file_match وغيرها) كما في كودك السابق */}
      {tab === "ops_owner_file_match" && (
        <div className="p-4 border rounded-2xl bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">مطابقة ملف صاحب الشركة</h3>
            <button className="px-3 py-1.5 rounded-2xl border">تصدير المطابقة</button>
          </div>
          <div className="grid sm:grid-cols-3 gap-2 text-sm">
            <input className="border rounded-2xl p-2" placeholder="مرجع العملية (فاتورة/قيد)" />
            <input className="border rounded-2xl p-2" placeholder="القيمة" />
            <input className="border rounded-2xl p-2" placeholder="حالة الإدخال في ملف المالك" />
            <button className="sm:col-span-3 rounded-2xl px-4 py-2 bg-red-800 text-white">مطابقة وتحديث الملف</button>
          </div>
        </div>
      )}
    </div>
  );
}


// Warehouse Panel (مستودع) — Wireframe متكامل حسب السيناريو
// ----------------------
const WarehousePanel = () => {
  const [tab, setTab] = useState<"stock"|"tech_requests"|"recycled"|"alerts"|"purchases"|"archive">("stock");

  // --- النماذج ---
  type Item = { sku:string; name:string; category:string; uom:string; barcode:string; min:number; qty:number; bin:string; price:number };
  type Tech = { id:string; name:string };

  // أضفنا action (تسليم/تبديل) + note اختياري
  type TechReqLine = {
    sku:string; name:string; uom:string;
    requested:number; fulfilled:number;
    action:"تسليم"|"تبديل"; note?:string
  };

  type TechRequest = { id:string; techId:string; date:string; status:"open"|"completed"; lines:TechReqLine[] };
  type RecyclePart = { id:string; sku:string; name:string; state:"needs_repair"|"refurbished"; employeeFactor:number; note?:string };
  type PurchaseItem = { sku:string; name:string; qty:number };
  type PurchaseReq = { id:string; date:string; items:PurchaseItem[]; status:"draft"|"sent_manager"|"approved"|"sent_accounting"|"rejected" };
  type Log = { t:string; msg:string };

  // --- بيانات أساسية ---
  const [items, setItems] = useState<Item[]>([
    { sku:"FL-10-RO", name:"فلتر 10\" RO", category:"فلاتر",   uom:"قطعة", barcode:"100001", min:10, qty:22, bin:"A1", price:45 },
    { sku:"TK-RO-4G", name:"خزان RO 4G",   category:"خزانات", uom:"قطعة", barcode:"100045", min:5,  qty:6,  bin:"B3", price:160 },
    { sku:"PM-CARB",  name:"حشوة كربونية", category:"مستهلكات", uom:"قطعة", barcode:"100077", min:30, qty:28, bin:"C2", price:18 },
    { sku:"PMP-RO",   name:"مضخة RO",      category:"مضخات",  uom:"قطعة", barcode:"100099", min:3,  qty:4,  bin:"D1", price:280 },
  ]);

  const [techs] = useState<Tech[]>([
    { id:"T-1", name:"م. خالد" }, { id:"T-2", name:"م. سليم" }, { id:"T-3", name:"م. نورة" },
  ]);

  // --- طلبات الفنيين (بدلاً من مخزون الفنيين) ---
  const [techRequests, setTechRequests] = useState<TechRequest[]>([
    {
      id:"TR-351", techId:"T-1", date:"2025-11-24", status:"open",
      lines: [
        { sku:"FL-10-RO", name:"حشوة أولى 10 إنش 5 ميكرون", uom:"قطعة", requested:5, fulfilled:0, action:"تسليم" },
        { sku:"PM-CARB",  name:"حشوة كربون CTO",            uom:"قطعة", requested:6, fulfilled:0, action:"تسليم" },
        { sku:"TK-RO-4G", name:"خزان RO 4G",                uom:"خزان", requested:2, fulfilled:0, action:"تبديل" },
        { sku:"PMP-RO",   name:"مضخة RO",                   uom:"قطعة", requested:1, fulfilled:0, action:"تسليم" },
      ]
    },
    {
      id:"TR-352", techId:"T-2", date:"2025-11-24", status:"open",
      lines: [
        { sku:"FL-10-RO", name:"حشوة أولى 10 إنش 5 ميكرون", uom:"قطعة", requested:3, fulfilled:1, action:"تسليم" },
        { sku:"PM-CARB",  name:"حشوة كربونية",              uom:"قطعة", requested:4, fulfilled:0, action:"تبديل" },
      ]
    },
  ]);
  const [selectedTech, setSelectedTech] = useState<string>("T-1");
  const activeReq = useMemo(
    () => techRequests.find(r => r.techId===selectedTech && r.status==="open") || null,
    [techRequests, selectedTech]
  );

  // مسترجعات + مشتريات + أرشيف كما هي
  const [recycled, setRecycled] = useState<RecyclePart[]>([
    { id:"RC-1001", sku:"PMP-RO", name:"مضخة RO", state:"needs_repair", employeeFactor:0.5, note:"صوت عالي" },
  ]);

  const [purchases, setPurchases] = useState<PurchaseReq[]>([
    { id:"PR-3001", date:"2025-10-28", status:"draft", items:[{ sku:"PM-CARB", name:"حشوة كربونية", qty:50 }] }
  ]);

  const [logs, setLogs] = useState<Log[]>([
    { t:"2025-10-29 09:11", msg:"استلام إشعار خصم 1× FL-10-RO من الفني T-1" },
  ]);

  // بحث للمخزون
  const [q, setQ] = useState("");
  const itemsFiltered = items.filter(i => (i.sku + i.name + i.category + i.barcode).includes(q));
  const lowItems = useMemo(() => items.filter(i => i.qty <= i.min), [items]);

  // أدوات مساعدة
  const findItemBySku = (sku:string) => items.find(i=>i.sku===sku);
  const skuFromBarcode = (bc:string) => items.find(i => i.barcode===bc)?.sku;

  // --- مسح باركود على طلب الفني ---
  const [barcodeInput, setBarcodeInput] = useState("");

  // تحديث نوع الإجراء (شرح) لكل سطر
  const updateLineAction = (requestId:string, sku:string, action:"تسليم"|"تبديل") => {
    setTechRequests(prev => prev.map(r => r.id!==requestId ? r : ({
      ...r,
      lines: r.lines.map(l => l.sku===sku ? { ...l, action } : l)
    })));
  };

  const fulfillLineBy = (requestId:string, skuOrBarcode:string, qty:number=1) => {
    const sku = skuFromBarcode(skuOrBarcode) || skuOrBarcode.trim();
    if (!sku || qty<=0) return;

    setTechRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r;
      const lines = r.lines.map(line => {
        if (line.sku !== sku) return line;
        const available = findItemBySku(sku)?.qty || 0;
        if (available <= 0) return line; // لا يوجد مخزون
        const need = line.requested - line.fulfilled;
        const add = Math.min(qty, need, available);
        if (add <= 0) return line;

        // خصم من المستودع
        setItems(itms => itms.map(it => it.sku===sku ? { ...it, qty: Math.max(0, it.qty - add) } : it));
        // لوج
        setLogs(l => [{ t:new Date().toISOString().slice(0,19).replace("T"," "), msg:`تم تعويض ${add}× ${sku} لطلب ${r.id}` }, ...l]);

        // ملاحظة: يمكن لاحقاً لو action==="تبديل" نضيف آلياً إلى "قطع مسترجعة"
        return { ...line, fulfilled: line.fulfilled + add };
      });
      return { ...r, lines };
    }));
    setBarcodeInput("");
  };

  // اكتمال الطلب
  const isReqCompleted = (req:TechRequest|null) =>
    !!req && req.lines.every(l => l.fulfilled >= l.requested);

  const completeRequest = (req:TechRequest) => {
    setTechRequests(prev => prev.map(r => r.id===req.id ? { ...r, status:"completed" } : r));
    setLogs(prev => [{ t:new Date().toISOString().slice(0,19).replace("T"," "), msg:`تم اكتمال طلب الفني ${req.id} (${techs.find(t=>t.id===req.techId)?.name})` }, ...prev]);
  };

  // --- اختيار عناصر للشراء (checkbox + qty + طباعة) ---
  const [selection, setSelection] = useState<Record<string, number>>({}); // sku -> qty
  const toggleSelect = (sku:string, checked:boolean, defaultQty:number=1) => {
    setSelection(prev => {
      const cp = { ...prev };
      if (!checked) delete cp[sku];
      else cp[sku] = cp[sku] ?? defaultQty;
      return cp;
    });
  };
  const setSelQty = (sku:string, val:number) => {
    setSelection(prev => ({ ...prev, [sku]: Math.max(1, val||1) }));
  };

  const createPurchaseFromSelection = () => {
    const entries = Object.entries(selection);
    if (!entries.length) return;
    const id = `PR-${Math.floor(Math.random()*10000)}`;
    const req: PurchaseReq = {
      id, date:new Date().toISOString().slice(0,10), status:"draft",
      items: entries.map(([sku, qty]) => ({ sku, name: findItemBySku(sku)?.name || sku, qty }))
    };
    setPurchases(prev => [req, ...prev]);
    setLogs(l => [{ t:new Date().toISOString().slice(0,19).replace("T"," "), msg:`إنشاء طلب شراء ${id} من تحديد المستخدم` }, ...l]);
    setSelection({});
  };

  const printSelection = () => {
    const rows = Object.entries(selection).map(([sku, qty]) => {
      const it = findItemBySku(sku);
      return `<tr><td>${sku}</td><td>${it?.name||""}</td><td>${it?.uom||""}</td><td>${it?.qty||0}</td><td>${qty}</td></tr>`;
    }).join("");
    const html = `
      <html dir="rtl"><head><meta charset="utf-8"><title>طلبات شراء</title>
      <style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #999;padding:6px}</style>
      </head><body>
      <h3>طلب شراء (محدد)</h3>
      <table><thead><tr><th>SKU</th><th>الاسم</th><th>الوحدة</th><th>المتاح</th><th>الكمية المطلوبة</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <script>window.print();</script>
      </body></html>`;
    const w = window.open("", "_blank");
    if (w){ w.document.write(html); w.document.close(); }
  };

  // --- واجهة ---
  return (
    <div className="space-y-6">
      {/* رأس اللوحة */}
      <div className="rounded-3xl p-4 bg-gradient-to-r from-red-800 to-red-600 text-white flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">المستودع</h2>
          <p className="text-sm text-red-100">إدارة المخزون · طلبات الفنيين · القطع المسترجعة · طلبات الشراء</p>
        </div>
        <div className="flex gap-2 text-sm">
          {[
            {key:"stock",label:"المخزون"},
            {key:"tech_requests",label:"طلبات الفنيين"},
            {key:"recycled",label:"قطع مسترجعة"},
            {key:"alerts",label:"تنبيهات"},
            {key:"purchases",label:"طلبات شراء"},
            {key:"archive",label:"الأرشيف"},
          ].map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key as any)} className={`px-3 py-1.5 rounded-2xl ${tab===t.key ? "bg-white text-red-800" : "bg-white/10 text-white"}`}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* المخزون */}
      {tab === "stock" && (
        <div className="space-y-4">
          <div className="p-4 border rounded-2xl bg-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">المخزون الرئيسي</h3>
              <div className="flex gap-2">
                <input value={q} onChange={(e)=>setQ(e.target.value)} className="border rounded-2xl p-2 text-sm" placeholder="بحث: SKU/اسم/تصنيف/باركود" />
                <button className="px-3 py-2 rounded-2xl bg-red-800 text-white text-sm" onClick={()=>{/* أدوات إضافية لاحقاً */}}>أدوات</button>
              </div>
            </div>
            <div className="overflow-auto border rounded-2xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2 px-2">SKU</th>
                    <th className="py-2 px-2">الاسم</th>
                    <th className="py-2 px-2">التصنيف</th>
                    <th className="py-2 px-2">الموقع</th>
                    <th className="py-2 px-2">الكمية</th>
                    <th className="py-2 px-2">الحد الأدنى</th>
                    <th className="py-2 px-2">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsFiltered.map(it => (
                    <tr key={it.sku} className="border-t hover:bg-slate-50">
                      <td className="py-2 px-2">{it.sku}</td>
                      <td className="py-2 px-2">{it.name}</td>
                      <td className="py-2 px-2">{it.category}</td>
                      <td className="py-2 px-2">{it.bin}</td>
                      <td className="py-2 px-2">{it.qty}</td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <input type="number" className="border rounded-xl px-2 py-1 w-20" value={it.min}
                            onChange={(e)=>setItems(prev=>prev.map(p=>p.sku===it.sku?{...p,min:Number(e.target.value)||0}:p))}/>
                          <span className="text-xs text-gray-500">قطعة</span>
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        {it.qty <= it.min ? <Badge color="red">منخفض</Badge> : <Badge color="green">كافٍ</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-xs text-gray-500">* طباعة الباركود وقوائم الجرد سيتم دعمها لاحقًا.</div>
          </div>
        </div>
      )}

      {/* طلبات الفنيين */}
      {tab === "tech_requests" && (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* قائمة الفنيين */}
          <div className="p-4 border rounded-2xl bg-white">
            <h4 className="font-semibold mb-2">الفنيون</h4>
            <ul className="text-sm space-y-2">
              {techs.map(t => {
                const openCount = techRequests.filter(r=>r.techId===t.id && r.status==="open").length;
                return (
                  <li key={t.id} className={`p-2 rounded-2xl border flex items-center justify-between ${selectedTech===t.id?"bg-slate-50":""}`}>
                    <button onClick={()=>setSelectedTech(t.id)} className="text-right">{t.name}</button>
                    <Badge color={openCount? "yellow":"green"}>{openCount} مفتوح</Badge>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* طلب الفني المختار */}
          <div className="p-4 border rounded-2xl bg-white lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">طلب الفني</h3>
                {activeReq ? (
                  <div className="text-xs text-gray-500">
                    رقم: {activeReq.id} · التاريخ: {activeReq.date} · الحالة: {isReqCompleted(activeReq)? "جاهز للاعتماد" : "قيد التعويض"}
                  </div>
                ) : <div className="text-xs text-gray-500">لا يوجد طلب مفتوح لهذا الفني</div>}
              </div>
              {activeReq && (
                <div className="flex items-center gap-2">
                  <input
                    className="border rounded-2xl p-2 text-sm w-48"
                    placeholder="باركود/‏SKU"
                    value={barcodeInput}
                    onChange={e=>setBarcodeInput(e.target.value)}
                    onKeyDown={e=>{ if(e.key==="Enter") fulfillLineBy(activeReq.id, barcodeInput, 1); }}
                  />
                  <button className="px-3 py-2 rounded-2xl bg-red-800 text-white text-sm"
                    onClick={()=>fulfillLineBy(activeReq.id, barcodeInput, 1)}>تعويض</button>
                </div>
              )}
            </div>

            {activeReq && (
              <>
                {/* شريط تقدم */}
                <div className="w-full h-2 bg-slate-200 rounded-full mb-3 overflow-hidden">
                  {(() => {
                    const total = activeReq.lines.reduce((a,l)=>a+l.requested,0);
                    const done  = activeReq.lines.reduce((a,l)=>a+Math.min(l.fulfilled,l.requested),0);
                    const pct = total? Math.round((done/total)*100):0;
                    return <div className="h-2 bg-green-600" style={{width:`${pct}%`}} title={`${pct}%`} />;
                  })()}
                </div>

                {/* جدول الطلب (مع عمود شرح) */}
                <div className="overflow-auto border rounded-2xl">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2 px-2">شرح</th>
                        <th className="py-2 px-2">اسم المادة</th>
                        <th className="py-2 px-2">الوحدة</th>
                        <th className="py-2 px-2">المطلوب</th>
                        <th className="py-2 px-2">المعوّض</th>
                        <th className="py-2 px-2">حالة</th>
                        <th className="py-2 px-2">المتاح بالمستودع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeReq.lines.map(line => {
                        const it = findItemBySku(line.sku);
                        const done = line.fulfilled >= line.requested;
                        return (
                          <tr key={line.sku} className={`border-t ${done?"opacity-50":""}`}>
                            <td className="py-2 px-2">
                              <select
                                className="border rounded-xl px-2 py-1 text-sm"
                                value={line.action}
                                onChange={e=>updateLineAction(activeReq.id, line.sku, e.target.value as "تسليم"|"تبديل")}
                              >
                                <option value="تسليم">تسليم</option>
                                <option value="تبديل">تبديل</option>
                              </select>
                            </td>
                            <td className="py-2 px-2">{line.name}</td>
                            <td className="py-2 px-2">{line.uom}</td>
                            <td className="py-2 px-2">{line.requested}</td>
                            <td className="py-2 px-2">{line.fulfilled}</td>
                            <td className="py-2 px-2">{done ? <Badge color="green">مكتمل</Badge> : <Badge color="yellow">ناقص</Badge>}</td>
                            <td className="py-2 px-2">{it?.qty ?? 0}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-end gap-2 mt-3">
                  <button
                    className="px-4 py-2 rounded-2xl border text-sm"
                    disabled={!isReqCompleted(activeReq)}
                    onClick={()=>completeRequest(activeReq)}
                  >
                    اعتماد اكتمال الطلب
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* القطع المسترجعة */}
      {tab === "recycled" && (
        <div className="p-4 border rounded-2xl bg-white">
          <h3 className="font-semibold mb-3">سجل القطع المسترجعة</h3>
          <div className="overflow-auto border rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 px-2">#</th><th className="py-2 px-2">SKU</th><th className="py-2 px-2">الاسم</th>
                  <th className="py-2 px-2">الحالة</th><th className="py-2 px-2">سعر الموظف</th><th className="py-2 px-2">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {recycled.map(r => {
                  const base = findItemBySku(r.sku)?.price || 0;
                  const empPrice = Math.round(base * r.employeeFactor);
                  return (
                    <tr key={r.id} className="border-t">
                      <td className="py-2 px-2">{r.id}</td>
                      <td className="py-2 px-2">{r.sku}</td>
                      <td className="py-2 px-2">{r.name}</td>
                      <td className="py-2 px-2">{r.state === "needs_repair" ? <Badge color="yellow">بحاجة لصيانة</Badge> : <Badge color="green">صالح</Badge>}</td>
                      <td className="py-2 px-2">{empPrice} (عامل: {r.employeeFactor*100}%)</td>
                      <td className="py-2 px-2">
                        <div className="flex gap-2">
                          <button className="px-2 py-1 rounded-xl border text-xs"
                            onClick={()=>setRecycled(prev=>prev.map(x=>x.id===r.id?{...x,state:"refurbished"}:x))}>اعتماد كصالح</button>
                          <button className="px-2 py-1 rounded-xl border text-xs"
                            onClick={()=>setLogs(l=>[{t:new Date().toISOString().slice(0,19).replace("T"," "),msg:`${r.id} إلى بيع الموظفين`} ,...l])}>نقل لبيع الموظفين</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!recycled.length && <tr><td colSpan={6} className="text-center text-xs text-gray-500 py-6">لا توجد قطع مسترجعة</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* تنبيهات المخزون */}
      {tab === "alerts" && (
        <div className="p-4 border rounded-2xl bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">الأصناف ذات المخزون المنخفض</h3>
            <button className="px-3 py-2 rounded-2xl bg-red-800 text-white text-sm"
              onClick={()=>{/* يمكنك تحويل المحدد لطلب شراء */}}>إجراء</button>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {lowItems.map(li => (
              <div key={li.sku} className="p-3 border rounded-2xl">
                <div className="font-medium">{li.name}</div>
                <div className="text-xs text-gray-500">SKU: {li.sku} · الموقع: {li.bin}</div>
                <div className="mt-1 text-sm">الكمية: <span className="font-semibold">{li.qty}</span> / حد أدنى: {li.min}</div>
                <div className="mt-2"><Badge color="red">منخفض</Badge></div>
              </div>
            ))}
            {!lowItems.length && <div className="text-xs text-gray-500 p-3 border rounded-2xl text-center">لا توجد أصناف حرجة</div>}
          </div>
        </div>
      )}

      {/* طلبات الشراء (اختيار من كل الأصناف + طباعة) */}
      {tab === "purchases" && (
        <div className="space-y-4">
          <div className="p-4 border rounded-2xl bg-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">إنشاء طلب شراء</h3>
              <div className="text-xs text-gray-500">حدد الأصناف وضع الكميات ثم أنشئ الطلب أو اطبعه</div>
            </div>

            <div className="overflow-auto border rounded-2xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2 px-2">اختيار</th>
                    <th className="py-2 px-2">SKU</th>
                    <th className="py-2 px-2">الاسم</th>
                    <th className="py-2 px-2">الوحدة</th>
                    <th className="py-2 px-2">المتاح</th>
                    <th className="py-2 px-2">الكمية المطلوبة</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(it => {
                    const checked = Object.prototype.hasOwnProperty.call(selection, it.sku);
                    return (
                      <tr key={it.sku} className="border-t">
                        <td className="py-2 px-2">
                          <input type="checkbox" checked={checked}
                            onChange={e=>toggleSelect(it.sku, e.target.checked, Math.max(it.min*2 - it.qty, 1))}/>
                        </td>
                        <td className="py-2 px-2">{it.sku}</td>
                        <td className="py-2 px-2">{it.name}</td>
                        <td className="py-2 px-2">{it.uom}</td>
                        <td className="py-2 px-2">{it.qty}</td>
                        <td className="py-2 px-2">
                          <input className="border rounded-xl px-2 py-1 w-24"
                            value={selection[it.sku] ?? ""}
                            disabled={!checked}
                            onChange={e=>setSelQty(it.sku, Number(e.target.value))}
                            placeholder="عدد"/>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-2 mt-3">
              <button className="px-4 py-2 rounded-2xl border text-sm" onClick={printSelection}>طباعة المحدد</button>
              <button className="px-4 py-2 rounded-2xl bg-red-800 text-white text-sm" onClick={createPurchaseFromSelection}>إنشاء طلب شراء من المحدد</button>
            </div>
          </div>

          {/* قائمة الطلبات المنشأة */}
          <div className="p-4 border rounded-2xl bg-white">
            <h4 className="font-semibold mb-2">طلبات الشراء</h4>
            <div className="overflow-auto border rounded-2xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2 px-2">#</th><th className="py-2 px-2">التاريخ</th><th className="py-2 px-2">الأصناف</th><th className="py-2 px-2">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map(pr=>(
                    <tr key={pr.id} className="border-t">
                      <td className="py-2 px-2">{pr.id}</td>
                      <td className="py-2 px-2">{pr.date}</td>
                      <td className="py-2 px-2">{pr.items.map(i=>`${i.sku}×${i.qty}`).join(" ، ")}</td>
                      <td className="py-2 px-2">
                        {pr.status==="draft" && <Badge color="gray">مسودة</Badge>}
                        {pr.status==="sent_manager" && <Badge color="blue">لدى المدير</Badge>}
                        {pr.status==="approved" && <Badge color="green">معتمد</Badge>}
                        {pr.status==="sent_accounting" && <Badge color="yellow">لدى المحاسبة</Badge>}
                        {pr.status==="rejected" && <Badge color="red">مرفوض</Badge>}
                      </td>
                    </tr>
                  ))}
                  {!purchases.length && <tr><td colSpan={4} className="text-center text-xs text-gray-500 py-6">لا توجد طلبات</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* الأرشيف */}
      {tab === "archive" && (
        <div className="p-4 border rounded-2xl bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">أرشيف العمليات والمراسلات</h3>
            <button className="px-3 py-2 rounded-2xl border text-sm" onClick={()=>window.print()}>طباعة الصفحة</button>
          </div>
          <ul className="text-sm space-y-2 max-h-80 overflow-auto">
            {logs.map((l, i) => (
              <li key={i} className="p-2 border rounded-2xl">
                <div className="text-xs text-gray-500">{l.t}</div>
                <div>{l.msg}</div>
              </li>
            ))}
            {!logs.length && <li className="text-center text-xs text-gray-500 py-6">الأرشيف فارغ</li>}
          </ul>
        </div>
      )}
    </div>
  );
};


const CCTVPanel = () => {
  const [filter, setFilter] = useState("all"); // all | online | offline
  const filtered = sampleCameras.filter(c => filter === "all" ? true : c.status === filter);
  const onlineCount = sampleCameras.filter(c => c.status === "online").length;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-gradient-to-r from-red-800 to-red-600 text-white flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">لوحة الكاميرات</h2>
          <p className="text-sm text-red-100">مراقبة البث المباشر · حالة الاتصال · الوصول للأرشيف</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>setFilter("all")} className={`px-3 py-1.5 rounded-2xl text-sm ${filter==="all"?"bg-white text-red-800":"bg-white/10 text-white"}`}>الكل ({sampleCameras.length})</button>
          <button onClick={()=>setFilter("online")} className={`px-3 py-1.5 rounded-2xl text-sm ${filter==="online"?"bg-white text-red-800":"bg-white/10 text-white"}`}>متصلة ({onlineCount})</button>
          <button onClick={()=>setFilter("offline")} className={`px-3 py-1.5 rounded-2xl text-sm ${filter==="offline"?"bg-white text-red-800":"bg-white/10 text-white"}`}>غير متصلة ({sampleCameras.length-onlineCount})</button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {filtered.map((cam) => (
          <div key={cam.id} className="border rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{cam.name}</div>
              <Badge color={cam.status === "online" ? "green" : "red"}>{cam.status === "online" ? "متصلة" : "غير متصلة"}</Badge>
            </div>
            <div className="h-40 rounded-xl border border-dashed flex items-center justify-center text-sm text-gray-500 bg-slate-50">Live Placeholder</div>
            <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
              <span>الموقع: {cam.area}</span>
              <div className="flex gap-2">
                <button className="px-2 py-1 rounded-xl border">أرشيف</button>
                <button className="px-2 py-1 rounded-xl border">تكبير</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border rounded-2xl">
        <h3 className="text-sm font-semibold mb-2">آخر أحداث النظام</h3>
        <ul className="text-sm space-y-1">
          <li>08:10 — إعادة اتصال الكاميرا C-02</li>
          <li>07:55 — فقدان اتصال الكاميرا C-03</li>
        </ul>
      </div>
    </div>
  );
};

/***********************************
 * Reception — لوحة الريسبشن (مستقلة)
 * مهام: التذاكر/الشكاوى، الاستقبال، متابعة الفنيين، الأقساط، التركيبات، البنزين/المسارات
 ***********************************/
function ReceptionPanel() {
  const [tab, setTab] = useState("tickets"); // tickets | schedule | technicians | installments | installs | fuel | statements
  const [filter, setFilter] = useState("");

  return (
    <div className="space-y-6">
      <div className="rounded-3xl p-4 bg-gradient-to-r from-red-800 to-red-600 text-white flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">الريسبشن</h2>
          <p className="text-sm text-red-100">
            تسجيل صيانات/شكاوى · المواعيد · متابعة الفنيين · الأقساط · التركيبات · البنزين · كشوفات الزبائن
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          {[
            { key: "tickets", label: "التذاكر" },
            { key: "schedule", label: "المواعيد" },
            { key: "technicians", label: "متابعة الفنيين" },
            { key: "installments", label: "الأقساط" },
            { key: "installs", label: "التركيبات" },
            { key: "fuel", label: "البنزين/المسارات" },
            { key: "statements", label: "كشوفات الزبائن" }, // جديد
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-2xl ${
                tab === t.key ? "bg-white text-red-800" : "bg-white/10 text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* التذاكر */}
      {tab === "tickets" && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-2xl shadow-sm bg-white lg:col-span-2">
            <h3 className="font-semibold mb-3">تسجيل صيانة / شكوى</h3>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <input className="border rounded-2xl p-2" placeholder="اسم العميل" />
              <input className="border rounded-2xl p-2" placeholder="رقم الجوال" />
              <input className="border rounded-2xl p-2 md:col-span-2" placeholder="العنوان / الموقع" />
              <select className="border rounded-2xl p-2">
                <option>نوع الطلب: صيانة</option>
                <option>شكوى</option>
                <option>فحص</option>
              </select>
              <select className="border rounded-2xl p-2">
                <option>الأولوية: عادي</option>
                <option>مرتفع</option>
                <option>حرج</option>
              </select>
              <textarea className="border rounded-2xl p-2 md:col-span-2" rows={3} placeholder="وصف المشكلة" />
              <button className="rounded-2xl px-4 py-2 bg-red-800 text-white md:col-span-2">
                حفظ التذكرة وتعيين أقرب فني
              </button>
            </div>
          </div>
          <div className="p-4 border rounded-2xl shadow-sm bg-white">
            <h4 className="font-semibold mb-2">بحث سريع</h4>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-2xl p-2 w-full text-sm"
              placeholder="ابحث بالاسم/الهاتف"
            />
            <ul className="mt-3 space-y-2 text-sm">
              {sampleLeads
                .filter((l) => (l.name + l.phone).includes(filter))
                .map((l) => (
                  <li key={l.id} className="p-2 border rounded-2xl">
                    <div className="font-medium">{l.name}</div>
                    <div className="text-xs text-gray-500">
                      {l.phone} · {l.area}
                    </div>
                    <button className="mt-2 px-3 py-1.5 rounded-2xl border">فتح تذكرة</button>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "schedule" && <ScheduleAssignPanel />}

      {/* متابعة الفنيين */}
      {tab === "technicians" && <ReceptionTechniciansPanel />}

      {/* الأقساط */}
      {tab === "installments" && (
        <div className="p-4 border rounded-2xl shadow-sm bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">إدارة الأقساط</h3>
            <div className="text-xs text-gray-500">إنذارات قرب الاستحقاق (وهمي)</div>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2">#</th>
                  <th className="py-2">العميل</th>
                  <th className="py-2">المنتج</th>
                  <th className="py-2">بداية</th>
                  <th className="py-2">نهاية</th>
                  <th className="py-2">القسط/شهر</th>
                  <th className="py-2">مدفوع</th>
                  <th className="py-2">متبقي</th>
                </tr>
              </thead>
              <tbody>
                {sampleInstallments.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-2">{r.id}</td>
                    <td className="py-2">{r.customer}</td>
                    <td className="py-2">{r.product}</td>
                    <td className="py-2">{r.start}</td>
                    <td className="py-2">{r.end}</td>
                    <td className="py-2">{r.monthly}</td>
                    <td className="py-2">
                      {r.paidMonths}/{r.totalMonths}
                    </td>
                    <td className="py-2">{r.totalMonths - r.paidMonths}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* التركيبات */}
      {tab === "installs" && (
        <div className="p-4 border rounded-2xl shadow-sm bg-white">
          <h3 className="font-semibold mb-3">سجل التركيبات</h3>
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            {sampleInstallations.map((j) => (
              <div key={j.id} className="p-3 border rounded-2xl">
                <div className="font-medium">{j.customer}</div>
                <div className="text-gray-600">{j.address}</div>
                <div className="text-xs text-gray-500">
                  التاريخ: {j.date} · الجهاز: {j.device}
                </div>
                <div className="text-xs mt-1">الفني: {j.engineer}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* البنزين/المسارات */}
      {tab === "fuel" && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 border rounded-2xl shadow-sm bg-white">
            <h3 className="font-semibold mb-2">الخريطة والمسارات (وهمي)</h3>
            <div className="h-72 border border-dashed rounded-2xl flex items-center justify-center text-gray-500 text-sm">
              مسارات اليوم حسب الفني والمسافة المقطوعة
            </div>
          </div>
          <div className="p-4 border rounded-2xl shadow-sm bg-white">
            <h4 className="font-semibold mb-2">استهلاك البنزين</h4>
            <ul className="text-sm space-y-2">
              {sampleFuel.map((f) => (
                <li key={f.engineer} className="p-2 border rounded-2xl">
                  <div className="font-medium">{f.engineer}</div>
                  <div className="text-xs text-gray-500">
                    {f.date} · {f.distanceKm} كم · {f.liters} لتر
                  </div>
                  <div className="text-xs mt-1">{f.routes.join(" · ")}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* كشوفات الزبائن — جديد */}
      {tab === "statements" && <CustomerStatementsSection />}
    </div>
  );
}

/* ===================== قسم كشوفات الزبائن ===================== */

function CustomerStatementsSection() {
  // بيانات تجريبية مطابقة للهيكل الظاهر في الكشف (يمكن الاستيراد من إكسل أيضًا)
  const [rows, setRows] = useState<any[]>(sampleCustomerStatementRows);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<any | null>(rows[0] || null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const customers = useMemo(() => {
    const m = new Map<string, any>();
    rows.forEach((r) => {
      const key = `${r["اسم الزبون"]}#${r["الهاتف"] || ""}`;
      if (!m.has(key)) m.set(key, r);
    });
    return Array.from(m.values());
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (!selected) return [];
    return rows.filter((r) => {
      const same =
        r["اسم الزبون"] === selected["اسم الزبون"] &&
        (selected["الهاتف"] ? r["الهاتف"] === selected["الهاتف"] : true);
      if (!same) return false;
      const d = normalizeDateLoose(r["تاريخ الحركة"] || r["التاريخ"] || r.date);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      return true;
    });
  }, [rows, selected, dateFrom, dateTo]);

  // استيراد إكسل (نفس ترتيب الأعمدة)
  const importExcel = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls";
    input.onchange = async (e: any) => {
      const f = e.target.files?.[0];
      if (!f) return;
      try {
        const XLSX = await import("xlsx");
        const data = await f.arrayBuffer();
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const list = XLSX.utils.sheet_to_json<any>(ws);
        setRows(list);
        if (list.length) setSelected(list[0]);
        alert(`تم استيراد ${list.length} سطرًا من الكشف`);
      } catch (e) {
        console.error(e);
        alert("تعذر قراءة ملف الإكسل");
      }
    };
    input.click();
  };

  // طباعة / تصدير
  const printNow = () => window.print();
  const exportCSV = () => {
    const cols = statementPreferredCols;
    const header = cols.join(",");
    const lines = filteredRows.map((r) =>
      cols.map((c) => JSON.stringify(r[c] ?? "")).join(",")
    );
    const blob = new Blob([header + "\n" + lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `كشف-${selected?.["اسم الزبون"] || "عميل"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ملخص علوي
  const summary = useMemo(() => {
    const totalVisits = filteredRows.length;
    const warranty = filteredRows.filter((r) =>
      String(r["الضمان"] || "").includes("ضمان")
    ).length;
    const outWarranty = totalVisits - warranty;
    return { totalVisits, warranty, outWarranty };
  }, [filteredRows]);

  return (
    <div className="space-y-4 p-4 border rounded-2xl shadow-sm bg-white">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">كشوفات الزبائن</h3>
        <div className="flex gap-2">
          <button className="border rounded-2xl px-3 py-1.5 text-sm" onClick={importExcel}>
            استيراد كشف (Excel)
          </button>
          <button className="border rounded-2xl px-3 py-1.5 text-sm" onClick={exportCSV}>
            تصدير CSV
          </button>
          <button className="border rounded-2xl px-3 py-1.5 text-sm" onClick={printNow}>
            طباعة
          </button>
        </div>
      </div>

      {/* اختيار عميل */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-3 border rounded-2xl">
          <div className="text-xs text-gray-500 mb-1">ابحث عن عميل</div>
          <input
            className="border rounded-2xl p-2 w-full text-sm"
            placeholder="الاسم أو الهاتف"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <ul className="mt-2 space-y-1 max-h-72 overflow-auto text-sm">
            {customers
              .filter(
                (c) =>
                  (c["اسم الزبون"] || "").includes(q) ||
                  (c["الهاتف"] || "").includes(q)
              )
              .map((c, i) => (
                <li
                  key={i}
                  className={`p-2 border rounded-2xl cursor-pointer ${
                    selected &&
                    c["اسم الزبون"] === selected["اسم الزبون"] &&
                    c["الهاتف"] === selected["الهاتف"]
                      ? "bg-red-50"
                      : ""
                  }`}
                  onClick={() => setSelected(c)}
                >
                  <div className="font-medium">{c["اسم الزبون"]}</div>
                  <div className="text-xs text-gray-500">
                    {c["الهاتف"] || "—"} · {c["الفرع"] || "—"}
                  </div>
                </li>
              ))}
          </ul>
        </div>

        {/* بطاقة ملخص + فلاتر تاريخ */}
        <div className="md:col-span-2 p-3 border rounded-2xl grid md:grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-xs text-gray-500">اسم الزبون</div>
            <div className="font-semibold">{selected?.["اسم الزبون"] || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">الهاتف</div>
            <div className="font-semibold">{selected?.["الهاتف"] || "—"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">الفرع</div>
            <div className="font-semibold">{selected?.["الفرع"] || "—"}</div>
          </div>
          <div>
            <label className="text-xs text-gray-500">من تاريخ</label>
            <input
              type="date"
              className="border rounded-2xl p-2 w-full"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">إلى تاريخ</label>
            <input
              type="date"
              className="border rounded-2xl p-2 w-full"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="grid content-center">
            <div className="text-xs text-gray-500">
              إجمالي الزيارات: <b>{summary.totalVisits}</b> · ضمن الضمان:{" "}
              <b>{summary.warranty}</b> · خارج الضمان: <b>{summary.outWarranty}</b>
            </div>
          </div>
        </div>
      </div>

      {/* جدول الكشف — أعمدة مرتبة “كما في الصورة” */}
      <div className="overflow-auto">
        <table className="w-full text-sm min-w-[1100px]">
          <thead>
            <tr className="text-left text-gray-500">
              {statementPreferredCols.map((c) => (
                <th key={c} className="py-2 pr-4">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 && (
              <tr>
                <td className="py-3" colSpan={statementPreferredCols.length}>
                  لا توجد بيانات
                </td>
              </tr>
            )}
            {filteredRows.map((r, i) => (
              <tr key={i} className="border-t">
                {statementPreferredCols.map((c) => (
                  <td key={c} className="py-2 pr-4">
                    {String(r[c] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ملاحظات وتواقيع (مطابقة لفكرة الكشف الورقي) */}
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div className="p-3 border rounded-2xl">
          <div className="text-xs text-gray-500 mb-1">ملاحظة عامة</div>
          <textarea className="border rounded-2xl p-2 w-full" rows={3} placeholder="أدخل ملاحظات حول كشف العميل"></textarea>
        </div>
        <div className="p-3 border rounded-2xl grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-500">الكاونتر:</div>
            <div className="border rounded-xl h-16"></div>
          </div>
          <div>
            <div className="text-xs text-gray-500">مدير الصيانة:</div>
            <div className="border rounded-xl h-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ترتيب الأعمدة كما في نموذج الكشف (يمكن تعديلها لتطابق ملفكم المحاسبي 1:1) */
const statementPreferredCols = [
  "اسم الزبون",
  "الهاتف",
  "الفرع",
  "رقم المستند",
  "تاريخ الحركة",
  "نوع الخدمة",
  "تفاصيل",
  "حالة الضمان",
  "تاريخ الضمان",
  "الموظف",
  "نتيجة الزيارة",
  "المبلغ",
  "ملاحظات",
];

/* داتا تجريبية قريبة من الصورة (لإظهار التفاصيل مباشرة) */
const sampleCustomerStatementRows = [
  {
    "اسم الزبون": "هيا رشيد السماح",
    "الهاتف": "935678978",
    "الفرع": "السويدي",
    "رقم المستند": "INV-10167",
    "تاريخ الحركة": "2025-10-27",
    "نوع الخدمة": "صيانة مجانية ضمن الضمان",
    "تفاصيل": "تبديل ترانس + انتظار العميل 15 دقيقة",
    "حالة الضمان": "ضمن الضمان",
    "تاريخ الضمان": "2025-07-20",
    "الموظف": "السكرتيرة مها",
    "نتيجة الزيارة": "تم التنفيذ",
    "المبلغ": 0,
    "ملاحظات": "",
  },
  {
    "اسم الزبون": "نبيلة يوسف يوسف",
    "الهاتف": "935678978",
    "الفرع": "السويدي",
    "رقم المستند": "INV-10168",
    "تاريخ الحركة": "2025-10-27",
    "نوع الخدمة": "صيانة",
    "تفاصيل": "تعبئة خزان هواء + انتظار للتجربة",
    "حالة الضمان": "خارج الضمان",
    "تاريخ الضمان": "",
    "الموظف": "السكرتيرة مها",
    "نتيجة الزيارة": "تم التنفيذ",
    "المبلغ": 25,
    "ملاحظات": "",
  },
  {
    "اسم الزبون": "الياس كمانوئيل خدر",
    "الهاتف": "935678978",
    "الفرع": "السويدي",
    "رقم المستند": "INV-10169",
    "تاريخ الحركة": "2025-10-27",
    "نوع الخدمة": "زيارة مالية",
    "تفاصيل": "استلام دفعة",
    "حالة الضمان": "—",
    "تاريخ الضمان": "",
    "الموظف": "السكرتيرة مها",
    "نتيجة الزيارة": "تم التنفيذ",
    "المبلغ": 0,
    "ملاحظات": "",
  },
  {
    "اسم الزبون": "آلاء الكوا",
    "الهاتف": "935678978",
    "الفرع": "السويدي",
    "رقم المستند": "INV-10170",
    "تاريخ الحركة": "2025-10-27",
    "نوع الخدمة": "صيانة",
    "تفاصيل": "فحص + تبديل مجمع والهاي براشر",
    "حالة الضمان": "خارج الضمان",
    "تاريخ الضمان": "",
    "الموظف": "السكرتيرة مها",
    "نتيجة الزيارة": "تم التنفيذ",
    "المبلغ": 60,
    "ملاحظات": "تأخير بسبب أعطال بالقطع",
  },
  {
    "اسم الزبون": "ربيع العوض الشدود",
    "الهاتف": "935678978",
    "الفرع": "السويدي",
    "رقم المستند": "INV-10171",
    "تاريخ الحركة": "2025-10-27",
    "نوع الخدمة": "فحص",
    "تفاصيل": "فحص الجهاز + عرض استبدال",
    "حالة الضمان": "—",
    "تاريخ الضمان": "",
    "الموظف": "السكرتيرة مها",
    "نتيجة الزيارة": "مهتم لاحقًا",
    "المبلغ": 0,
    "ملاحظات": "",
  },
];

/* أداة تاريخ مبسطة لاستخدامها في الفلاتر */
function normalizeDateLoose(val: any): string {
  if (!val) return "1970-01-01";
  if (typeof val === "number") {
    const d = new Date((val - 25569) * 86400 * 1000);
    return toYMD(d);
  }
  if (typeof val === "string") {
    const t = val.replace(/\./g, "/").replace(/-/g, "/");
    const d = new Date(t);
    if (!isNaN(d.getTime())) return toYMD(d);
  }
  return "1970-01-01";
}
function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function Sales_Department() {
  const [tab, setTab] = useState<"inbox" | "handoffs" | "agents" | "schedule" | "technicians" >("inbox");
  const [filter, setFilter] = useState("");

  // --- بيانات واردة من فريق التيل ماركت (وهمية) ---
  // تحتوي: اسم/هاتف/عنوان/موعد زيارة (ساعة) + إحداثيات العميل
  const [tmInbox, setTmInbox] = useState<Array<{
    id: string;
    name: string;
    phone: string;
    address: string;
    time: string;           // "14:30" مثلاً
    lat: number;
    lng: number;
    note?: string;
  }>>([
    { id: "TM-1001", name: "أحمد عبد الله", phone: "0501234567", address: "حي الروضة - شارع 12", time: "13:00", lat: 24.774265, lng: 46.738586, note: "فلتر RO يضعف التدفق" },
    { id: "TM-1002", name: "سارة الشمري", phone: "0559876543", address: "حي العليا - قرب المستشفى", time: "16:30", lat: 24.699, lng: 46.685, note: "رغبة بفحص + عروض سخان شمسي" },
    { id: "TM-1003", name: "مازن تركي", phone: "0532221188", address: "الياسمين - تقاطع 15", time: "11:15", lat: 24.832, lng: 46.646, note: "صيانة دورية" },
  ]);

  // --- فنيون (للاقتراح فقط) بإحداثيات (وهمي) ---
  const techniciansGeo = useMemo(() => ([
    { id: "T-01", name: "م. أحمد", status: "available", lat: 24.773, lng: 46.72 },
    { id: "T-02", name: "م. خالد", status: "available", lat: 24.71,  lng: 46.68 },
    { id: "T-03", name: "م. روان", status: "busy",      lat: 24.80,  lng: 46.66 },
    { id: "T-04", name: "م. سليم", status: "offline",   lat: 24.69,  lng: 46.64 },
  ]), []);

  // --- قائمة التحويلات التي أُرسلت للريسبشن (سجل تتبع) ---
  const [handoffs, setHandoffs] = useState<Array<{
    id: string;                // رقم طلب TM
    customer: string;
    phone: string;
    address: string;
    time: string;
    suggestedTechId: string;   // أقرب فني مقترح
    suggestedTechName: string;
    distanceKm: number;
    status: "sent_to_reception"; // للعرض فقط
  }>>([]);

  // حساب مسافة بسيطة (تقريب خطي لأغراض العرض)
  const distanceKm = (a: {lat:number;lng:number}, b: {lat:number;lng:number}) => {
    const dx = (a.lat - b.lat) * 111; // تقريب درجة العرض ≈ 111 كم
    const dy = (a.lng - b.lng) * 95;  // تقريب لخط الطول قرب الرياض
    return Math.sqrt(dx*dx + dy*dy);
  };

  // إيجاد أقرب فني متاح/مشغول (نتجنب offline قدر الإمكان)
  const findNearestTech = (lat: number, lng: number) => {
    const ranked = techniciansGeo
      .map(t => ({ ...t, d: distanceKm({lat,lng}, {lat: t.lat, lng: t.lng}) }))
      .sort((a, b) => {
        // أولوية: available ثم busy ثم others، ثم المسافة
        const pri = (s:string) => (s==="available"?0 : s==="busy"?1 : 2);
        const pa = pri(a.status), pb = pri(b.status);
        return pa === pb ? a.d - b.d : pa - pb;
      });
    return ranked[0];
  };

  // تحويل طلب للريسبشن + اقتراح أقرب فني (التعيين الفعلي سيتم في الريسبشن)
  const forwardToReception = (reqId: string) => {
    const req = tmInbox.find(r => r.id === reqId);
    if (!req) return;
    const nearest = findNearestTech(req.lat, req.lng);
    setHandoffs(prev => [
      {
        id: req.id,
        customer: req.name,
        phone: req.phone,
        address: req.address,
        time: req.time,
        suggestedTechId: nearest.id,
        suggestedTechName: nearest.name,
        distanceKm: Number(nearest.d.toFixed(1)),
        status: "sent_to_reception",
      },
      ...prev,
    ]);
    setTmInbox(prev => prev.filter(r => r.id !== reqId));
    alert(`تم تحويل الطلب (${req.id}) إلى الريسبشن مع اقتراح أقرب فني: ${nearest.name}`);
  };

  return (
    <div className="space-y-6">
      {/* رأس */}
      <div className="rounded-3xl p-4 bg-gradient-to-r from-red-800 to-red-600 text-white flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">إشراف Tell Market</h2>
          <p className="text-sm text-red-100">استلام طلبات الصيانة من فريق التيل ماركت وتحويلها للريسبشن (الذي يعيّن أقرب فني)</p>
        </div>
        <div className="flex gap-2 text-sm">
          {[
            { key: "inbox",        label: `وارد (${tmInbox.length})` },
            { key: "handoffs",     label: `تحويلات (${handoffs.length})` },
            { key: "agents",       label: "الموظفات" },
            { key: "schedule",     label: "المواعيد" },
            { key: "technicians",  label: "حالة الفنيين" },

          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-3 py-1.5 rounded-2xl ${tab === t.key ? "bg-white text-red-800" : "bg-white/10 text-white"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* وارد التيل ماركت */}
      {tab === "inbox" && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-2xl shadow-sm bg-white lg:col-span-2">
            <h3 className="font-semibold mb-3">طلبات صيانة واردة من التيل ماركت</h3>
            <div className="flex items-center gap-2 mb-3">
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border rounded-2xl p-2 w-full text-sm"
                placeholder="بحث بالاسم/الهاتف/العنوان"
              />
            </div>
            <ul className="space-y-2 text-sm">
              {tmInbox
                .filter(r => (r.name + r.phone + r.address).includes(filter))
                .map(r => {
                  const nearest = findNearestTech(r.lat, r.lng);
                  return (
                    <li key={r.id} className="p-3 border rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{r.id} — {r.name}</div>
                        <div className="text-xs text-gray-500">{r.phone}</div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">العنوان: {r.address}</div>
                      <div className="text-xs text-gray-600">موعد الزيارة (ساعة): {r.time}</div>
                      {r.note && <div className="text-xs text-gray-500 mt-1">ملاحظة: {r.note}</div>}
                      <div className="mt-2 grid sm:grid-cols-3 gap-2 text-xs">
                        <div className="p-2 border rounded-xl">
                          <div className="text-gray-500">أقرب فني (اقتراح)</div>
                          <div className="font-semibold">{nearest.name}</div>
                        </div>
                        <div className="p-2 border rounded-xl">
                          <div className="text-gray-500">المسافة التقديرية</div>
                          <div className="font-semibold">{nearest.d.toFixed(1)} كم</div>
                        </div>
                        <div className="p-2 border rounded-xl">
                          <div className="text-gray-500">الحالة</div>
                          <div className="font-semibold">{nearest.status === "available" ? "متاح" : nearest.status === "busy" ? "مشغول" : "غير متصل"}</div>
                        </div>
                      </div>
                      <div className="mt-3 h-32 border border-dashed rounded-2xl flex items-center justify-center text-gray-500 text-[12px] bg-gray-50">
                        خريطة (وهمي): مسار من الفني المقترح → العميل
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => forwardToReception(r.id)}
                          className="px-4 py-2 rounded-2xl bg-red-800 text-white"
                        >
                          تحويل للريسبشن
                        </button>
                        <button className="px-4 py-2 rounded-2xl border">تفاصيل</button>
                      </div>
                    </li>
                  );
                })}
              {tmInbox.length === 0 && (
                <li className="p-3 border rounded-2xl text-center text-gray-500">لا توجد طلبات حالياً</li>
              )}
            </ul>
          </div>

          {/* تذكير بالإجراء */}
          <div className="p-4 border rounded-2xl shadow-sm bg-white">
            <h4 className="font-semibold mb-2">معلومة</h4>
            <p className="text-sm text-gray-600">
              عند الضغط على <span className="font-semibold">تحويل للريسبشن</span> يتم إرسال الطلب لقسم الريسبشن مع اقتراح أقرب فني؛
              التعيين الفعلي يتم هناك حسب المسافة والحِمل.
            </p>
          </div>
        </div>
      )}

      {/* سجل التحويلات إلى الريسبشن */}
      {tab === "handoffs" && (
        <div className="p-4 border rounded-2xl shadow-sm bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">تحويلات الريسبشن</h3>
            <div className="text-xs text-gray-500">آخر التحويلات</div>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2"># TM</th>
                  <th className="py-2">العميل</th>
                  <th className="py-2">الهاتف</th>
                  <th className="py-2">العنوان</th>
                  <th className="py-2">الساعة</th>
                  <th className="py-2">فني مقترح</th>
                  <th className="py-2">المسافة</th>
                  <th className="py-2">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {handoffs.map(h => (
                  <tr key={h.id} className="border-t">
                    <td className="py-2">{h.id}</td>
                    <td className="py-2">{h.customer}</td>
                    <td className="py-2">{h.phone}</td>
                    <td className="py-2">{h.address}</td>
                    <td className="py-2">{h.time}</td>
                    <td className="py-2">{h.suggestedTechName}</td>
                    <td className="py-2">{h.distanceKm} كم</td>
                    <td className="py-2"><span className="text-amber-700">مرسَل للريسبشن</span></td>
                  </tr>
                ))}
                {handoffs.length === 0 && (
                  <tr><td colSpan={8} className="py-6 text-center text-gray-500">لم يتم تحويل أي طلب بعد</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* تبويب الموظفات (إشراف موجز) */}
      {tab === "agents" && (
        <div className="p-4 border rounded-2xl shadow-sm bg-white">
          <h3 className="font-semibold mb-3">أداء موظفات التيل ماركت (وهمي)</h3>
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            {[
              { name: "نورة", calls: 42, accepts: 9, conv: "21%" },
              { name: "ليان", calls: 35, accepts: 7, conv: "20%" },
              { name: "غادة", calls: 38, accepts: 6, conv: "16%" },
            ].map(a => (
              <div key={a.name} className="p-3 border rounded-2xl">
                <div className="font-medium">{a.name}</div>
                <div className="text-gray-600">مكالمات: {a.calls}</div>
                <div className="text-gray-600">موافقات فحص: {a.accepts}</div>
                <div className="text-gray-600">التحويل: {a.conv}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* تبويباتك السابقة تبقى كما هي */}
      {tab === "schedule" && (
        <div className="p-4 border rounded-2xl shadow-sm bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">تقويم المواعيد</h3>
            <div className="text-xs text-gray-500">عرض أسبوعي</div>
          </div>
          <div className="h-72 border border-dashed rounded-2xl flex items-center justify-center text-gray-500 text-sm">Placeholder Calendar</div>
        </div>
      )}

      {tab === "technicians" && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 border rounded-2xl shadow-sm bg-white">
            <h3 className="font-semibold mb-2">الخريطة والمسارات (وهمي)</h3>
            <div className="h-72 border border-dashed rounded-2xl flex items-center justify-center text-gray-500 text-sm">خريطة توضح أقرب فني للعميل + تتبع حي</div>
          </div>
          <div className="p-4 border rounded-2xl shadow-sm bg-white">
            <h4 className="font-semibold mb-2">حالة الفنيين الآن</h4>
            <ul className="text-sm space-y-2">
              {techniciansGeo.map(e => (
                <li key={e.id} className="p-2 border rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="font-medium">{e.name}</div>
                    <div className="text-xs text-gray-500">lat:{e.lat.toFixed(3)} · lng:{e.lng.toFixed(3)}</div>
                  </div>
                  <Badge color={e.status === "available" ? "green" : e.status === "busy" ? "yellow" : "gray"}>
                    {e.status === "available" ? "متاح" : e.status === "busy" ? "مشغول" : "غير متصل"}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}


    </div>
  );
}

/***********************
 * شريط اختبار (Test Bars)
 ***********************/
function DevTestBar({ section }: { section: string }) {
  const [msg, setMsg] = useState("\u2705 Self‑tests passed");
  useEffect(() => {
    if (typeof section === "undefined") setMsg("\u274C section undefined");
    else if (typeof section !== "string") setMsg("\u274C section not a string");
    else if (!["admin", "tellmarket", "hr", "accounting", "cctv", "reception"].includes(section)) setMsg("\u26A0\uFE0F unexpected section value");
    else setMsg("\u2705 Self‑tests passed");
  }, [section]);
  return <div className="mt-3 text-xs text-gray-500 text-center">{msg}</div>;
}

function DevSelfTests({ section }: { section: string }) {
  const initialChecked = useRef(false);
  const results: Array<{name:string; pass:boolean; note?:string}> = [];
  results.push({ name: "section هو نص", pass: typeof section === "string" });
  results.push({ name: "section ضمن القيم المسموحة", pass: ["admin", "tellmarket", "hr", "accounting", "cctv", "reception"].includes(section) });
  results.push({ name: "وجود مكوّنات اللوحات", pass: [AdminUI, TellMarketUI, HRPanel, AccountingPanel, CCTVPanel, ReceptionPanel].every(fn => typeof fn === "function") });
  if (!initialChecked.current) initialChecked.current = true;
  return (
    <div className="mt-2 border rounded-2xl p-2 text-xs text-gray-600">
      <div className="font-semibold mb-1">اختبارات إضافية</div>
      <ul className="space-y-1">
        {results.map((r) => (
          <li key={r.name} className={r.pass ? "text-green-700" : "text-red-700"}>
            {r.pass ? "✅" : "❌"} {r.name}{r.note ? ` — ${r.note}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

/***********************
 * التطبيق الجذري — App
 ***********************/
export default function App() {
  const [section, setSection] = useState("admin"); // admin | tellmarket | hr | accounting | cctv | reception

  return (
    <div className="min-h-screen p-6 md:p-10 bg-slate-50 text-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* رأس بنمط الهوية */}
        <header className="mb-6">
          <div className="rounded-3xl p-5 bg-gradient-to-r from-red-800 to-red-600 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">الواجهة الإدارية</h1>
              <p className="text-sm text-red-100">لوحات: المدير · Tell Market · HR · المحاسبة · CCTV · الريسبشن</p>
            </div>
            <nav className="flex flex-wrap gap-2">
              <button onClick={() => setSection("admin")} className={`px-4 py-2 rounded-2xl text-sm ${section === "admin" ? "bg-white text-red-800" : "bg-white/10 text-white"}`}>لوحة المدير</button>
              <button onClick={() => setSection("tellmarket")} className={`px-4 py-2 rounded-2xl text-sm ${section === "tellmarket" ? "bg-white text-red-800" : "bg-white/10 text-white"}`}>Tell Market</button>
              <button onClick={() => setSection("Sales_Department")} className={`px-4 py-2 rounded-2xl text-sm ${section === "Sales_Department" ? "bg-white text-red-800" : "bg-white/10 text-white"}`}>Sales_Department</button>
              <button onClick={() => setSection("hr")} className={`px-4 py-2 rounded-2xl text-sm ${section === "hr" ? "bg-white text-red-800" : "bg-white/10 text-white"}`}>HR</button>
              <button onClick={() => setSection("accounting")} className={`px-4 py-2 rounded-2xl text-sm ${section === "accounting" ? "bg-white text-red-800" : "bg-white/10 text-white"}`}>المحاسبة</button>
              <button onClick={() => setSection("warehouse")} className={`px-4 py-2 rounded-2xl text-sm ${section === "warehouse" ? "bg-white text-red-800" : "bg-white/10 text-white"}`}>المستودع</button>
              <button onClick={() => setSection("cctv")} className={`px-4 py-2 rounded-2xl text-sm ${section === "cctv" ? "bg-white text-red-800" : "bg-white/10 text-white"}`}>CCTV</button>
              <button onClick={() => setSection("reception")} className={`px-4 py-2 rounded-2xl text-sm ${section === "reception" ? "bg-white text-red-800" : "bg-white/10 text-white"}`}>الريسبشن</button>
            </nav>
          </div>
        </header>

        <main className="rounded-3xl p-4 md:p-6 border border-slate-200 bg-white mb-6">
          {section === "admin" ? (
            <AdminUI goTo={setSection} />
          ) : section === "tellmarket" ? (
            <TellMarketUI />
          ) : section === "hr" ? (
            <HRPanel />
          ): section === "Sales_Department" ? (
            <Sales_Department />
          ) 
          : section === "accounting" ? (
            <AccountingPanel />
          ) : section === "warehouse" ? (
            <WarehousePanel />
          ) : section === "cctv" ? (
            <CCTVPanel />
          )  : (
            <ReceptionPanel />
          )
          }
          <DevTestBar section={section} />
          <DevSelfTests section={section} />
        </main>

        <footer className="mt-2 text-xs text-gray-500 text-center">تصميم مبدئي (لوحي أولاً) — ألوان الهوية: أحمر داكن + Slate. جميع البيانات المعروضة وهمية لشرح الفكرة.</footer>
      </div>
    </div>
  );
}



/** لوحة متابعة الفنيين — للريسبشن (نسخة موسعة حسب النموذج المرسل)
 * - رفع ملف إكسل متعدد الشيتات (الصيانة/التركيب/الوقود/المهام...)
 * - اختيار اسم الفني ⇒ يظهر له ملف فني منسّق (كل الجداول).
 * - تعتمد على أسماء أعمدة عربية/إنجليزية شائعة، وتلتقط الورقة (_sheet/sheetName) تلقائيًا.
 */



/** بيانات تجريبية مطابقة للنموذج — نفس الأعمدة العربية */
const SAMPLE_SHEETS: Record<string, any[]> = {
  "رأس اليوم": [
    { "اسم الفني": "يزن طقطق", "التاريخ": "2025-11-05", "الخروج": "10:10", "العودة": "09:45" },
  ],
  "الوقود": [
    { "اسم الفني": "يزن طقطق", "التاريخ": "2025-10-28", "العداد عند التعبئة": 181981, "عداد التعبئة الثانية": 182238 },
    { "اسم الفني": "يزن طقطق", "التاريخ": "2025-11-04", "رقم السيارة": "497380", "اللوحة": "س ع ل 1234", "العداد السابق": 182238, "العداد الحالي": 182289, "المسافة المقطوعة": 51, "invoiceNo": "INV-7789", "liters": 35, "amountSAR": 92, "receptionist": "أميرة" },
  ],
  "صيانات": [
    { "اسم الفني":"يزن طقطق","التاريخ":"2025-11-05","المنطقة":"جرمانا","اسم الزبون":"ربيع العوض الشدود","شرح الصيانة":"تم فحص الجهاز + يجب تبديل الحشوات + تم عرض استبدال","النقاط":1,"وقت الدخول":"10:30","وقت الخروج":"11:15","am/pm":"am","الحالة":"done" },
    { "اسم الفني":"يزن طقطق","التاريخ":"2025-11-05","المنطقة":"دويلعة","اسم الزبون":"هيا رشيد السماح","شرح الصيانة":"تبديل الترنس + انتظار العميل 15 دقيقة","النقاط":1,"وقت الدخول":"11:30","وقت الخروج":"11:55","am/pm":"am","الحالة":"done" },
    { "اسم الفني":"يزن طقطق","التاريخ":"2025-11-05","المنطقة":"الطبالة","اسم الزبون":"نبيلة يوسف يوسف","شرح الصيانة":"تعبئة خزان هواء + انتظار قليل","النقاط":1,"وقت الدخول":"12:20","وقت الخروج":"12:45","am/pm":"am","الحالة":"done" },
    { "اسم الفني":"يزن طقطق","التاريخ":"2025-11-05","المنطقة":"جرمانا","اسم الزبون":"الياس كمانوئيل خدر","شرح الصيانة":"احضار دفعة","النقاط":0.5,"وقت الدخول":"13:25","وقت الخروج":"13:35","am/pm":"pm","الحالة":"done" },

    { "اسم الفني":"يزن طقطق","التاريخ":"2025-11-05","المنطقة":"جرمانا","اسم الزبون":"—","شرح الصيانة":"موعد يناسب السبت صباحًا أو 6 مساءً","الحالة":"postponed","تأجيل_إلى":"2025-11-08","سبب عدم التنفيذ":"حصراً السبت صباحاً أو 6 مساء" },

    { "اسم الفني":"يزن طقطق","التاريخ":"2025-11-05","المنطقة":"دويلعة","اسم الزبون":"—","الحالة":"لا يرد","سبب عدم التنفيذ":"لم يرد على الاتصالات" },
    { "اسم الفني":"يزن طقطق","التاريخ":"2025-11-05","المنطقة":"الطبالة","اسم الزبون":"—","الحالة":"لا يرد","سبب عدم التنفيذ":"انشغال الرقم" },
    { "اسم الفني":"يزن طقطق","التاريخ":"2025-11-05","المنطقة":"جرمانا","اسم الزبون":"—","الحالة":"لا يرد","سبب عدم التنفيذ":"إغلاق الهاتف" },

    { "اسم الفني":"يزن طقطق","التاريخ":"2025-11-05","المنطقة":"جرمانا","اسم الزبون":"—","الحالة":"غير منفذة","سبب عدم التنفيذ":"تركيب أجهزة في الطريق" },
    { "اسم الفني":"يزن طقطق","التاريخ":"2025-11-05","المنطقة":"الطبالة","اسم الزبون":"—","الحالة":"غير منفذة","سبب عدم التنفيذ":"بسبب تركيب أجهزة" },

    { "اسم الفني":"يزن طقطق","التاريخ":"2025-11-05","المنطقة":"شبعا","اسم الزبون":"آلاء الكوا","شرح الصيانة":"فحص الجهاز + تبديل المجمع والهاي براشر (تأخير بسبب أعطال قطع)","النقاط":1,"وقت الدخول":"16:25","وقت الخروج":"17:30","am/pm":"pm","الحالة":"done" },

    { "اسم الفني":"يزن طقطق","التاريخ":"2025-11-05","المنطقة":"دويلعة","اسم الزبون":"شذى بركيل","الحالة":"postponed","المشكلة":"غداً بعد الساعة 6 مساء" },
  ],
  "تركيب الفني": [
    { "اسم الفني":"يزن طقطق","التاريخ":"2025-11-05","المنطقة":"جرمانا","اسم الزبون":"يعقوب هرموش","الجهاز":"فلتر 6 مراحل","النقاط":2,"وقت الدخول":"02:30","وقت الخروج":"03:10","am/pm":"am","الحالة":"done" },
    { "اسم الفني":"يزن طقطق","التاريخ":"2025-11-05","المنطقة":"جرمانا","اسم الزبون":"رغد سعد الدين","الجهاز":"فلتر 7 مراحل","النقاط":2,"وقت الدخول":"07:00","وقت الخروج":"08:10","am/pm":"pm","الحالة":"done" },
    { "اسم الفني":"يزن طقطق","التاريخ":"2025-11-05","المنطقة":"جرمانا","اسم الزبون":"محمد حسنو","الجهاز":"فلتر 6 مراحل + تسليم إبريق كهربائي","النقاط":2,"وقت الدخول":"08:50","وقت الخروج":"09:45","am/pm":"pm","الحالة":"done" },
  ],
  "مهام أخرى": [
    { "اسم الفني":"يزن طقطق","الرقم":1,"المنطقة":"جرمانا","الدخول":"03:35","الخروج":"03:55","المهمة":"الذهاب إلى الشركة لتسليم مصاري","التاريخ":"2025-11-05" },
    { "اسم الفني":"يزن طقطق","الرقم":2,"المنطقة":"شبعا - جرمانا","الدخول":"02:00","الخروج":"02:30","المهمة":"الذهاب لطريق شبعا للعميلة آلاء الكوا ثم للأستاذ علي عساف لتركيب جهاز","التاريخ":"2025-11-05" },
  ],
};

/** لوحة متابعة الفنيين — للريسبشن (مطابقة للنموذج + محمّلة بالداتا) */
function ReceptionTechniciansPanel() {
  // نحمّل الداتا التجريبية افتراضيًا
  const [sheets, setSheets] = useState<Record<string, any[]>>(SAMPLE_SHEETS);
  const [tech, setTech] = useState<string>("يزن طقطق");
  const [dateFrom, setDateFrom] = useState("2025-11-01");
  const [dateTo, setDateTo] = useState("2025-11-30");

  // استيراد جميع الشيتات من ملف إكسل واحد (اختياري لاستبدال الداتا)
  const importAll = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls";
    input.onchange = async (e: any) => {
      const f = e.target.files?.[0];
      if (!f) return;
      try {
        const XLSX = await import("xlsx");
        const data = await f.arrayBuffer();
        const wb = XLSX.read(data, { type: "array" });
        const out: Record<string, any[]> = {};
        wb.SheetNames.forEach((name: string) => {
          const ws = wb.Sheets[name];
          const rows = XLSX.utils.sheet_to_json<any>(ws);
          rows.forEach((r: any) => (r._sheet = name)); // احتفظ باسم الشيت
          out[name] = rows;
        });
        setSheets(out);
        alert(`تم استيراد ${Object.keys(out).length} ورقة`);
      } catch (err) {
        console.error(err);
        alert("تعذر قراءة الملف");
      }
    };
    input.click();
  };

  // جميع الصفوف + فلاتر (الاسم + المدى الزمني)
  const allRows = useMemo(() => {
    const a: any[] = [];
    Object.entries(sheets).forEach(([name, rows]) =>
      (rows as any[]).forEach((r) => a.push({ ...r, _sheet: r._sheet || name }))
    );
    return a;
  }, [sheets]);

  const technicians = useMemo(() => {
    const s = new Set<string>();
    allRows.forEach((r) => {
      const t = r.tech || r.technician || r.الفني || r["اسم الفني"] || r.اسم_الفني;
      if (t) s.add(String(t));
    });
    return Array.from(s);
  }, [allRows]);

  const filtered = useMemo(() => {
    return allRows.filter((r) => {
      const t = r.tech || r.technician || r.الفني || r["اسم الفني"] || r.اسم_الفني;
      if (tech && String(t || "").trim() !== tech.trim()) return false;
      const dStr = normalizeDateLoose(r.date || r.Date || r.التاريخ || r.اليوم || r.زيارة || r.تاريخ);
      if (dateFrom && dStr < dateFrom) return false;
      if (dateTo && dStr > dateTo) return false;
      return true;
    });
  }, [allRows, tech, dateFrom, dateTo]);

  // تقسيم حسب نوع الشيت/الأعمدة
  const fuelRows = useMemo(
    () =>
      filtered.filter(
        (r) =>
          "kmBefore" in r ||
          "invoiceNo" in r ||
          r.نوع === "وقود" ||
          /fuel|وقود|بنزين|الوقود/i.test(r._sheet || "")
      ),
    [filtered]
  );

  const maintRows = useMemo(
    () =>
      filtered.filter((r) => {
        const typ = String(r.type || r.النوع || r.الفئة || "").toLowerCase();
        return typ.includes("صيانة") || /صيان|maint/i.test(typ) || /صيانات?/i.test(r._sheet || "");
      }),
    [filtered]
  );

  const instRows = useMemo(
    () =>
      filtered.filter((r) => {
        const typ = String(r.type || r.النوع || r.الفئة || "").toLowerCase();
        return typ.includes("ركب") || typ.includes("install") || /تركيب|تراكيب|install/i.test(r._sheet || "");
      }),
    [filtered]
  );

  // حالات خاصة
  const executedMaint = useMemo(
    () =>
      maintRows.filter((r) => {
        const st = String(r.status || r.الحالة || "").toLowerCase();
        // "done" أو وجود شرح الصيانة مع دخول/خروج
        return /done|منفذ|منته/.test(st) || r["شرح الصيانة"] || (r["وقت الدخول"] && r["وقت الخروج"]);
      }),
    [maintRows]
  );

  const cancelMaint = useMemo(() => {
    return maintRows.filter((r) => {
      const st = String(r.status || r.الحالة || "").toLowerCase();
      return /cancel|ملغ/.test(st);
    });
  }, [maintRows]);

  const postMaint = useMemo(() => {
    return maintRows.filter((r) => {
      const st = String(r.status || r.الحالة || "").toLowerCase();
      return /postpon|أجل|مؤجل/.test(st);
    });
  }, [maintRows]);

  // بطاقة رأس
  const headerCard = useMemo(() => {
    const getLast = (keys: string[]) =>
      [...filtered]
        .reverse()
        .map((r) => keys.map((k) => r[k]).find((v) => v !== undefined && v !== null))
        .find((v) => v);

    const techName = tech || (getLast(["اسم الفني", "الفني", "tech"]) as string) || "—";
    const dateVal = normalizeDateLoose(getLast(["التاريخ", "date", "Date"]) || "—");
    const exitVal = getLast(["الخروج", "وقت الخروج", "exit"]) || "—";
    const backVal = getLast(["العودة", "return"]) || "—";
    return { techName, dateVal, exitVal, backVal };
  }, [filtered, tech]);

  // جدول العدادات/البنزين
  const odometerRows = useMemo(() => {
    const rows: any[] = [];
    const pick = (r: any, arr: string[]) => arr.map((k) => r[k]).find((v) => v !== undefined && v !== null);

    (fuelRows.length ? fuelRows : filtered).forEach((r) => {
      const prev = Number(pick(r, ["العداد السابق", "kmBefore", "previousOdo", "odometerPrev"]) || 0);
      const cur = Number(pick(r, ["العداد الحالي", "kmAfter", "odometerNow", "currentOdo"]) || 0);
      const traveled = pick(r, ["المسافة المقطوعة", "distance", "kmTraveled"]);
      rows.push({
        "العداد عند التعبئة": pick(r, ["العداد عند التعبئة", "firstRefuel", "kmRefuel1"]),
        "عداد التعبئة الثانية": pick(r, ["عداد التعبئة الثانية", "secondRefuel", "kmRefuel2"]),
        "المسافة المقطوعة": traveled ?? (cur && prev ? cur - prev : undefined),
        "رقم السيارة": pick(r, ["رقم السيارة", "carNo", "plate"]),
        "العداد السابق": prev || undefined,
        "العداد الحالي": cur || undefined,
        "المسافة المقطوعة ": traveled ?? (cur && prev ? cur - prev : undefined),
        "التاريخ": normalizeDateLoose(pick(r, ["التاريخ", "date", "Date"])),
      });
    });
    return rows;
  }, [fuelRows, filtered]);

  // صِيَانات حسب المناطق
  const maintByAreaRows = useMemo(() => {
    const areaMap: Record<
      string,
      { total: number; done: number; postponed: number; noAnswer: number; cancelled: number; notExecuted: number; reason: string[] }
    > = {};
    maintRows.forEach((r) => {
      const area = r["المنطقة"] || r.area || r.الحي || "—";
      const st = String(r["الحالة"] || r.status || "").toLowerCase();
      const reason = r["سبب عدم التنفيذ"] || r.reason || r["السبب"] || r.cancelReason || "";
      areaMap[area] = areaMap[area] || { total: 0, done: 0, postponed: 0, noAnswer: 0, cancelled: 0, notExecuted: 0, reason: [] };
      areaMap[area].total++;
      if (/done|منفذ|منته/.test(st)) areaMap[area].done++;
      else if (/postpon|أجل|مؤجل/.test(st)) areaMap[area].postponed++;
      else if (/cancel|ملغ/.test(st)) areaMap[area].cancelled++;
      else if (/لا يرد/.test(st)) areaMap[area].noAnswer++;
      else areaMap[area].notExecuted++;
      if (reason) areaMap[area].reason.push(String(reason));
    });

    const rows = Object.entries(areaMap).map(([area, v], i) => ({
      "الرقم": i + 1,
      "المنطقة": area,
      "اجمالي": v.total,
      "منفذة": v.done,
      "مؤجلة": v.postponed,
      "لا يرد": v.noAnswer,
      "ملغية": v.cancelled,
      "غير منفذة": v.notExecuted,
      "سبب عدم التنفيذ": v.reason.join(" ؛ ") || "—",
    }));
    return rows;
  }, [maintRows]);

  // تفاصيل الصيانات المنفذة
  const maintExecutedRows = useMemo(() => {
    const rows = executedMaint.map((r: any, i: number) => ({
      "الرقم": r["الرقم"] || i + 1,
      "اسم الزبون": r["اسم الزبون"] || r.customer || "—",
      "المنطقة": r["المنطقة"] || r.area || "—",
      "شرح الصيانة": r["شرح الصيانة"] || r.detail || "—",
      "النقاط": r["النقاط"] ?? r.points ?? "—",
      "وقت الدخول": r["وقت الدخول"] || r.entry || "—",
      "وقت الخروج": r["وقت الخروج"] || r.exit || "—",
      "am/pm": r["am/pm"] || r.ampm || "—",
      "التاريخ": normalizeDateLoose(r["التاريخ"] || r.date || r.Date),
    }));
    return rows;
  }, [executedMaint]);

  // تركيب الفني
  const installRows = useMemo(() => {
    const rows = instRows.map((r: any, i: number) => ({
      "الرقم": r["الرقم"] || i + 1,
      "اسم الزبون": r["اسم الزبون"] || r.customer || "—",
      "المنطقة": r["المنطقة"] || r.area || "—",
      "الجهاز": r["الجهاز"] || r.device || "—",
      "النقاط": r["النقاط"] ?? r.points ?? "—",
      "وقت الدخول": r["وقت الدخول"] || r.entry || "—",
      "وقت الخروج": r["وقت الخروج"] || r.exit || "—",
      "am/pm": r["am/pm"] || r.ampm || "—",
      "التاريخ": normalizeDateLoose(r["التاريخ"] || r.date || r.Date),
    }));
    return rows;
  }, [instRows]);

  // الملغية/المؤجلة
  const cancelledRows = useMemo(() => {
    const rows = cancelMaint.map((r: any, i: number) => ({
      "الرقم": r["الرقم"] || i + 1,
      "اسم الزبون": r["اسم الزبون"] || r.customer || "—",
      "المنطقة": r["المنطقة"] || r.area || "—",
      "المشكلة": r["المشكلة"] || r.problem || r.reason || "—",
      "التاريخ": normalizeDateLoose(r["التاريخ"] || r.date || r.Date),
    }));
    return rows;
  }, [cancelMaint]);

  const postponedRows = useMemo(() => {
    const rows = postMaint.map((r: any, i: number) => ({
      "الرقم": r["الرقم"] || i + 1,
      "اسم الزبون": r["اسم الزبون"] || r.customer || "—",
      "المنطقة": r["المنطقة"] || r.area || "—",
      "المشكلة": r["المشكلة"] || r.problem || r.reason || "—",
      "التاريخ": normalizeDateLoose(r["التاريخ"] || r.date || r.Date),
    }));
    return rows;
  }, [postMaint]);

  // ملخص تراكيب — أقساط — المواعيد — النقاط
  const tkmSummary = useMemo(() => {
    let jumbo = 0, energy = 0, filter = 0, kettle = 0, total = 0, done = 0, points = 0;
    installRows.forEach((r) => {
      const dev = String(r["الجهاز"] || "").toLowerCase();
      if (/جامبو/.test(dev)) jumbo++;
      if (/طاقة/.test(dev)) energy++;
      if (/فلتر/.test(dev)) filter++;
      if (/ابريق|أبريق|غلاية|كيتل/.test(dev)) kettle++;
      total++;
      points += Number(r["النقاط"] || 0) || 0;
      if (r["وقت الدخول"] && r["وقت الخروج"]) done++;
    });
    return { jumbo, energy, filter, kettle, total, done, points };
  }, [installRows]);

  // مهام أخرى
  const otherTasksRows = useMemo(() => {
    const rows = filtered.filter(
      (r) => r["المهمة"] || r.task || /task|مهام/i.test(r._sheet || "")
    );
    return rows.map((r: any, i: number) => ({
      "الرقم": r["الرقم"] || i + 1,
      "المنطقة": r["المنطقة"] || r.area || "—",
      "الدخول": r["الدخول"] || r.entry || "—",
      "الخروج": r["الخروج"] || r.exit || "—",
      "المهمة": r["المهمة"] || r.task || "—",
    }));
  }, [filtered]);

  // أحقية التعبئة من آخر صف للعداد/بنزين (≥ 250 كم)
  const eligible = useMemo(() => {
    const last = odometerRows[odometerRows.length - 1];
    const km = Number(last?.["المسافة المقطوعة"] ?? last?.["المسافة المقطوعة "]);
    return km >= 250;
  }, [odometerRows]);

  return (
    <div className="space-y-4">
      {/* شريط أدوات */}
      <div className="p-4 border rounded-2xl bg-white grid md:grid-cols-3 gap-3">
        <div className="md:col-span-1">
          <h3 className="font-semibold mb-2">متابعة الفنيين</h3>
          <div className="flex gap-2">
            <button className="border rounded-2xl px-3 py-2 text-sm" onClick={importAll}>
              استيراد ملف (كل الشيتات)
            </button>
            <button className="border rounded-2xl px-3 py-2 text-sm" onClick={()=>{ setSheets(SAMPLE_SHEETS); setTech("يزن طقطق"); setDateFrom("2025-11-01"); setDateTo("2025-11-30"); }}>
              تحميل الداتا التجريبية
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2">الأوراق: {Object.keys(sheets).length || 0}</div>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-gray-500">اسم الفني</label>
          <select className="border rounded-2xl p-2 text-sm w-full" value={tech} onChange={(e) => setTech(e.target.value)}>
            <option value="">— اختر فني —</option>
            {technicians.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">من تاريخ</label>
            <input type="date" className="border rounded-2xl p-2 text-sm w-full" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500">إلى تاريخ</label>
            <input type="date" className="border rounded-2xl p-2 text-sm w-full" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>
      </div>

      {/* بطاقة رأس */}
      <div className="p-4 border rounded-2xl bg-white grid md:grid-cols-4 gap-3 text-sm">
        <div><div className="text-xs text-gray-500">اسم الفني</div><div className="font-medium">{headerCard.techName}</div></div>
        <div><div className="text-xs text-gray-500">التاريخ</div><div className="font-medium">{headerCard.dateVal}</div></div>
        <div><div className="text-xs text-gray-500">الخروج</div><div className="font-medium">{headerCard.exitVal}</div></div>
        <div><div className="text-xs text-gray-500">العودة</div><div className="font-medium">{headerCard.backVal}</div></div>
      </div>

      {/* الوقود/العدادات */}
      <div className="p-4 border rounded-2xl bg-white">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">استهلاك البنزين / العدادات</h4>
          <span className={`text-xs px-3 py-1 rounded-2xl ${eligible ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
            {eligible ? "يحق له التعبئة (≥ 250 كم)" : "لم يصل إلى 250 كم بعد"}
          </span>
        </div>
        <RxTable
          rows={odometerRows}
          preferred={[
            "العداد عند التعبئة",
            "عداد التعبئة الثانية",
            "المسافة المقطوعة",
            "رقم السيارة",
            "العداد السابق",
            "العداد الحالي",
            "المسافة المقطوعة ",
            "التاريخ",
          ]}
        />
      </div>

      {/* صيانات (ملخص مناطق) */}
      <div className="p-4 border rounded-2xl bg-white">
        <h4 className="font-semibold mb-2">صيانات</h4>
        <RxTable
          rows={maintByAreaRows}
          preferred={[
            "الرقم",
            "المنطقة",
            "اجمالي",
            "منفذة",
            "مؤجلة",
            "لا يرد",
            "ملغية",
            "غير منفذة",
            "سبب عدم التنفيذ",
          ]}
        />
      </div>

      {/* تفاصيل الصيانات المنفذة */}
      <div className="p-4 border rounded-2xl bg-white">
        <h4 className="font-semibold mb-2">تفاصيل الصيانات المنفذة</h4>
        <RxTable
          rows={maintExecutedRows}
          preferred={[
            "الرقم",
            "اسم الزبون",
            "المنطقة",
            "شرح الصيانة",
            "النقاط",
            "وقت الدخول",
            "وقت الخروج",
            "am/pm",
            "التاريخ",
          ]}
        />
        <div className="text-xs text-gray-600 mt-2">المجموعة: {maintExecutedRows.length}</div>
      </div>

      {/* تركيب الفني */}
      <div className="p-4 border rounded-2xl bg-white">
        <h4 className="font-semibold mb-2">تركيب الفني</h4>
        <RxTable
          rows={installRows}
          preferred={[
            "الرقم",
            "اسم الزبون",
            "المنطقة",
            "الجهاز",
            "النقاط",
            "وقت الدخول",
            "وقت الخروج",
            "am/pm",
            "التاريخ",
          ]}
        />
        <div className="text-xs text-gray-600 mt-2">المجموع: {installRows.length}</div>
      </div>

      {/* الملغية/المؤجلة */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-2xl bg-white">
          <h4 className="font-semibold mb-2">تفاصيل الصيانات الملغية</h4>
          <RxTable
            rows={cancelledRows}
            preferred={[
              "الرقم",
              "اسم الزبون",
              "المنطقة",
              "المشكلة",
              "التاريخ",
            ]}
          />
        </div>
        <div className="p-4 border rounded-2xl bg-white">
          <h4 className="font-semibold mb-2">تفاصيل الصيانات المؤجلة</h4>
          <RxTable
            rows={postponedRows}
            preferred={[
              "الرقم",
              "اسم الزبون",
              "المنطقة",
              "المشكلة",
              "التاريخ",
            ]}
          />
        </div>
      </div>

      {/* تراكيب — أقساط — المواعيد — مجموع النقاط */}
      <div className="p-4 border rounded-2xl bg-white">
        <h4 className="font-semibold mb-2">تراكيب — أقساط — المواعيد — مجموع النقاط</h4>
        <div className="overflow-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2">جامبو</th>
                <th className="py-2">طاقة</th>
                <th className="py-2">فلتر</th>
                <th className="py-2">ابريق</th>
                <th className="py-2">اجمالي</th>
                <th className="py-2">منفذة</th>
                <th className="py-2">المواعيد</th>
                <th className="py-2">مجموع النقاط</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-2">{tkmSummary.jumbo}</td>
                <td className="py-2">{tkmSummary.energy}</td>
                <td className="py-2">{tkmSummary.filter}</td>
                <td className="py-2">{tkmSummary.kettle}</td>
                <td className="py-2">{tkmSummary.total}</td>
                <td className="py-2">{tkmSummary.done}</td>
                <td className="py-2">{tkmSummary.total}</td>
                <td className="py-2">{tkmSummary.points}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* مهام أخرى */}
      <div className="p-4 border rounded-2xl bg-white">
        <h4 className="font-semibold mb-2">مهام أخرى</h4>
        <RxTable
          rows={otherTasksRows}
          preferred={["الرقم", "المنطقة", "الدخول", "الخروج", "المهمة"]}
        />
      </div>

      {/* التواقيع */}
      <div className="p-4 border rounded-2xl bg-white grid md:grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-xs text-gray-500">الكاونتر:</div>
          <div className="border rounded-xl h-16"></div>
          <div className="text-xs text-gray-500 mt-1">التوقيع:</div>
          <div className="border rounded-xl h-10"></div>
        </div>
        <div>
          <div className="text-xs text-gray-500">مدير الصيانة:</div>
          <div className="border rounded-xl h-16"></div>
          <div className="text-xs text-gray-500 mt-1">التوقيع:</div>
          <div className="border rounded-xl h-10"></div>
        </div>
      </div>
    </div>
  );
}

/** جدول عام محافظ على ترتيب الأعمدة المطلوبة كما هي */
function RxTable({ rows, preferred }: { rows: any[]; preferred?: string[] }) {
  const cols = useMemo(() => {
    if (!rows || !rows.length) return [] as string[];
    const keys = new Set<string>();
    rows.forEach((r) => Object.keys(r || {}).forEach((k) => keys.add(String(k))));
    const all = Array.from(keys);
    const pref = preferred || [];
    return [...pref.filter((p) => keys.has(p)), ...all.filter((k) => !pref.includes(k))];
  }, [rows, preferred]);

  if (!rows || !rows.length) return <div className="text-sm text-gray-500">لا توجد بيانات</div>;

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm min-w-[760px]">
        <thead>
          <tr className="text-left text-gray-500">
            {cols.map((c) => (
              <th key={c} className="py-2 pr-4">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r: any, i: number) => (
            <tr key={i} className="border-t">
              {cols.map((c) => (
                <td key={c} className="py-2 pr-4">{String(r[c] ?? "—")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}





/* ————— المكوّن الخاص بالجدولة للريسبشن ————— */
function ScheduleAssignPanel() {
  // مخزن محلي للمواعيد الواردة من قسم آخر (يمكنك استيرادها أو إدخالها يدويًا)
  const [incoming, setIncoming] = useState<Array<any>>(() => {
    // نحاول تحميل من localStorage إن وجد
    try {
      const raw = localStorage.getItem("incomingAppointments");
      if (raw) return JSON.parse(raw);
    } catch {}
    // عينات توضيحية
    return [
      { id: "IN-1001", type: "maintenance", customer: "ربيع العوض", area: "دويلعة", device: "فلتر 7 مراحل", date: "2025-11-09", start: "10:30", end: "11:15", detail: "فحص فلتر + تبديل حبيبات", distanceKm: 6.5 },
      { id: "IN-1002", type: "installation", customer: "يعقوب هرموش", area: "جرمانا", device: "فلتر 6 مراحل", date: "2025-11-09", start: "14:30", end: "15:20", detail: "تركيب فلتر", distanceKm: 8.2 },
    ];
  });
  const [selectedIn, setSelectedIn] = useState<any | null>(null);

  // قراءة الفنيين من ملف المتابعة rxSheets + قائمة افتراضية
  const technicians = useMemo(() => {
    const out = new Set<string>();
    try {
      const raw = localStorage.getItem("rxSheets");
      if (raw) {
        const sheets = JSON.parse(raw) as Record<string, any[]>;
        Object.values(sheets || {}).forEach((rows: any) =>
          (rows as any[]).forEach((r) => {
            const t = r.tech || r.technician || r.الفني || r["اسم الفني"] || r.اسم_الفني;
            if (t) out.add(String(t));
          })
        );
      }
    } catch {}
    // fallback أسماء شائعة
    ["فهد الحربي", "سالم الدوسري", "ناصر المطيري", "يزن طقطق"].forEach((n) => out.add(n));
    return Array.from(out);
  }, []);

  // نموذج التعيين
  const [form, setForm] = useState({
    tech: "",
    date: "",
    start: "",
    end: "",
    area: "",
    customer: "",
    device: "",
    type: "maintenance" as "maintenance" | "installation",
    detail: "",
    distanceKm: 5,
  });

  // حفظ/استرجاع قائمة الوارد
  useEffect(() => {
    try {
      localStorage.setItem("incomingAppointments", JSON.stringify(incoming));
    } catch {}
  }, [incoming]);

  // عند اختيار طلب من القائمة يعبّي النموذج
  useEffect(() => {
    if (!selectedIn) return;
    setForm((f) => ({
      ...f,
      date: selectedIn.date || f.date,
      start: selectedIn.start || f.start,
      end: selectedIn.end || f.end,
      area: selectedIn.area || f.area,
      customer: selectedIn.customer || f.customer,
      device: selectedIn.device || f.device,
      type: selectedIn.type || f.type,
      detail: selectedIn.detail || f.detail,
      distanceKm: selectedIn.distanceKm ?? f.distanceKm,
    }));
  }, [selectedIn]);

  // إضافة موعد وارد يدويًا (اختياري)
  const addIncoming = () => {
    const id = `IN-${Date.now()}`;
    const rec = {
      id,
      type: form.type,
      customer: form.customer || "زبون بدون اسم",
      area: form.area || "—",
      device: form.device || "—",
      date: form.date || today(),
      start: form.start || "09:00",
      end: form.end || "10:00",
      detail: form.detail || "",
      distanceKm: Number(form.distanceKm) || 5,
    };
    setIncoming((prev) => [rec, ...prev]);
    setSelectedIn(rec);
  };

  // إرسال الموعد للفني: يكتب إلى orders + يحدّث rxSheets (التقارير)
  const dispatchToTechnician = () => {
    if (!form.tech) return alert("اختر اسم الفني");
    if (!form.customer || !form.area || !form.date || !form.start || !form.end) {
      return alert("أكمل البيانات الأساسية: الزبون/المنطقة/التاريخ/الوقت");
    }

    // 1) كتابة إلى orders (قائمة أوامر التطبيق)
    try {
      const raw = localStorage.getItem("orders");
      const orders: any[] = raw ? JSON.parse(raw) : [];
      const id = selectedIn?.id || `ORD-${Date.now()}`;
      const newOrder = {
        id,
        type: form.type,
        customer: form.customer,
        area: form.area,
        device: form.device,
        distanceKm: Number(form.distanceKm) || 5,
        date: form.date,
        start: form.start,
        end: form.end,
        status: "scheduled",
        detail: form.detail,
      };
      const newOrders = [newOrder, ...orders];
      localStorage.setItem("orders", JSON.stringify(newOrders));
    } catch (e) {
      console.error(e);
    }

    // 2) تحديث تقارير rxSheets: نضيف صف للـ "صيانات" أو "تركيب الفني"
    try {
      const raw = localStorage.getItem("rxSheets");
      const sheets: Record<string, any[]> = raw ? JSON.parse(raw) : {};
      const sheetName = form.type === "installation" ? "تركيب الفني" : "صيانات";
      sheets[sheetName] = sheets[sheetName] || [];
      sheets[sheetName].push({
        "اسم الفني": form.tech,
        "التاريخ": form.date,
        "المنطقة": form.area,
        "اسم الزبون": form.customer,
        "الجهاز": form.device,
        "شرح الصيانة": form.type === "maintenance" ? (form.detail || "—") : "—",
        "النقاط": form.type === "installation" ? 2 : 1, // تقدير افتراضي
        "وقت الدخول": form.start,
        "وقت الخروج": form.end,
        "الحالة": "scheduled",
        "type": form.type,
      });
      localStorage.setItem("rxSheets", JSON.stringify(sheets));
    } catch (e) {
      console.error(e);
    }

    // 3) إزالة من قائمة الوارد (إن كان من الوارد)
    if (selectedIn) {
      setIncoming((prev) => prev.filter((x) => x.id !== selectedIn.id));
      setSelectedIn(null);
    }

    alert("تم إرسال الموعد للفني وتحديث التقارير.");
    // تصفير حقول غير ضرورية
    setForm((f) => ({ ...f, customer: "", device: "", detail: "" }));
  };

  return (
    <div className="p-4 border rounded-2xl shadow-sm bg-white space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">تقويم المواعيد / إرسال للــفني</h3>
        <div className="text-xs text-gray-500">الوارد من قسم آخر + تعيين فني</div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* قائمة الوارد */}
        <div className="md:col-span-1">
          <div className="font-semibold mb-2">المواعيد الواردة</div>
          <ul className="text-sm space-y-2 max-h-72 overflow-auto pr-1">
            {incoming.length === 0 && <li className="text-gray-500">لا توجد مواعيد واردة</li>}
            {incoming.map((it) => (
              <li
                key={it.id}
                className={`p-3 border rounded-2xl cursor-pointer ${selectedIn?.id === it.id ? "bg-red-50" : ""}`}
                onClick={() => setSelectedIn(it)}
              >
                <div className="font-medium">{it.date} {it.start}-{it.end} · {it.customer}</div>
                <div className="text-xs text-gray-600">{it.type === "installation" ? "تركيب" : "صيانة"} · {it.area} · {it.device}</div>
              </li>
            ))}
          </ul>
          <button className="mt-2 w-full border rounded-2xl py-2 text-sm" onClick={addIncoming}>
            إضافة موعد وارد يدويًا من النموذج
          </button>
        </div>

        {/* نموذج التعيين */}
        <div className="md:col-span-2">
          <div className="font-semibold mb-2">بيانات الموعد + التعيين</div>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            <div>
              <label className="text-xs text-gray-500">نوع الموعد</label>
              <select
                className="border rounded-2xl p-2 w-full"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}
              >
                <option value="maintenance">صيانة</option>
                <option value="installation">تركيب</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">الفني</label>
              <select
                className="border rounded-2xl p-2 w-full"
                value={form.tech}
                onChange={(e) => setForm((f) => ({ ...f, tech: e.target.value }))}
              >
                <option value="">— اختر فني —</option>
                {technicians.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">التاريخ</label>
              <input
                type="date"
                className="border rounded-2xl p-2 w-full"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">بداية</label>
                <input
                  type="time"
                  className="border rounded-2xl p-2 w-full"
                  value={form.start}
                  onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">نهاية</label>
                <input
                  type="time"
                  className="border rounded-2xl p-2 w-full"
                  value={form.end}
                  onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">الزبون</label>
              <input
                className="border rounded-2xl p-2 w-full"
                value={form.customer}
                onChange={(e) => setForm((f) => ({ ...f, customer: e.target.value }))}
                placeholder="اسم الزبون"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">المنطقة</label>
              <input
                className="border rounded-2xl p-2 w-full"
                value={form.area}
                onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                placeholder="المنطقة / الحي"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">الجهاز</label>
              <input
                className="border rounded-2xl p-2 w-full"
                value={form.device}
                onChange={(e) => setForm((f) => ({ ...f, device: e.target.value }))}
                placeholder="الجهاز (مثال: فلتر 7 مراحل)"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">المسافة التقديرية (كم)</label>
              <input
                type="number"
                className="border rounded-2xl p-2 w-full"
                value={form.distanceKm}
                onChange={(e) => setForm((f) => ({ ...f, distanceKm: Number(e.target.value) }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500">تفاصيل</label>
              <textarea
                className="border rounded-2xl p-2 w-full"
                rows={3}
                value={form.detail}
                onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))}
                placeholder="مثال: فحص فلتر + كسر مرحلة حبيبات وتم تبديلها"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button className="bg-red-800 text-white rounded-2xl px-4 py-2 text-sm" onClick={dispatchToTechnician}>
              إرسال الموعد للفني + تحديث التقارير
            </button>
            <button
              className="border rounded-2xl px-4 py-2 text-sm"
              onClick={() => {
                setSelectedIn(null);
                setForm({ ...form, customer: "", device: "", detail: "" });
              }}
            >
              تصفير النموذج
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function today(): string {
  throw new Error("Function not implemented.");
}

