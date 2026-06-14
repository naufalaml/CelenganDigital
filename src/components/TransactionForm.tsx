import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Check, Calendar, FileText } from 'lucide-react';
import type { Transaction, TransactionType } from '../types';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
}

const INCOME_CATEGORIES = [
  { id: 'Gaji', label: 'Gaji', emoji: '💼' },
  { id: 'Sampingan', label: 'Sampingan', emoji: '🚀' },
  { id: 'Investasi', label: 'Investasi', emoji: '📈' },
  { id: 'Lainnya', label: 'Lainnya', emoji: '💵' }
];

const EXPENSE_CATEGORIES = [
  { id: 'Makanan', label: 'Makanan', emoji: '🍔' },
  { id: 'Belanja', label: 'Belanja', emoji: '🛍️' },
  { id: 'Tagihan', label: 'Tagihan', emoji: '⚡' },
  { id: 'Transportasi', label: 'Transport', emoji: '🚗' },
  { id: 'Hiburan', label: 'Hiburan', emoji: '🍿' },
  { id: 'Lainnya', label: 'Lainnya', emoji: '💸' }
];

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction, onClose }) => {
  const [type, setType] = useState<TransactionType>('pemasukan');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // Set default date to today in Jakarta time (local)
  useEffect(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    setDate(localToday.toISOString().split('T')[0]);
  }, []);

  // Reset category when transaction type toggles
  useEffect(() => {
    if (type === 'pemasukan') {
      setCategory(INCOME_CATEGORIES[0].id);
    } else if (type === 'pengeluaran') {
      setCategory(EXPENSE_CATEGORIES[0].id);
    }
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Nominal harus berupa angka dan lebih besar dari 0');
      return;
    }

    if (!category) {
      setError('Silakan pilih kategori terlebih dahulu');
      return;
    }

    onAddTransaction({
      type,
      amount: parsedAmount,
      category,
      date,
      note
    });

    // Reset Form
    setAmount('');
    setNote('');
    onClose();
  };

  const categoriesToRender = type === 'pemasukan' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex justify-between items-center" style={{ marginBottom: '18px' }}>
          <h2 className="text-lg font-bold">Catat Transaksi Baru</h2>
          <button className="btn btn-text" onClick={onClose} style={{ padding: '4px' }}>Batal</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Segmented Control for Pemasukan/Pengeluaran */}
          <div className="segmented-control">
            <button
              type="button"
              className={`segment-item ${type === 'pemasukan' ? 'active-success' : ''}`}
              onClick={() => setType('pemasukan')}
            >
              <div className="flex items-center justify-center gap-1">
                <ArrowUpRight size={16} />
                <span>Pemasukan</span>
              </div>
            </button>
            <button
              type="button"
              className={`segment-item ${type === 'pengeluaran' ? 'active-danger' : ''}`}
              onClick={() => setType('pengeluaran')}
            >
              <div className="flex items-center justify-center gap-1">
                <ArrowDownRight size={16} />
                <span>Pengeluaran</span>
              </div>
            </button>
          </div>

          {/* Amount input */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Nominal (Rupiah)</label>
            <div style={{ position: 'relative' }}>
              <span 
                style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  fontWeight: 700,
                  fontSize: '15px',
                  color: 'var(--text-secondary)'
                }}
              >
                Rp
              </span>
              <input 
                type="number" 
                className="form-input" 
                placeholder="0" 
                style={{ paddingLeft: '44px', fontSize: '18px', fontWeight: 700 }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
              />
            </div>
            {error && (
              <p className="text-xs font-semibold text-danger" style={{ marginTop: '4px' }}>{error}</p>
            )}
          </div>

          {/* Date Picker */}
          <div className="form-group">
            <label className="form-label flex items-center gap-1">
              <Calendar size={14} />
              <span>Tanggal</span>
            </label>
            <input 
              type="date" 
              className="form-input" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Category Selector (Visual Pills) */}
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label">Pilih Kategori</label>
            <div className="category-grid">
              {categoriesToRender.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`category-pill ${isSelected ? 'selected' : ''}`}
                    onClick={() => setCategory(cat.id)}
                  >
                    <div 
                      className="category-icon-wrapper"
                      style={{ 
                        backgroundColor: isSelected 
                          ? (type === 'pemasukan' ? 'var(--success-glow)' : 'var(--danger-glow)') 
                          : 'rgba(0,0,0,0.02)',
                        color: isSelected 
                          ? (type === 'pemasukan' ? 'var(--success)' : 'var(--danger)') 
                          : 'inherit'
                      }}
                    >
                      {cat.emoji}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note Input */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label flex items-center gap-1">
              <FileText size={14} />
              <span>Catatan Singkat (Opsional)</span>
            </label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Misal: Bonus proyek, Beli makan siang" 
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className={`btn w-full ${type === 'pemasukan' ? 'btn-success' : 'btn-primary'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <Check size={18} />
              <span>Simpan Catatan</span>
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};
