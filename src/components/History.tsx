import React, { useState } from 'react';
import { History as HistoryIcon, Search, Trash2, Calendar } from 'lucide-react';
import type { Transaction } from '../types';
import { formatRupiah } from './Dashboard';

interface HistoryProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

type FilterType = 'semua' | 'pemasukan' | 'pengeluaran' | 'tabungan';

export const History: React.FC<HistoryProps> = ({ transactions, onDeleteTransaction }) => {
  const [filter, setFilter] = useState<FilterType>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Filter and Search
  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = filter === 'semua' || t.type === filter;
    const matchesSearch = 
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.note.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // 2. Group by date YYYY-MM-DD
  const groupedTransactions: { [date: string]: Transaction[] } = {};
  
  filteredTransactions.forEach(t => {
    if (!groupedTransactions[t.date]) {
      groupedTransactions[t.date] = [];
    }
    groupedTransactions[t.date].push(t);
  });

  // Sort dates descending
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  // Helper to format date header
  const formatDateHeader = (dateStr: string) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === todayStr) {
      return 'Hari Ini';
    } else if (dateStr === yesterdayStr) {
      return 'Kemarin';
    } else {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  };

  // Helper to calculate daily net flow (Income - Expense - Savings)
  const calculateDailyNet = (dayTransactions: Transaction[]) => {
    let net = 0;
    dayTransactions.forEach(t => {
      if (t.type === 'pemasukan') {
        net += t.amount;
      } else {
        net -= t.amount; // expense or savings allotment
      }
    });
    return net;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginTop: '8px' }}>
        <div>
          <span className="text-xs font-bold text-tertiary" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
            Catatan Keuangan
          </span>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ letterSpacing: '-0.5px' }}>
            <HistoryIcon size={22} className="text-primary-color" />
            <span>Daftar Transaksi</span>
          </h1>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="segmented-control" style={{ marginBottom: '8px' }}>
        <button
          className={`segment-item ${filter === 'semua' ? 'active' : ''}`}
          onClick={() => setFilter('semua')}
          style={{ fontSize: '11px', padding: '8px' }}
        >
          Semua
        </button>
        <button
          className={`segment-item ${filter === 'pemasukan' ? 'active' : ''}`}
          onClick={() => setFilter('pemasukan')}
          style={{ fontSize: '11px', padding: '8px' }}
        >
          Pemasukan
        </button>
        <button
          className={`segment-item ${filter === 'pengeluaran' ? 'active' : ''}`}
          onClick={() => setFilter('pengeluaran')}
          style={{ fontSize: '11px', padding: '8px' }}
        >
          Pengeluaran
        </button>
        <button
          className={`segment-item ${filter === 'tabungan' ? 'active' : ''}`}
          onClick={() => setFilter('tabungan')}
          style={{ fontSize: '11px', padding: '8px' }}
        >
          Tabungan
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative' }}>
        <Search 
          size={16} 
          style={{ 
            position: 'absolute', 
            left: '14px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: 'var(--text-tertiary)' 
          }} 
        />
        <input 
          type="text" 
          placeholder="Cari kategori atau catatan..." 
          className="form-input"
          style={{ paddingLeft: '38px', fontSize: '13px' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grouped History List */}
      <div className="flex flex-col">
        {sortedDates.length === 0 ? (
          <div className="glass-card" style={{ padding: '48px 16px', textAlign: 'center', marginTop: '10px' }}>
            <span style={{ fontSize: '32px' }}>🔍</span>
            <p className="text-sm font-semibold text-secondary" style={{ marginTop: '8px' }}>
              Tidak menemukan transaksi
            </p>
            <p className="text-xs text-tertiary">
              Coba ganti filter atau cari kata kunci lain
            </p>
          </div>
        ) : (
          sortedDates.map((dateKey) => {
            const dayTxList = groupedTransactions[dateKey];
            const dailyNet = calculateDailyNet(dayTxList);
            const netColor = dailyNet >= 0 ? 'var(--success)' : 'var(--danger)';
            const netSign = dailyNet >= 0 ? '+' : '';

            return (
              <div key={dateKey} style={{ marginBottom: '16px' }}>
                {/* Date Header with Daily Summary */}
                <div className="flex justify-between items-center history-day-header">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{formatDateHeader(dateKey)}</span>
                  </div>
                  <span style={{ color: netColor, fontWeight: 700 }}>
                    {netSign}{formatRupiah(dailyNet)}
                  </span>
                </div>

                {/* Day's Transactions Container */}
                <div className="glass-card" style={{ padding: '0 4px', borderRadius: 'var(--radius-sm)' }}>
                  {dayTxList.map((t) => {
                    const isIncome = t.type === 'pemasukan';
                    const isGoalAllotment = t.type === 'tabungan';
                    
                    let itemColor = 'var(--danger)';
                    let itemSign = '-';
                    let itemBg = 'var(--danger-glow)';
                    let itemEmoji = '💸';

                    if (isIncome) {
                      itemColor = 'var(--success)';
                      itemSign = '+';
                      itemBg = 'var(--success-glow)';
                      itemEmoji = '💰';
                    } else if (isGoalAllotment) {
                      itemColor = 'var(--primary)';
                      itemSign = '-';
                      itemBg = 'var(--primary-glow)';
                      itemEmoji = '🎯';
                    }

                    // Emoji mappings based on categories
                    if (t.category.toLowerCase().includes('gaji')) itemEmoji = '💼';
                    if (t.category.toLowerCase().includes('makanan')) itemEmoji = '🍔';
                    if (t.category.toLowerCase().includes('sampingan')) itemEmoji = '🚀';
                    if (t.category.toLowerCase().includes('belanja')) itemEmoji = '🛍️';
                    if (t.category.toLowerCase().includes('tagihan')) itemEmoji = '⚡';
                    if (t.category.toLowerCase().includes('transportasi')) itemEmoji = '🚗';
                    if (t.category.toLowerCase().includes('hiburan')) itemEmoji = '🍿';
                    if (t.category.toLowerCase().includes('investasi')) itemEmoji = '📈';

                    return (
                      <div key={t.id} className="transaction-item flex items-center justify-between">
                        <div className="transaction-icon-wrapper" style={{ backgroundColor: itemBg }}>
                          {itemEmoji}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                          <p className="text-sm font-bold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {t.category}
                          </p>
                          <p 
                            className="text-xs text-tertiary" 
                            style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            {t.note || (isGoalAllotment ? 'Tabungan Target' : 'Tanpa catatan')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3" style={{ textAlign: 'right' }}>
                          <div>
                            <p className="text-sm font-bold" style={{ color: itemColor, whiteSpace: 'nowrap' }}>
                              {itemSign} {formatRupiah(t.amount)}
                            </p>
                            <p className="text-xs text-tertiary">
                              {t.type.toUpperCase()}
                            </p>
                          </div>
                          
                          {/* Trash Icon */}
                          <button
                            onClick={() => {
                              if (window.confirm('Hapus transaksi ini dari riwayat?')) {
                                onDeleteTransaction(t.id);
                              }
                            }}
                            className="btn-text"
                            style={{ 
                              color: 'var(--text-tertiary)', 
                              padding: '6px', 
                              borderRadius: '6px',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer' 
                            }}
                            aria-label="Delete Transaction"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
