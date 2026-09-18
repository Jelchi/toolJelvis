'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api-client';
import {
  Wallet, TrendingUp, TrendingDown, DollarSign, Plus, Trash2, Search,
  Filter, PieChart, CreditCard, Target, AlertTriangle, CheckCircle, ArrowUpRight,
  ArrowDownRight, Calendar, PiggyBank, BarChart3, X, Loader2
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  account: string;
  date: string;
}

interface FinanceSummary {
  total_balance: number;
  total_income: number;
  total_expense: number;
  net_savings_rate: number;
  category_breakdown: {
    category: string;
    total_amount: number;
    percentage: number;
    count: number;
  }[];
  transaction_count: number;
}

interface Budget {
  id: string;
  category: string;
  monthly_limit: number;
}

interface SavingsGoal {
  id: string;
  target_name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
}

const CATEGORIES = [
  'Gaji Utama',
  'Freelance & Consulting',
  'Investasi',
  'Makanan & Minuman',
  'Transportasi',
  'Belanja & Lifestyle',
  'Tagihan & Utilitas',
  'Hiburan & Langganan',
  'Lainnya',
];

const ACCOUNTS = ['BCA', 'Mandiri', 'Cash', 'E-Wallet', 'Kartu Kredit'];

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'history' | 'budgets'>('analytics');
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txAmount, setTxAmount] = useState<string>('');
  const [txCategory, setTxCategory] = useState<string>(CATEGORIES[3]);
  const [txDescription, setTxDescription] = useState<string>('');
  const [txAccount, setTxAccount] = useState<string>('BCA');

  // New Budget Form Modal
  const [newBudgetCategory, setNewBudgetCategory] = useState<string>(CATEGORIES[3]);
  const [newBudgetLimit, setNewBudgetLimit] = useState<string>('');
  const [isAddingBudget, setIsAddingBudget] = useState<boolean>(false);

  // New Goal Form Modal
  const [goalName, setGoalName] = useState<string>('');
  const [goalTarget, setGoalTarget] = useState<string>('');
  const [goalCurrent, setGoalCurrent] = useState<string>('');
  const [isAddingGoal, setIsAddingGoal] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, txRes, bgRes, glRes] = await Promise.all([
        apiRequest<FinanceSummary>('/finance/summary'),
        apiRequest<Transaction[]>('/finance/transactions'),
        apiRequest<Budget[]>('/finance/budgets'),
        apiRequest<SavingsGoal[]>('/finance/goals'),
      ]);

      if (sumRes) setSummary(sumRes);
      if (Array.isArray(txRes)) setTransactions(txRes);
      if (Array.isArray(bgRes)) setBudgets(bgRes);
      if (Array.isArray(glRes)) setGoals(glRes);
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || parseFloat(txAmount) <= 0) return;

    try {
      await apiRequest('/finance/transactions', {
        method: 'POST',
        body: JSON.stringify({
          type: txType,
          amount: parseFloat(txAmount),
          category: txCategory,
          description: txDescription || (txType === 'income' ? 'Pemasukan' : 'Pengeluaran'),
          account: txAccount,
        }),
      });

      setIsModalOpen(false);
      setTxAmount('');
      setTxDescription('');
      loadData();
    } catch (err) {}
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await apiRequest(`/finance/transactions/${id}`, { method: 'DELETE' });
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      loadData();
    } catch (err) {}
  };

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetLimit || parseFloat(newBudgetLimit) <= 0) return;
    try {
      await apiRequest('/finance/budgets', {
        method: 'POST',
        body: JSON.stringify({
          category: newBudgetCategory,
          monthly_limit: parseFloat(newBudgetLimit),
        }),
      });
      setNewBudgetLimit('');
      setIsAddingBudget(false);
      loadData();
    } catch (err) {}
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !goalTarget) return;
    try {
      await apiRequest('/finance/goals', {
        method: 'POST',
        body: JSON.stringify({
          target_name: goalName,
          target_amount: parseFloat(goalTarget),
          current_amount: parseFloat(goalCurrent || '0'),
        }),
      });
      setGoalName('');
      setGoalTarget('');
      setGoalCurrent('');
      setIsAddingGoal(false);
      loadData();
    } catch (err) {}
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.account.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 select-none">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-800/40 rounded-3xl p-6 md:p-8 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-300">NEXUS Financial Manager</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Pengelola Keuangan & Anggaran</h1>
          <p className="text-xs md:text-sm text-emerald-200/90 mt-2 max-w-2xl leading-relaxed">
            Pencatatan pemasukan & pengeluaran, visualisasi kategori, kontrol limit anggaran bulanan, dan pelacak target tabungan.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2 shadow-xl hover:shadow-emerald-600/30 transition-all active:scale-95 z-10 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Transaksi Baru</span>
        </button>
      </div>

      {/* Primary Financial Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Net Balance */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Saldo (Net)</span>
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {formatRupiah(summary?.total_balance || 0)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Kondisi Keuangan Sehat</span>
          </div>
        </div>

        {/* Card 2: Total Income */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pemasukan</span>
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-600 font-mono tracking-tight">
            +{formatRupiah(summary?.total_income || 0)}
          </p>
          <p className="text-xs text-slate-400">Pemasukan bulan berjalan</p>
        </div>

        {/* Card 3: Total Expenses */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pengeluaran</span>
            <div className="w-9 h-9 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 font-mono tracking-tight">
            -{formatRupiah(summary?.total_expense || 0)}
          </p>
          <p className="text-xs text-slate-400">Pengeluaran bulan berjalan</p>
        </div>

        {/* Card 4: Net Savings Rate */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rasio Tabungan</span>
            <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-700 font-mono tracking-tight">
            {summary?.net_savings_rate || 0}%
          </p>
          <p className="text-xs text-purple-600 font-semibold">Persentase dana yang ditabung</p>
        </div>
      </div>

      {/* Main Studio Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>📊 Analitik & Kategori</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>📝 Riwayat Transaksi ({transactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('budgets')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'budgets'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>🎯 Anggaran & Target Tabungan</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ANALYTICS & CATEGORY BREAKDOWN */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Breakdown Progress List (2 Cols) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Distribusi Kategori Pengeluaran</h3>
                <p className="text-xs text-slate-400 mt-0.5">Rincian pengeluaran terbanyak berdasarkan kategori</p>
              </div>
              <PieChart className="w-5 h-5 text-emerald-600" />
            </div>

            {summary?.category_breakdown.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">Belum ada data pengeluaran terdaftar.</div>
            ) : (
              <div className="space-y-4">
                {summary?.category_breakdown.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{item.category}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-rose-600">{formatRupiah(item.total_amount)}</span>
                        <span className="text-slate-400 font-bold">({item.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, item.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accounts & Health Indicator (1 Col) */}
          <div className="space-y-6">
            {/* Account Balance Summary */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Dompet & Rekening Terdaftar</h3>
              <div className="space-y-2.5">
                {ACCOUNTS.map((acc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl flex items-center justify-center">
                        {acc.slice(0, 2)}
                      </div>
                      <span className="text-xs font-bold text-slate-800">{acc}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">Aktif</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Health Advice */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-5 space-y-2 text-emerald-950">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Financial Tip</h4>
              </div>
              <p className="text-xs leading-relaxed text-emerald-900 font-medium">
                Idealnya alokasikan 50% untuk kebutuhan pokok, 30% untuk keinginan, dan minimal 20% untuk tabungan/investasi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRANSACTION HISTORY TABLE */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Cari transaksi berdasarkan keterangan / kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterType === 'income' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pemasukan (+)
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterType === 'expense' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pengeluaran (-)
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden divide-y divide-slate-100 shadow-sm">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">Tidak ada transaksi ditemukan.</div>
            ) : (
              filteredTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      t.type === 'income' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>

                    <div>
                      <p className="text-xs md:text-sm font-bold text-slate-900">{t.description || t.category}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200">
                          {t.category}
                        </span>
                        <span className="text-[11px] text-slate-400">{t.account}</span>
                        <span className="text-[11px] text-slate-400">• {new Date(t.date).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`text-sm md:text-base font-black font-mono ${
                      t.type === 'income' ? 'text-blue-600' : 'text-rose-600'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount)}
                    </span>

                    <button
                      onClick={() => handleDeleteTransaction(t.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors"
                      title="Hapus Transaksi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BUDGETS & SAVINGS GOALS */}
      {activeTab === 'budgets' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Monthly Budget Limits */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Limit Anggaran Bulanan</h3>
                <p className="text-xs text-slate-400 mt-0.5">Batas maksimal pengeluaran per kategori</p>
              </div>
              <button
                onClick={() => setIsAddingBudget(!isAddingBudget)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Atur Limit</span>
              </button>
            </div>

            {/* New Budget Form */}
            {isAddingBudget && (
              <form onSubmit={handleAddBudget} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Kategori</label>
                    <select
                      value={newBudgetCategory}
                      onChange={(e) => setNewBudgetCategory(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Limit Bulanan (Rp)</label>
                    <input
                      type="number"
                      placeholder="Contoh: 3000000"
                      value={newBudgetLimit}
                      onChange={(e) => setNewBudgetLimit(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl">
                  Simpan Limit Anggaran
                </button>
              </form>
            )}

            {/* Budget List Items */}
            <div className="space-y-4">
              {budgets.map((b) => {
                const spent = summary?.category_breakdown.find((c) => c.category === b.category)?.total_amount || 0;
                const pct = Math.min(100, Math.round((spent / b.monthly_limit) * 100));
                const isWarning = pct >= 80;

                return (
                  <div key={b.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{b.category}</span>
                      <div className="font-mono text-xs">
                        <span className={`font-bold ${isWarning ? 'text-rose-600' : 'text-slate-700'}`}>
                          {formatRupiah(spent)}
                        </span>
                        <span className="text-slate-400 font-bold"> / {formatRupiah(b.monthly_limit)}</span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isWarning ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {isWarning && (
                      <div className="flex items-center gap-1 text-[10px] text-rose-600 font-bold">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Pengeluaran hampir mencapai batas limit ({pct}%)</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Savings Goals */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Target Tabungan (Savings Goals)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Pelacak capaian tabungan impian Anda</p>
              </div>
              <button
                onClick={() => setIsAddingGoal(!isAddingGoal)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Target Baru</span>
              </button>
            </div>

            {/* New Goal Form */}
            {isAddingGoal && (
              <form onSubmit={handleAddGoal} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <input
                  type="text"
                  placeholder="Nama Target (misal: Beli Laptop / Dana Darurat)"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Target (Rp)"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Terkumpul (Rp)"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl">
                  Simpan Target Tabungan
                </button>
              </form>
            )}

            {/* Goals List Items */}
            <div className="space-y-4">
              {goals.map((g) => {
                const pct = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
                return (
                  <div key={g.id} className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{g.target_name}</span>
                      <span className="font-bold text-emerald-700 font-mono">{pct}%</span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                      <span>{formatRupiah(g.current_amount)}</span>
                      <span>Target: {formatRupiah(g.target_amount)}</span>
                    </div>

                    <div className="w-full h-2.5 bg-emerald-200/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Catat Transaksi Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              {/* Type Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    txType === 'expense' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-600'
                  }`}
                >
                  Pengeluaran (-)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    txType === 'income' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600'
                  }`}
                >
                  Pemasukan (+)
                </button>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-xs font-bold text-slate-700">Nominal (Rp)</label>
                <input
                  type="number"
                  placeholder="0"
                  required
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="text-xs font-bold text-slate-700">Kategori Transaksi</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Account Dropdown */}
              <div>
                <label className="text-xs font-bold text-slate-700">Akun / Dompet Pembayaran</label>
                <select
                  value={txAccount}
                  onChange={(e) => setTxAccount(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  {ACCOUNTS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Description Input */}
              <div>
                <label className="text-xs font-bold text-slate-700">Catatan / Keterangan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Belanja bulanan, bayar listrik..."
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-xl shadow-emerald-600/20 transition-all active:scale-95"
              >
                Simpan Transaksi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
