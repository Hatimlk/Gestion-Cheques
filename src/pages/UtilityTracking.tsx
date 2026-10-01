import { Fragment, useEffect, useMemo, useState } from 'react';
import { BarChart3, Droplets, Pencil, Plus, Trash2, Wifi, X, Zap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { api } from '@/lib/api';
import { useApp } from '@/lib/AppContext';

type Unit = 'GLOBAL' | 'G1' | 'G2' | 'G3' | 'G5';
type RecordItem = {
  id: number; period: string; unit: Unit;
  electricityAmount: number | null; electricityConsumption: number | null;
  waterAmount1: number | null; waterConsumption1: number | null;
  waterAmount2: number | null; waterConsumption2: number | null;
  iamFixed: number | null; iamMobile: number | null; notes: string | null;
};

const emptyForm = { period: new Date().toISOString().slice(0, 7), unit: 'G2' as Unit,
  electricityAmount: '', electricityConsumption: '', waterAmount1: '', waterConsumption1: '',
  waterAmount2: '', waterConsumption2: '', iamFixed: '', iamMobile: '', notes: '' };

const money = (value: number) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 2 }).format(value);
const monthLabel = (period: string) => new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(`${period.slice(0, 7)}-02T12:00:00`));
const n = (value: number | null | undefined) => Number(value || 0);

export function UtilityTracking() {
  const { currentUser } = useApp();
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const canEdit = currentUser?.role === 'Administrateur' || currentUser?.name?.trim().toLowerCase() === 'leila' || currentUser?.email?.toLowerCase().startsWith('leila@');

  const load = async () => {
    try { setRecords(await api.get<RecordItem[]>('/utility-tracking')); }
    catch (err) { setError(err instanceof Error ? err.message : 'Chargement impossible.'); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    load();
    const refresh = () => load();
    const interval = window.setInterval(refresh, 15000);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const years = useMemo(() => Array.from(new Set(records.map(r => r.period.slice(0, 4)))).sort().reverse(), [records]);
  useEffect(() => { if (years.length && !years.includes(year)) setYear(years[0]); }, [years, year]);

  const monthly = useMemo(() => {
    const result = new Map<string, { period: string; electricity: number; water: number; iam: number; consumptionKwh: number; consumptionM3: number; globalElectricity: number | null; globalWater: number | null }>();
    records.filter(r => r.period.startsWith(year)).forEach(r => {
      const row = result.get(r.period) || { period: r.period, electricity: 0, water: 0, iam: 0, consumptionKwh: 0, consumptionM3: 0, globalElectricity: null, globalWater: null };
      if (r.unit === 'GLOBAL') {
        row.globalElectricity = r.electricityAmount;
        row.globalWater = n(r.waterAmount1) + n(r.waterAmount2);
        row.iam = n(r.iamFixed) + n(r.iamMobile);
      } else {
        row.electricity += n(r.electricityAmount);
        row.water += n(r.waterAmount1) + n(r.waterAmount2);
        row.consumptionKwh += n(r.electricityConsumption);
        row.consumptionM3 += n(r.waterConsumption1) + n(r.waterConsumption2);
      }
      result.set(r.period, row);
    });
    return [...result.values()].map(row => ({ ...row,
      electricity: row.globalElectricity ?? row.electricity,
      water: row.globalWater ?? row.water,
    })).sort((a, b) => a.period.localeCompare(b.period));
  }, [records, year]);

  const totals = monthly.reduce((a, r) => ({ electricity: a.electricity + r.electricity, water: a.water + r.water, iam: a.iam + r.iam }), { electricity: 0, water: 0, iam: 0 });
  const tableGroups = useMemo(() => {
    const periods = new Map<string, { global?: RecordItem; units: RecordItem[] }>();
    records.filter(r => r.period.startsWith(year)).forEach(item => {
      const group = periods.get(item.period) || { units: [] };
      if (item.unit === 'GLOBAL') group.global = item;
      else group.units.push(item);
      periods.set(item.period, group);
    });
    return [...periods.entries()].sort(([a], [b]) => b.localeCompare(a)).map(([period, group]) => ({
      period, global: group.global, units: group.units.sort((a, b) => a.unit.localeCompare(b.unit)),
    }));
  }, [records, year]);
  const openNew = () => { setEditingId(null); setForm({ ...emptyForm, period: `${year}-${String(Math.min(12, monthly.length + 1)).padStart(2, '0')}` }); setError(''); setModalOpen(true); };
  const openEdit = (item: RecordItem) => {
    setEditingId(item.id);
    setForm({ period: item.period.slice(0, 7), unit: item.unit,
      electricityAmount: item.electricityAmount?.toString() || '', electricityConsumption: item.electricityConsumption?.toString() || '',
      waterAmount1: item.waterAmount1?.toString() || '', waterConsumption1: item.waterConsumption1?.toString() || '',
      waterAmount2: item.waterAmount2?.toString() || '', waterConsumption2: item.waterConsumption2?.toString() || '',
      iamFixed: item.iamFixed?.toString() || '', iamMobile: item.iamMobile?.toString() || '', notes: item.notes || '' });
    setError(''); setModalOpen(true);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const payload = Object.fromEntries(Object.entries(form).map(([key, value]) => key === 'period' ? [key, `${value}-01`] : [key, value]));
      await api.post('/utility-tracking', payload); await load(); setModalOpen(false);
    } catch (err) { setError(err instanceof Error ? err.message : 'Enregistrement impossible.'); }
    finally { setSaving(false); }
  };
  const remove = async (id: number) => {
    if (!confirm('Supprimer cette ligne de suivi ?')) return;
    await api.delete(`/utility-tracking/${id}`); setRecords(prev => prev.filter(r => r.id !== id));
  };

  return <div className="space-y-6 pb-10">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-blue-600"><BarChart3 className="h-4 w-4" /> Suivi des charges</div>
        <h1 className="text-2xl font-bold text-slate-900">Eau, électricité & abonnements IAM</h1>
        <p className="mt-1 text-sm text-slate-500">Historique issu du fichier de suivi et saisie mensuelle par unité.</p></div>
      <div className="flex gap-3"><select value={year} onChange={e => setYear(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
        {(years.length ? years : [year]).map(y => <option key={y}>{y}</option>)}</select>
        {canEdit && <button onClick={openNew} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"><Plus className="h-4 w-4" /> Nouvelle saisie</button>}</div>
    </div>

    {error && !modalOpen && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <div className="grid gap-4 md:grid-cols-3">
      <Metric icon={Zap} label="Électricité" value={money(totals.electricity)} tone="amber" />
      <Metric icon={Droplets} label="Eau" value={money(totals.water)} tone="blue" />
      <Metric icon={Wifi} label="Abonnements IAM" value={money(totals.iam)} tone="violet" />
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-5 font-bold text-slate-800">Évolution mensuelle des montants</h2>
      <div className="h-72">{monthly.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={monthly} margin={{ left: 8, right: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="period" tickFormatter={v => monthLabel(v).slice(0, 3)} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 11 }} /><Tooltip labelFormatter={v => monthLabel(String(v))} formatter={v => money(Number(v || 0))} /><Legend />
        <Bar dataKey="electricity" name="Électricité" fill="#f59e0b" radius={[4,4,0,0]} /><Bar dataKey="water" name="Eau" fill="#3b82f6" radius={[4,4,0,0]} /><Bar dataKey="iam" name="IAM" fill="#8b5cf6" radius={[4,4,0,0]} />
      </BarChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-sm text-slate-400">Aucune donnée pour cette année.</div>}</div>
    </div>

    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-800">Détail des relevés</h2></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1450px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr>
        <th className="px-3 py-3">Mois</th><th className="px-3 py-3">Unité</th><th className="px-3 py-3 text-right">Élec. montant</th><th className="px-3 py-3 text-right">Conso. kWh</th><th className="px-3 py-3 text-right">Total élec.</th>
        <th className="px-3 py-3 text-right">Eau 1 montant</th><th className="px-3 py-3 text-right">Eau 1 m³</th><th className="px-3 py-3 text-right">Eau 2 montant</th><th className="px-3 py-3 text-right">Eau 2 m³</th><th className="px-3 py-3 text-right">Total eau</th><th className="px-3 py-3 text-right">IAM fixe</th><th className="px-3 py-3 text-right">IAM mobile</th>{canEdit && <th className="px-3 py-3 text-right">Actions</th>}</tr></thead>
        <tbody>{loading ? <tr><td colSpan={13} className="p-10 text-center text-slate-400">Chargement…</td></tr> : tableGroups.map(group => <Fragment key={group.period}>{group.units.map((item, index) => <tr key={item.id} className={`border-b border-slate-100 hover:bg-slate-50/70 ${index === 0 ? 'border-t-2 border-t-slate-200' : ''}`}>
          {index === 0 && <td rowSpan={group.units.length} className="w-36 bg-slate-50/60 px-3 py-3 align-top font-bold capitalize text-slate-800"><div className="flex items-center gap-1">{monthLabel(group.period)}{canEdit && group.global && <button onClick={() => openEdit(group.global!)} className="rounded p-1 text-slate-400 hover:text-blue-600" title="Modifier les totaux et IAM"><Pencil className="h-3.5 w-3.5" /></button>}</div></td>}
          <td className="px-3 py-3"><span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{item.unit}</span></td>
          <td className="px-3 py-3 text-right font-semibold">{item.electricityAmount != null ? money(item.electricityAmount) : '—'}</td><td className="px-3 py-3 text-right text-slate-600">{item.electricityConsumption ?? '—'}</td>
          {index === 0 && <td rowSpan={group.units.length} className="bg-amber-50/40 px-3 py-3 text-right align-middle font-bold text-amber-800">{group.global?.electricityAmount != null ? money(group.global.electricityAmount) : '—'}</td>}
          <td className="px-3 py-3 text-right">{item.waterAmount1 != null ? money(item.waterAmount1) : '—'}</td><td className="px-3 py-3 text-right text-slate-600">{item.waterConsumption1 ?? '—'}</td><td className="px-3 py-3 text-right">{item.waterAmount2 != null ? money(item.waterAmount2) : '—'}</td><td className="px-3 py-3 text-right text-slate-600">{item.waterConsumption2 ?? '—'}</td>
          {index === 0 && <td rowSpan={group.units.length} className="bg-blue-50/40 px-3 py-3 text-right align-middle font-bold text-blue-800">{group.global?.waterAmount1 != null ? money(group.global.waterAmount1) : '—'}</td>}
          {index === 0 && <td rowSpan={group.units.length} className="bg-violet-50/40 px-3 py-3 text-right align-middle font-semibold text-violet-800">{group.global?.iamFixed != null ? money(group.global.iamFixed) : '—'}</td>}
          {index === 0 && <td rowSpan={group.units.length} className="bg-violet-50/40 px-3 py-3 text-right align-middle font-semibold text-violet-800">{group.global?.iamMobile != null ? money(group.global.iamMobile) : '—'}</td>}
          {canEdit && <td className="px-3 py-3"><div className="flex justify-end gap-1"><button onClick={() => openEdit(item)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="Modifier"><Pencil className="h-4 w-4" /></button><button onClick={() => remove(item.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Supprimer"><Trash2 className="h-4 w-4" /></button></div></td>}
        </tr>)}</Fragment>)}</tbody></table></div>
    </div>

    {modalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"><form onSubmit={submit} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
      <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4"><div><h2 className="font-bold text-slate-900">{editingId ? 'Modifier le relevé' : 'Nouvelle saisie mensuelle'}</h2><p className="text-xs text-slate-500">Une ligne par unité ; utilisez « Totaux / IAM » uniquement pour la synthèse du mois.</p></div><button type="button" onClick={() => setModalOpen(false)} className="rounded-lg p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
      <div className="grid gap-5 p-6 sm:grid-cols-2"><Field label="Mois"><input required type="month" value={form.period} onChange={e => setForm({...form, period:e.target.value})} className="input" /></Field><Field label="Unité"><select value={form.unit} onChange={e => setForm({...form, unit:e.target.value as Unit})} className="input"><option value="GLOBAL">Totaux / IAM du mois</option><option>G1</option><option>G2</option><option>G3</option><option>G5</option></select></Field>
        <Section title="Électricité" /><NumberField label="Montant (MAD)" name="electricityAmount" form={form} setForm={setForm} /><NumberField label="Consommation (kWh)" name="electricityConsumption" form={form} setForm={setForm} />
        <Section title="Eau — compteur 1" /><NumberField label="Montant (MAD)" name="waterAmount1" form={form} setForm={setForm} /><NumberField label="Consommation (m³)" name="waterConsumption1" form={form} setForm={setForm} />
        <Section title="Eau — compteur 2" /><NumberField label="Montant (MAD)" name="waterAmount2" form={form} setForm={setForm} /><NumberField label="Consommation (m³)" name="waterConsumption2" form={form} setForm={setForm} />
        <Section title="Maroc Telecom" /><NumberField label="Internet / fixe (MAD)" name="iamFixed" form={form} setForm={setForm} /><NumberField label="Mobile (MAD)" name="iamMobile" form={form} setForm={setForm} />
        <div className="sm:col-span-2"><Field label="Observation"><textarea value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} rows={3} className="input resize-none" /></Field></div>
        {error && <div className="sm:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      </div><div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4"><button type="button" onClick={() => setModalOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Annuler</button><button disabled={saving} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? 'Enregistrement…' : 'Enregistrer'}</button></div>
    </form></div>}
  </div>;
}

function Metric({ icon: Icon, label, value, tone }: { icon: typeof Zap; label: string; value: string; tone: 'amber'|'blue'|'violet' }) {
  const colors = { amber:'bg-amber-50 text-amber-600', blue:'bg-blue-50 text-blue-600', violet:'bg-violet-50 text-violet-600' };
  return <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className={`rounded-xl p-3 ${colors[tone]}`}><Icon className="h-6 w-6" /></div><div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-xl font-bold text-slate-900">{value}</p></div></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span>{children}</label>; }
function Section({ title }: { title: string }) { return <div className="sm:col-span-2 -mb-2 border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-wider text-blue-600">{title}</div>; }
function NumberField({ label, name, form, setForm }: { label:string; name:keyof typeof emptyForm; form:typeof emptyForm; setForm:React.Dispatch<React.SetStateAction<typeof emptyForm>> }) { return <Field label={label}><input type="number" min="0" step="0.01" value={form[name]} onChange={e => setForm({...form,[name]:e.target.value})} className="input" placeholder="0,00" /></Field>; }
