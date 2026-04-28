import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Offer {
  id: number;
  status: string;
  company: string;
  account: string;
  shifts: string;
  interview: string;
  location: string;
  graduation: string;
  nationality: string;
  max_age: number | null;
  language: string;
  language_requirement: string;
  salary: string;
  process: string;
  training: string;
  details: string;
  location_type: string;
  target_language: string;
  contact_whatsapp: string;
  contact_phone: string;
  contact_email: string;
  contact_note: string;
  sort_order: number;
}

const empty: Omit<Offer, 'id'> = {
  status: 'Active',
  company: '',
  account: '',
  shifts: '',
  interview: '',
  location: '',
  graduation: '',
  nationality: '',
  max_age: null,
  language: '',
  language_requirement: 'B2',
  salary: '',
  process: '',
  training: '',
  details: '',
  location_type: 'office',
  target_language: 'english',
  contact_whatsapp: '',
  contact_phone: '',
  contact_email: '',
  contact_note: '',
  sort_order: 0,
};

export default function Admin() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Offer, 'id'>>(empty);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [editOffer, setEditOffer] = useState<Offer | null>(null);
  const [editForm, setEditForm] = useState<Omit<Offer, 'id'>>(empty);
  const [updating, setUpdating] = useState(false);
  const [rowAnim, setRowAnim] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'Active' | 'Hold' | 'Inactive'>('all');

  // Password gate state
  const [accessModalOpen, setAccessModalOpen] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [pwAttempts, setPwAttempts] = useState(0);
  const [pwError, setPwError] = useState('');
  const [pwLocked, setPwLocked] = useState(false);

  const fetchOffers = async () => {
    setLoading(true);
    const { data } = await supabase.from('offers').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true });
    setOffers(data || []);
    setLoading(false);
    setTimeout(() => setRowAnim(true), 50);
  };

  useEffect(() => { fetchOffers(); }, []);

  const toggleStatus = async (id: number, current: string) => {
    const next = current === 'Active' ? 'Hold' : 'Active';
    await supabase.from('offers').update({ status: next }).eq('id', id);
    setOffers(prev => prev.map(o => o.id === id ? { ...o, status: next } : o));
  };

  const deleteOffer = async (id: number) => {
    if (!confirm('متأكد إنك عايز تمسح الـ offer ده؟')) return;
    await supabase.from('offers').delete().eq('id', id);
    setOffers(prev => prev.filter(o => o.id !== id));
  };

  const moveOffer = async (id: number, dir: 'up' | 'down') => {
    const list = [...offers];
    const idx = list.findIndex(o => o.id === id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return;
    [list[idx], list[swapIdx]] = [list[swapIdx], list[idx]];
    const updated = list.map((o, i) => ({ ...o, sort_order: i }));
    setOffers(updated);
    await Promise.all(updated.map(o => supabase.from('offers').update({ sort_order: o.sort_order }).eq('id', o.id)));
  };

  const handleSave = async () => {
    if (!form.company || !form.account) return alert('الـ Company والـ Account مطلوبين!');
    setSaving(true);
    await supabase.from('offers').insert([form]);
    setForm(empty);
    setShowForm(false);
    await fetchOffers();
    setSaving(false);
  };

  const openEdit = (offer: Offer) => {
    setEditOffer(offer);
    const { id, ...rest } = offer;
    setEditForm(rest);
  };

  const closeEdit = () => {
    setEditOffer(null);
    setEditForm(empty);
  };

  const handleUpdate = async () => {
    if (!editOffer) return;
    if (!editForm.company || !editForm.account) return alert('الـ Company والـ Account مطلوبين!');
    setUpdating(true);
    await supabase.from('offers').update(editForm).eq('id', editOffer.id);
    setOffers(prev => prev.map(o => o.id === editOffer.id ? { ...o, ...editForm } : o));
    closeEdit();
    setUpdating(false);
  };

  // Handle password gate
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwLocked) return;
    const CORRECT = '201010';
    if (passwordInput === CORRECT) {
      setAccessModalOpen(false);
      setPwError('');
    } else {
      const newAttempts = pwAttempts + 1;
      setPwAttempts(newAttempts);
      setPasswordInput('');
      if (newAttempts >= 3) {
        setPwLocked(true);
        setPwError('');
      } else {
        setPwError(`Incorrect password. ${3 - newAttempts} attempt${3 - newAttempts === 1 ? '' : 's'} remaining.`);
      }
    }
  };

  const handleContactSupport = () => {
    const phone = '201283391426';
    const message = encodeURIComponent('Hello,\nThis VERXTEX Manger, I need to Change the Password');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const filtered = offers.filter(o => {
    const matchSearch = o.company.toLowerCase().includes(search.toLowerCase()) ||
      o.account.toLowerCase().includes(search.toLowerCase());
    const matchTab = filterTab === 'all' || o.status === filterTab;
    return matchSearch && matchTab;
  });

  const statusConfig: Record<string, { bg: string; color: string; border: string }> = {
    Active:   { bg: 'rgba(31,207,177,0.12)', color: '#1fcfb1', border: 'rgba(31,207,177,0.3)' },
    Hold:     { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
    Inactive: { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
  };

  const fieldList: [keyof Omit<Offer,'id'>, string][] = [
    ['company','Company *'], ['account','Account / Position *'],
    ['shifts','Shifts'], ['salary','Salary'],
    ['location','Location'], ['interview','Interview Process'],
    ['graduation','Graduation'], ['nationality','Nationality'],
    ['language','Language'], ['training','Training'],
    ['process','Process'],
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060608; }

        /* ── Page ── */
        .admin-wrapper {
          min-height: 100vh;
          background: #060608;
          color: #e8e8ec;
          font-family: 'Syne', sans-serif;
          padding: 2.5rem 2rem;
          position: relative;
          overflow-x: hidden;
        }

        /* subtle grid bg */
        .admin-wrapper::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(31,207,177,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(31,207,177,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }

        .admin-container {
          max-width: 1240px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
          animation: fadeUp 0.5s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Header ── */
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #161618;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .header-brand { display: flex; align-items: center; gap: 14px; }

        .brand-icon {
          width: 48px; height: 48px;
          background: linear-gradient(135deg, #1fcfb1 0%, #0d9e87 100%);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          box-shadow: 0 0 32px rgba(31,207,177,0.4), 0 0 8px rgba(31,207,177,0.2);
          animation: glowPulse 3s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 32px rgba(31,207,177,0.4), 0 0 8px rgba(31,207,177,0.2); }
          50%      { box-shadow: 0 0 48px rgba(31,207,177,0.6), 0 0 16px rgba(31,207,177,0.3); }
        }

        .brand-text h1 {
          font-size: 1.6rem;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: #fff;
        }

        .brand-text p {
          font-size: 12px;
          color: #444;
          font-weight: 600;
          letter-spacing: 0.05em;
          margin-top: 3px;
        }

        .brand-text span { color: #1fcfb1; }

        .header-actions { display: flex; gap: 10px; flex-wrap: wrap; }

        .btn-ghost {
          padding: 10px 20px;
          border-radius: 10px;
          border: 1px solid #222;
          color: #666;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.03em;
          transition: all 0.2s;
          background: transparent;
          cursor: pointer;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .btn-ghost:hover { border-color: #333; color: #ccc; background: rgba(255,255,255,0.04); }

        .btn-primary {
          padding: 10px 22px;
          border-radius: 10px;
          background: #1fcfb1;
          color: #000;
          font-weight: 800;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.04em;
          transition: all 0.25s;
          box-shadow: 0 0 20px rgba(31,207,177,0.3);
          display: inline-flex; align-items: center; gap: 6px;
        }
        .btn-primary:hover {
          background: #26e8ca;
          box-shadow: 0 0 40px rgba(31,207,177,0.5);
          transform: translateY(-2px);
        }
        .btn-primary:active { transform: translateY(0); }

        /* ── Stats ── */
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: #0c0c0f;
          border: 1px solid #1a1a1e;
          border-radius: 16px;
          padding: 18px 20px;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
          cursor: default;
          position: relative;
          overflow: hidden;
          animation: fadeUp 0.5s ease both;
        }
        .stat-card:nth-child(1) { animation-delay: 0.05s; }
        .stat-card:nth-child(2) { animation-delay: 0.1s; }
        .stat-card:nth-child(3) { animation-delay: 0.15s; }
        .stat-card:nth-child(4) { animation-delay: 0.2s; }

        .stat-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          border-radius: 16px 16px 0 0;
          opacity: 0;
          transition: opacity 0.25s;
        }
        .stat-card:nth-child(1)::after { background: linear-gradient(90deg, #1fcfb1, transparent); }
        .stat-card:nth-child(2)::after { background: linear-gradient(90deg, #1fcfb1, transparent); }
        .stat-card:nth-child(3)::after { background: linear-gradient(90deg, #f59e0b, transparent); }
        .stat-card:nth-child(4)::after { background: linear-gradient(90deg, #ef4444, transparent); }

        .stat-card:hover { border-color: #2a2a30; transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
        .stat-card:hover::after { opacity: 1; }

        .stat-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #3a3a44;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: #fff;
          line-height: 1;
        }

        .stat-value.teal { color: #1fcfb1; text-shadow: 0 0 20px rgba(31,207,177,0.4); }
        .stat-value.amber { color: #f59e0b; text-shadow: 0 0 20px rgba(245,158,11,0.4); }
        .stat-value.red { color: #ef4444; text-shadow: 0 0 20px rgba(239,68,68,0.4); }

        /* ── Add Form ── */
        .add-form {
          background: #0c0c0f;
          border: 1px solid #1e1e24;
          border-top: 2px solid #1fcfb1;
          border-radius: 18px;
          padding: 2rem;
          margin-bottom: 2rem;
          animation: slideDown 0.35s cubic-bezier(0.16,1,0.3,1) both;
          box-shadow: 0 0 60px rgba(31,207,177,0.05);
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-16px) scaleY(0.97); }
          to   { opacity: 1; transform: translateY(0)   scaleY(1); }
        }

        .form-title {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #1fcfb1;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-title::before {
          content: '';
          width: 3px; height: 16px;
          background: #1fcfb1;
          border-radius: 2px;
          box-shadow: 0 0 8px #1fcfb1;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .form-field label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #444;
          display: block;
          margin-bottom: 7px;
        }

        .form-field input,
        .form-field select,
        .form-field textarea {
          width: 100%;
          background: #080809;
          border: 1px solid #222228;
          border-radius: 10px;
          padding: 11px 14px;
          color: #e8e8ec;
          font-size: 14px;
          font-family: 'Syne', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-field input:focus,
        .form-field select:focus,
        .form-field textarea:focus {
          border-color: rgba(31,207,177,0.5);
          box-shadow: 0 0 0 3px rgba(31,207,177,0.08);
        }

        .form-field select option { background: #111; }

        .btn-save {
          margin-top: 1.5rem;
          padding: 13px 36px;
          border-radius: 12px;
          background: #1fcfb1;
          color: #000;
          font-weight: 800;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.05em;
          transition: all 0.25s;
          box-shadow: 0 0 24px rgba(31,207,177,0.3);
        }
        .btn-save:hover:not(:disabled) {
          background: #26e8ca;
          box-shadow: 0 0 40px rgba(31,207,177,0.5);
          transform: translateY(-2px);
        }
        .btn-save:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ── Search ── */
        .search-wrap { position: relative; margin-bottom: 1.5rem; }

        .search-icon {
          position: absolute;
          left: 16px; top: 50%;
          transform: translateY(-50%);
          color: #333;
          font-size: 14px;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          background: #0c0c0f;
          border: 1px solid #1a1a1e;
          border-radius: 12px;
          padding: 13px 16px 13px 44px;
          color: #e8e8ec;
          font-size: 14px;
          font-family: 'Syne', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .search-input::placeholder { color: #2a2a30; }
        .search-input:focus {
          border-color: rgba(31,207,177,0.3);
          box-shadow: 0 0 0 3px rgba(31,207,177,0.06);
        }

        /* ── Table ── */
        .table-wrap {
          background: #0c0c0f;
          border: 1px solid #1a1a1e;
          border-radius: 18px;
          overflow: hidden;
        }

        .offers-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .offers-table thead tr {
          background: #080809;
          border-bottom: 1px solid #161618;
        }

        .offers-table th {
          padding: 14px 18px;
          text-align: left;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #2e2e38;
        }

        .offers-table tbody tr {
          border-bottom: 1px solid #111114;
          transition: background 0.15s;
          opacity: 0;
          animation: rowIn 0.4s ease both;
        }
        .offers-table tbody tr.rows-ready { opacity: 1; }
        .offers-table tbody tr:last-child { border-bottom: none; }
        .offers-table tbody tr:hover { background: rgba(255,255,255,0.025); }
        .offers-table tbody tr:hover .btn-edit { opacity: 1; transform: scale(1); }

        .offers-table td { padding: 14px 18px; vertical-align: middle; }

        @keyframes rowIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .td-id {
          color: #2e2e38;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          font-weight: 700;
        }

        .td-company { font-weight: 800; color: #fff; letter-spacing: -0.01em; }
        .td-account { color: #5a5a68; font-weight: 600; }
        .td-salary { color: #4a4a58; font-weight: 700; font-family: 'Space Mono', monospace; font-size: 13px; }
        .td-location { color: #3a3a48; font-size: 13px; }

        /* ── Status Badge ── */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 13px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-width: 1px;
          border-style: solid;
        }

        .status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .status-dot.active {
          background: #1fcfb1;
          box-shadow: 0 0 8px #1fcfb1;
          animation: dotPulse 2s ease-in-out infinite;
        }
        .status-dot.hold   { background: #f59e0b; box-shadow: 0 0 8px #f59e0b; }
        .status-dot.inactive { background: #ef4444; box-shadow: 0 0 8px #ef4444; }

        @keyframes dotPulse {
          0%,100% { box-shadow: 0 0 6px #1fcfb1; }
          50%      { box-shadow: 0 0 14px #1fcfb1, 0 0 4px #1fcfb1; }
        }

        /* ── Action Buttons ── */
        .action-btns { display: flex; gap: 7px; align-items: center; }

        .btn-edit {
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid #222228;
          background: transparent;
          color: #444;
          cursor: pointer;
          font-size: 12px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          letter-spacing: 0.03em;
          transition: all 0.2s;
          opacity: 0;
          transform: scale(0.9);
          display: inline-flex; align-items: center; gap: 5px;
        }
        .btn-edit:hover { border-color: rgba(31,207,177,0.5); color: #1fcfb1; background: rgba(31,207,177,0.06); }

        .btn-toggle {
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid #222228;
          background: transparent;
          color: #666;
          cursor: pointer;
          font-size: 12px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          letter-spacing: 0.03em;
          transition: all 0.2s;
          display: inline-flex; align-items: center; gap: 5px;
        }
        .btn-toggle:hover { border-color: rgba(31,207,177,0.5); color: #1fcfb1; background: rgba(31,207,177,0.05); }

        .btn-delete {
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid #2a1515;
          background: transparent;
          color: rgba(239,68,68,0.5);
          cursor: pointer;
          font-size: 12px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          letter-spacing: 0.03em;
          transition: all 0.2s;
          display: inline-flex; align-items: center; gap: 5px;
        }
        .btn-delete:hover { border-color: rgba(239,68,68,0.5); color: #ef4444; background: rgba(239,68,68,0.08); }

        /* ── Edit Modal ── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(6px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          animation: overlayIn 0.25s ease both;
        }

        @keyframes overlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .modal-panel {
          width: 100%;
          max-width: 540px;
          height: 100vh;
          background: #0c0c0f;
          border-left: 1px solid #1e1e24;
          overflow-y: auto;
          padding: 2rem;
          animation: slideInRight 0.35s cubic-bezier(0.16,1,0.3,1) both;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        @keyframes slideInRight {
          from { transform: translateX(60px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #161618;
        }

        .modal-title {
          font-size: 1.2rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #fff;
        }

        .modal-subtitle {
          font-size: 11px;
          color: #444;
          font-weight: 600;
          letter-spacing: 0.05em;
          margin-top: 4px;
        }

        .modal-subtitle span { color: #1fcfb1; }

        .btn-close {
          width: 34px; height: 34px;
          border-radius: 10px;
          border: 1px solid #222;
          background: transparent;
          color: #555;
          cursor: pointer;
          font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .btn-close:hover { border-color: #333; color: #ccc; background: rgba(255,255,255,0.05); }

        .modal-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #161618;
        }

        .btn-update {
          flex: 1;
          padding: 13px;
          border-radius: 12px;
          background: #1fcfb1;
          color: #000;
          font-weight: 800;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.05em;
          transition: all 0.25s;
          box-shadow: 0 0 24px rgba(31,207,177,0.3);
        }
        .btn-update:hover:not(:disabled) {
          background: #26e8ca;
          box-shadow: 0 0 40px rgba(31,207,177,0.5);
          transform: translateY(-2px);
        }
        .btn-update:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ── Loading ── */
        .loading-state {
          text-align: center;
          padding: 4rem;
          color: #2a2a32;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: 12px;
        }

        .loading-shimmer {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .shimmer-row {
          height: 52px;
          background: linear-gradient(90deg, #0c0c0f 25%, #111116 50%, #0c0c0f 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        .shimmer-row:nth-child(2) { animation-delay: 0.1s; }
        .shimmer-row:nth-child(3) { animation-delay: 0.2s; }
        .shimmer-row:nth-child(4) { animation-delay: 0.3s; }
        .shimmer-row:nth-child(5) { animation-delay: 0.4s; }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Empty State ── */
        .empty-state {
          text-align: center;
          padding: 5rem 2rem;
          color: #222228;
        }
        .empty-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .empty-state p { font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }

        /* ── Mobile Cards ── */
        .mobile-cards { display: none; }

        .offer-card {
          background: #0c0c0f;
          border: 1px solid #1a1a1e;
          border-radius: 14px;
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          animation: fadeUp 0.4s ease both;
          transition: border-color 0.2s;
        }
        .offer-card:hover { border-color: #2a2a30; }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .card-company { font-weight: 800; color: #fff; font-size: 15px; letter-spacing: -0.01em; }
        .card-account { font-size: 12px; color: #444; font-weight: 600; margin-top: 3px; }
        .card-salary { font-size: 13px; color: #555; font-weight: 700; font-family: 'Space Mono', monospace; }

        .card-btns {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }

        /* Access Modal Styles */
        .access-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(12px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: overlayIn 0.3s ease both;
        }

        .access-modal-panel {
          background: #0c0c0f;
          border: 1px solid #2a2a30;
          border-radius: 28px;
          width: 90%;
          max-width: 440px;
          padding: 2rem 1.8rem;
          box-shadow: 0 0 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(31,207,177,0.1);
          animation: scaleIn 0.35s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }

        .access-modal-icon {
          font-size: 2.5rem;
          text-align: center;
          margin-bottom: 0.75rem;
        }

        .access-modal-title {
          font-size: 1.35rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
          color: #fff;
          text-align: center;
        }

        .access-modal-desc {
          font-size: 12px;
          color: #666;
          margin-bottom: 1.5rem;
          border-left: 2px solid #1fcfb1;
          padding-left: 12px;
          font-weight: 500;
        }

        .access-locked {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem 0 0.75rem;
          text-align: center;
        }

        .access-locked-icon { font-size: 2.5rem; }

        .access-locked-msg {
          color: #888;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.6;
          max-width: 280px;
        }

        .btn-access-contact {
          width: 100%;
          padding: 14px;
          border-radius: 40px;
          background: #25D366;
          color: #fff;
          font-weight: 800;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.25s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.04em;
          box-shadow: 0 0 20px rgba(37,211,102,0.3);
          margin-top: 0.5rem;
        }

        .btn-access-contact:hover {
          background: #20c45e;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(37,211,102,0.45);
        }

        .access-input {
          width: 100%;
          background: #080809;
          border: 1px solid #222228;
          border-radius: 16px;
          padding: 14px 18px;
          color: #fff;
          font-size: 15px;
          font-family: 'Syne', sans-serif;
          outline: none;
          transition: border-color 0.2s;
          margin-bottom: 10px;
          letter-spacing: 0.1em;
        }

        .access-input:focus {
          border-color: #1fcfb1;
          box-shadow: 0 0 0 3px rgba(31,207,177,0.2);
        }

        .access-error {
          color: #ef4444;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 1rem;
          letter-spacing: 0.02em;
        }

        .btn-access-submit {
          width: 100%;
          padding: 14px;
          border-radius: 40px;
          background: #1fcfb1;
          color: #000;
          font-weight: 800;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.25s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.04em;
          box-shadow: 0 0 20px rgba(31,207,177,0.3);
        }

        .btn-access-submit:hover:not(:disabled) {
          background: #26e8ca;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(31,207,177,0.4);
        }

        .btn-access-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .stats-bar { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 640px) {
          .admin-wrapper { padding: 1.5rem 1rem; }
          .admin-header { flex-direction: column; align-items: flex-start; }
          .header-actions { width: 100%; }
          .header-actions .btn-primary,
          .header-actions .btn-ghost { flex: 1; justify-content: center; }
          .stats-bar { grid-template-columns: 1fr 1fr; gap: 10px; }
          .stat-value { font-size: 1.6rem; }
          .table-wrap { display: none; }
          .mobile-cards { display: flex; flex-direction: column; gap: 10px; }
          .form-grid,
          .modal-form-grid { grid-template-columns: 1fr; }
          .modal-panel {
            height: auto;
            max-height: 95vh;
            max-width: 100%;
            border-left: none;
            border-top: 1px solid #1e1e24;
            border-radius: 20px 20px 0 0;
            animation: slideInUp 0.35s cubic-bezier(0.16,1,0.3,1) both;
          }
          .modal-overlay { align-items: flex-end; }
          .access-modal-panel {
            width: 90%;
            padding: 1.5rem;
          }
        }

        @keyframes slideInUp {
          from { transform: translateY(60px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        @media (max-width: 420px) {
          .stats-bar { grid-template-columns: 1fr 1fr; }
          .action-btns { flex-wrap: wrap; }
        }
      `}</style>

      <div className="admin-wrapper">
        <div className="admin-container">

          {/* ── Header ── */}
          <div className="admin-header">
            <div className="header-brand">
              <div className="brand-icon">⚙️</div>
              <div className="brand-text">
                <h1>Admin Panel</h1>
                <p><span>{offers.length}</span> offers in database</p>
              </div>
            </div>
            <div className="header-actions">
              <a href="/" className="btn-ghost">← Home</a>
              <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                {showForm ? '✕ Close' : '+ New Offer'}
              </button>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="stats-bar">
            {[
              { label: 'Total Offers',  value: offers.length,                                        cls: '' },
              { label: 'Active',        value: offers.filter(o => o.status === 'Active').length,     cls: 'teal' },
              { label: 'On Hold',       value: offers.filter(o => o.status === 'Hold').length,       cls: 'amber' },
              { label: 'Inactive',      value: offers.filter(o => o.status === 'Inactive').length,   cls: 'red' },
            ].map(s => (
              <div className="stat-card" key={s.label}>
                <div className="stat-label">{s.label}</div>
                <div className={`stat-value ${s.cls}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* ── Add Form ── */}
          {showForm && (
            <div className="add-form">
              <div className="form-title">Add New Offer</div>
              <div className="form-grid">
                {fieldList.map(([key, label]) => (
                  <div className="form-field" key={key}>
                    <label>{label}</label>
                    <input
                      value={(form as any)[key] || ''}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                    />
                  </div>
                ))}
                <div className="form-field">
                  <label>Max Age</label>
                  <input
                    type="number"
                    value={form.max_age || ''}
                    onChange={e => setForm({ ...form, max_age: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>
                <div className="form-field">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Hold">Hold</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Language Requirement</label>
                  <select value={form.language_requirement} onChange={e => setForm({ ...form, language_requirement: e.target.value })}>
                    {['A2','B1','B1+','B2','B2+','C1','C2'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Location Type</label>
                  <select value={form.location_type} onChange={e => setForm({ ...form, location_type: e.target.value })}>
                    <option value="office">Office</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              <div className="form-field" style={{ marginTop: 14 }}>
                <label>All Offer Details</label>
                <textarea
                  value={form.details}
                  onChange={e => setForm({ ...form, details: e.target.value })}
                  rows={5}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* HR Contact Section */}
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #1e1e24' }}>
                <div className="form-title" style={{ marginBottom: '1rem' }}>📱 HR Contact Info</div>
                <div className="form-grid">
                  <div className="form-field">
                    <label>💬 WhatsApp (مثلاً 201xxxxxxxxx)</label>
                    <input
                      value={form.contact_whatsapp || ''}
                      placeholder="201xxxxxxxxx"
                      onChange={e => setForm({ ...form, contact_whatsapp: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>📞 Phone</label>
                    <input
                      value={form.contact_phone || ''}
                      placeholder="01xxxxxxxxx"
                      onChange={e => setForm({ ...form, contact_phone: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>✉️ Email</label>
                    <input
                      value={form.contact_email || ''}
                      placeholder="hr@company.com"
                      onChange={e => setForm({ ...form, contact_email: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>💡 ملاحظة التواصل</label>
                    <input
                      value={form.contact_note || ''}
                      placeholder="مثلاً: ابعت رسالة على واتساب بس"
                      onChange={e => setForm({ ...form, contact_note: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Offer'}
              </button>
            </div>
          )}

          {/* ── Filter Tabs ── */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
            {(['all', 'Active', 'Hold', 'Inactive'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                style={{
                  padding: '7px 18px',
                  borderRadius: 10,
                  border: `1px solid ${filterTab === tab ? (tab === 'Active' ? '#1fcfb1' : tab === 'Hold' ? '#f59e0b' : tab === 'Inactive' ? '#ef4444' : '#1fcfb1') : '#222'}`,
                  background: filterTab === tab ? (tab === 'Active' ? 'rgba(31,207,177,0.15)' : tab === 'Hold' ? 'rgba(245,158,11,0.15)' : tab === 'Inactive' ? 'rgba(239,68,68,0.15)' : 'rgba(31,207,177,0.15)') : 'transparent',
                  color: filterTab === tab ? (tab === 'Active' ? '#1fcfb1' : tab === 'Hold' ? '#f59e0b' : tab === 'Inactive' ? '#ef4444' : '#1fcfb1') : '#555',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                  fontFamily: 'Syne, sans-serif', letterSpacing: '0.05em',
                  transition: 'all 0.2s',
                }}
              >
                {tab === 'all' ? `All (${offers.length})` :
                 tab === 'Active' ? `✅ Active (${offers.filter(o => o.status === 'Active').length})` :
                 tab === 'Hold' ? `⏸ Hold (${offers.filter(o => o.status === 'Hold').length})` :
                 `❌ Inactive (${offers.filter(o => o.status === 'Inactive').length})`}
              </button>
            ))}
          </div>

          {/* ── Search ── */}
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search company or position…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* ── Desktop Table ── */}
          <div className="table-wrap">
            {loading ? (
              <div className="loading-shimmer">
                {[...Array(5)].map((_, i) => <div key={i} className="shimmer-row" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">◎</div>
                <p>No offers found</p>
              </div>
            ) : (
              <table className="offers-table">
                <thead>
                  <tr>
                    <th>#</th><th>Order</th><th>Company</th><th>Account</th>
                    <th>Salary</th><th>Location</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((offer, idx) => {
                    const sc = statusConfig[offer.status] || statusConfig['Inactive'];
                    const dotClass = offer.status === 'Active' ? 'active' : offer.status === 'Hold' ? 'hold' : 'inactive';
                    return (
                      <tr key={offer.id} style={{ animationDelay: `${idx * 0.04}s` }}>
                        <td className="td-id">#{offer.id}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <button onClick={() => moveOffer(offer.id, 'up')} style={{ background: 'none', border: '1px solid #222', borderRadius: 6, color: '#666', cursor: 'pointer', fontSize: 10, padding: '2px 6px' }}>▲</button>
                            <button onClick={() => moveOffer(offer.id, 'down')} style={{ background: 'none', border: '1px solid #222', borderRadius: 6, color: '#666', cursor: 'pointer', fontSize: 10, padding: '2px 6px' }}>▼</button>
                          </div>
                        </td>
                        <td className="td-company">{offer.company}</td>
                        <td className="td-account">{offer.account}</td>
                        <td className="td-salary">{offer.salary || '—'}</td>
                        <td className="td-location">{offer.location || '—'}</td>
                        <td>
                          <span className="status-badge" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>
                            <span className={`status-dot ${dotClass}`} />
                            {offer.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            <button className="btn-edit" onClick={() => openEdit(offer)}>
                              ✎ Edit
                            </button>
                            <button className="btn-toggle" onClick={() => toggleStatus(offer.id, offer.status)}>
                              {offer.status === 'Active' ? '⏸ Hold' : '▶ Activate'}
                            </button>
                            <button className="btn-delete" onClick={() => deleteOffer(offer.id)}>
                              🗑 Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* ── Mobile Cards ── */}
          <div className="mobile-cards">
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="shimmer-row" style={{ borderRadius: 14, height: 100 }} />)
            ) : filtered.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">◎</div><p>No offers found</p></div>
            ) : filtered.map((offer, idx) => {
              const sc = statusConfig[offer.status] || statusConfig['Inactive'];
              const dotClass = offer.status === 'Active' ? 'active' : offer.status === 'Hold' ? 'hold' : 'inactive';
              return (
                <div className="offer-card" key={offer.id} style={{ animationDelay: `${idx * 0.06}s` }}>
                  <div className="card-top">
                    <div>
                      <div className="card-company">{offer.company}</div>
                      <div className="card-account">{offer.account}</div>
                    </div>
                    <span className="status-badge" style={{ background: sc.bg, color: sc.color, borderColor: sc.border, flexShrink: 0 }}>
                      <span className={`status-dot ${dotClass}`} />
                      {offer.status}
                    </span>
                  </div>
                  {offer.salary && <div className="card-salary">{offer.salary}</div>}
                  <div className="card-btns">
                    <button className="btn-edit" style={{ opacity: 1, transform: 'scale(1)' }} onClick={() => openEdit(offer)}>
                      ✎ Edit
                    </button>
                    <button className="btn-toggle" onClick={() => toggleStatus(offer.id, offer.status)}>
                      {offer.status === 'Active' ? '⏸ Hold' : '▶ Activate'}
                    </button>
                    <button className="btn-delete" onClick={() => deleteOffer(offer.id)}>
                      🗑 Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editOffer && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeEdit(); }}>
          <div className="modal-panel">
            <div className="modal-header">
              <div>
                <div className="modal-title">Edit Offer</div>
                <div className="modal-subtitle">
                  <span>#{editOffer.id}</span> · {editOffer.company}
                </div>
              </div>
              <button className="btn-close" onClick={closeEdit}>✕</button>
            </div>

            <div className="modal-form-grid">
              {fieldList.map(([key, label]) => (
                <div className="form-field" key={key}>
                  <label>{label}</label>
                  <input
                    value={(editForm as any)[key] || ''}
                    onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                  />
                </div>
              ))}
              <div className="form-field">
                <label>Max Age</label>
                <input
                  type="number"
                  value={editForm.max_age || ''}
                  onChange={e => setEditForm({ ...editForm, max_age: e.target.value ? parseInt(e.target.value) : null })}
                />
              </div>
              <div className="form-field">
                <label>Status</label>
                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Hold">Hold</option>
                </select>
              </div>
              <div className="form-field">
                <label>Language Requirement</label>
                <select value={editForm.language_requirement} onChange={e => setEditForm({ ...editForm, language_requirement: e.target.value })}>
                  {['A2','B1','B1+','B2','B2+','C1','C2'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Location Type</label>
                <select value={editForm.location_type} onChange={e => setEditForm({ ...editForm, location_type: e.target.value })}>
                  <option value="office">Office</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="form-field" style={{ marginTop: 14 }}>
              <label>All Offer Details</label>
              <textarea
                value={editForm.details}
                onChange={e => setEditForm({ ...editForm, details: e.target.value })}
                rows={5}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* HR Contact in Edit */}
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #1e1e24' }}>
              <div className="form-title" style={{ marginBottom: '1rem' }}>📱 HR Contact Info</div>
              <div className="modal-form-grid">
                <div className="form-field">
                  <label>💬 WhatsApp</label>
                  <input value={(editForm as any).contact_whatsapp || ''} placeholder="201xxxxxxxxx" onChange={e => setEditForm({ ...editForm, contact_whatsapp: e.target.value } as any)} />
                </div>
                <div className="form-field">
                  <label>📞 Phone</label>
                  <input value={(editForm as any).contact_phone || ''} placeholder="01xxxxxxxxx" onChange={e => setEditForm({ ...editForm, contact_phone: e.target.value } as any)} />
                </div>
                <div className="form-field">
                  <label>✉️ Email</label>
                  <input value={(editForm as any).contact_email || ''} placeholder="hr@company.com" onChange={e => setEditForm({ ...editForm, contact_email: e.target.value } as any)} />
                </div>
                <div className="form-field">
                  <label>💡 ملاحظة</label>
                  <input value={(editForm as any).contact_note || ''} placeholder="ابعت رسالة على واتساب بس" onChange={e => setEditForm({ ...editForm, contact_note: e.target.value } as any)} />
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-ghost" onClick={closeEdit} style={{ flex: 0 }}>Cancel</button>
              <button className="btn-update" onClick={handleUpdate} disabled={updating}>
                {updating ? 'Saving…' : '✓ Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Password Gate Modal ── */}
      {accessModalOpen && (
        <div className="access-modal-overlay">
          <div className="access-modal-panel">
            <div className="access-modal-icon">🔐</div>
            <div className="access-modal-title">Admin Access</div>
            <div className="access-modal-desc">
              Enter the password to continue.
            </div>

            {!pwLocked ? (
              <form onSubmit={handlePasswordSubmit}>
                <input
                  className="access-input"
                  type="password"
                  placeholder="Enter password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoFocus
                />
                {pwError && <div className="access-error">{pwError}</div>}
                <button type="submit" className="btn-access-submit">
                  Unlock
                </button>
              </form>
            ) : (
              <div className="access-locked">
                <div className="access-locked-icon">⚠️</div>
                <p className="access-locked-msg">
                  Too many incorrect attempts. Please contact support to regain access.
                </p>
                <button className="btn-access-contact" onClick={handleContactSupport}>
                  <span>💬</span> Contact Support
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}