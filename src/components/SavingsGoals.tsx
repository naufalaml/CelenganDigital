import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Award, Edit } from 'lucide-react';
import type { SavingsGoal } from '../types';
import { formatRupiah } from './Dashboard';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  onDeleteGoal: (id: string) => void;
  onUpdateGoal: (goal: SavingsGoal) => void;
  onAllotMoney: (goalId: string, amount: number) => void;
  cashBalance: number;
}

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({ 
  goals, 
  onAddGoal, 
  onDeleteGoal, 
  onUpdateGoal,
  onAllotMoney,
  cashBalance
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAllotModal, setShowAllotModal] = useState<string | null>(null); // goal ID
  
  // New Goal State
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState('#6366f1');

  // Allotment State
  const [allotAmount, setAllotAmount] = useState('');
  const [allotError, setAllotError] = useState('');

  // Edit Goal States
  const [editGoal, setEditGoal] = useState<SavingsGoal | null>(null);
  const [editName, setEditName] = useState('');
  const [editTargetAmount, setEditTargetAmount] = useState('');
  const [editTargetDate, setEditTargetDate] = useState('');
  const [editIcon, setEditIcon] = useState('🎯');
  const [editColor, setEditColor] = useState('#6366f1');

  const handleStartEdit = (goal: SavingsGoal) => {
    setEditGoal(goal);
    setEditName(goal.name);
    setEditTargetAmount(goal.targetAmount.toString());
    setEditTargetDate(goal.targetDate);
    setEditIcon(goal.icon);
    setEditColor(goal.color);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGoal || !editName || !editTargetAmount || !editTargetDate) return;

    onUpdateGoal({
      ...editGoal,
      name: editName,
      targetAmount: parseFloat(editTargetAmount),
      targetDate: editTargetDate,
      icon: editIcon,
      color: editColor
    });

    setEditGoal(null);
  };

  // Image Compressor & Base64 Converter
  const compressAndSetImage = (file: File, isEdit: boolean) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 120;
        const MAX_HEIGHT = 120;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75); // JPEG compression at 75% quality
          if (isEdit) {
            setEditIcon(compressedBase64);
          } else {
            setIcon(compressedBase64);
          }
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // Helper for dynamic savings calculation
  const getSavingsTargetCalculationInfo = (amountStr: string, dateStr: string) => {
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0 || !dateStr) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return (
        <div style={{ padding: '8px 12px', background: 'var(--danger-glow)', color: 'var(--danger)', borderRadius: '8px', fontSize: '11px', fontWeight: 600, marginTop: '4px' }}>
          Tanggal target harus di hari esok atau setelahnya.
        </div>
      );
    }

    const daily = amount / diffDays;
    const monthly = amount / Math.max(1, diffDays / 30.4);

    return (
      <div className="glass-card" style={{ padding: '10px 14px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
        <span className="text-xs font-bold text-tertiary" style={{ textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px' }}>Estimasi Kebutuhan Tabungan</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '12px', fontWeight: 600 }}>
          <div className="flex justify-between">
            <span className="text-secondary" style={{ fontWeight: 500 }}>Waktu tersisa:</span>
            <span className="text-primary-color">{diffDays} hari</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary" style={{ fontWeight: 500 }}>Tabungan Harian:</span>
            <span className="text-success">{formatRupiah(daily)} / hari</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary" style={{ fontWeight: 500 }}>Tabungan Bulanan:</span>
            <span className="text-success">{formatRupiah(monthly)} / bulan</span>
          </div>
        </div>
      </div>
    );
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || !targetDate) return;
    
    onAddGoal({
      name,
      targetAmount: parseFloat(targetAmount),
      targetDate,
      icon,
      color
    });

    // Reset Form
    setName('');
    setTargetAmount('');
    setTargetDate('');
    setIcon('🎯');
    setColor('#6366f1');
    setShowAddForm(false);
  };

  const handleAllotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAllotModal) return;
    
    const amount = parseFloat(allotAmount);
    if (isNaN(amount) || amount <= 0) {
      setAllotError('Jumlah harus lebih dari 0');
      return;
    }

    if (amount > cashBalance) {
      setAllotError(`Saldo utama tidak mencukupi (${formatRupiah(cashBalance)})`);
      return;
    }

    onAllotMoney(showAllotModal, amount);
    setAllotAmount('');
    setAllotError('');
    setShowAllotModal(null);
  };

  // Calculate days remaining
  const getDaysRemaining = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Sudah jatuh tempo';
    if (diffDays === 0) return 'Hari ini';
    return `${diffDays} hari lagi`;
  };

  const emojiList = ['🎯', '💻', '🚗', '✈️', '🏠', '💍', '🎓', '🎁', '📱', '🚲', '🍕', '📈'];
  const colorList = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

  return (
    <div className="flex flex-col gap-4">
      {/* Header section */}
      <div className="flex items-center justify-between" style={{ marginTop: '8px' }}>
        <div>
          <span className="text-xs font-bold text-tertiary" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
            Rencana Masa Depan
          </span>
          <h1 className="text-2xl font-bold" style={{ letterSpacing: '-0.5px' }}>
            Target Tabungan
          </h1>
        </div>
        
        <button 
          className="btn btn-primary flex items-center gap-1"
          style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)' }}
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={16} />
          <span>Buat Baru</span>
        </button>
      </div>

      {/* Goal list container */}
      <div className="flex flex-col gap-3">
        {goals.length === 0 ? (
          <div className="glass-card" style={{ padding: '48px 16px', textAlign: 'center' }}>
            <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>🎯</span>
            <p className="text-sm font-semibold text-secondary">Belum ada target tabungan</p>
            <p className="text-xs text-tertiary" style={{ maxWidth: '240px', margin: '4px auto 16px auto' }}>
              Mulai buat target impian Anda (misalnya beli gadget, liburan, dll) dan tabung secara berkala.
            </p>
            <button 
              className="btn btn-secondary text-sm"
              onClick={() => setShowAddForm(true)}
            >
              Buat Target Pertama Anda
            </button>
          </div>
        ) : (
          goals.map((g) => {
            const percentage = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            const isCompleted = g.currentAmount >= g.targetAmount;
            
            return (
              <div key={g.id} className="glass-card flex flex-col gap-3" style={{ position: 'relative' }}>
                {/* Edit icon */}
                <button
                  onClick={() => handleStartEdit(g)}
                  style={{
                    position: 'absolute',
                    top: '18px',
                    right: '44px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    padding: '4px',
                    zIndex: 5
                  }}
                  className="btn-text"
                  aria-label="Edit Goal"
                >
                  <Edit size={16} />
                </button>

                {/* Delete icon */}
                <button
                  onClick={() => {
                    if (window.confirm(`Hapus target "${g.name}"?`)) {
                      onDeleteGoal(g.id);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    top: '18px',
                    right: '18px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    padding: '4px',
                    zIndex: 5
                  }}
                  className="btn-text"
                  aria-label="Delete Goal"
                >
                  <Trash2 size={16} />
                </button>

                <div className="flex items-center gap-3">
                  <div 
                    className="category-icon-wrapper"
                    style={{ 
                      backgroundColor: `${g.color}15`, 
                      color: g.color,
                      fontSize: g.icon.startsWith('data:image/') ? '0px' : '22px',
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      padding: 0
                    }}
                  >
                    {g.icon.startsWith('data:image/') ? (
                      <img 
                        src={g.icon} 
                        alt={g.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      g.icon
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold flex items-center gap-1">
                      {g.name}
                      {isCompleted && <Award size={16} className="text-success" />}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-tertiary">
                      <Calendar size={12} />
                      <span>{new Date(g.targetDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>•</span>
                      <span className="font-semibold text-secondary">{getDaysRemaining(g.targetDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold" style={{ marginBottom: '4px' }}>
                    <span className="text-secondary">
                      Terumpul: <span className="text-primary-color font-bold">{formatRupiah(g.currentAmount)}</span>
                    </span>
                    <span className="text-tertiary">
                      Target: {formatRupiah(g.targetAmount)}
                    </span>
                  </div>
                  
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill"
                      style={{ 
                        width: `${percentage}%`,
                        background: `linear-gradient(135deg, ${g.color} 0%, ${g.color}dd 100%)`
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold" style={{ marginTop: '2px' }}>
                    <span className={isCompleted ? "text-success" : "text-secondary"}>
                      {isCompleted ? "🎉 Target Tercapai!" : `Kurang ${formatRupiah(g.targetAmount - g.currentAmount)}`}
                    </span>
                    <span style={{ color: g.color }}>{percentage}%</span>
                  </div>
                </div>

                {/* Quick Add money action */}
                {!isCompleted && (
                  <button 
                    className="btn btn-secondary w-full"
                    style={{ 
                      padding: '10px', 
                      fontSize: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: '6px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)'
                    }}
                    onClick={() => {
                      setAllotError('');
                      setShowAllotModal(g.id);
                    }}
                  >
                    <span>💰 Tabung Sekarang</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add New Goal Modal Sheet */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '18px' }}>
              <h2 className="text-lg font-bold">Buat Target Tabungan</h2>
              <button className="btn btn-text" onClick={() => setShowAddForm(false)} style={{ padding: '4px' }}>Tutup</button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Impian</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Misal: Beli Laptop Baru, Liburan ke Bali" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nominal Target (Rupiah)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Misal: 5000000" 
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Tanggal Tercapai</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {/* Dynamic calculations display */}
              {getSavingsTargetCalculationInfo(targetAmount, targetDate)}

              {/* Icon Selector */}
              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label">Pilih Ikon / Upload Foto</label>
                <div className="flex gap-2" style={{ overflowX: 'auto', padding: '4px 0', alignItems: 'center' }}>
                  {/* Photo Upload Button */}
                  <label 
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1.5px dashed var(--border-glass)',
                      cursor: 'pointer',
                      height: '42px',
                      minWidth: '70px',
                      textAlign: 'center',
                      flexShrink: 0
                    }}
                  >
                    <span>📷 Upload</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) compressAndSetImage(file, false);
                      }} 
                      style={{ display: 'none' }} 
                    />
                  </label>

                  {/* Photo Preview & Revert */}
                  {icon.startsWith('data:image/') && (
                    <div style={{ position: 'relative', width: '42px', height: '42px', flexShrink: 0 }}>
                      <img 
                        src={icon} 
                        alt="Preview" 
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--primary)' }} 
                      />
                      <button
                        type="button"
                        onClick={() => setIcon('🎯')}
                        style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--danger)',
                          color: 'white',
                          border: 'none',
                          fontSize: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          zIndex: 10
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {emojiList.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      style={{
                        fontSize: '20px',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '2px solid transparent',
                        backgroundColor: icon === emoji ? 'var(--primary-glow)' : 'var(--bg-tertiary)',
                        borderColor: icon === emoji ? 'var(--primary)' : 'transparent',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Pilih Warna Aksen</label>
                <div className="flex gap-3">
                  {colorList.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: c,
                        border: '3px solid transparent',
                        borderColor: color === c ? 'var(--text-primary)' : 'transparent',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}
                      aria-label={`Select color ${c}`}
                    ></button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Simpan Target Impian
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Allot Money Modal Sheet */}
      {showAllotModal && (
        <div className="modal-overlay" onClick={() => setShowAllotModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '18px' }}>
              <div>
                <h2 className="text-lg font-bold">Tabung untuk Impian</h2>
                <p className="text-xs text-tertiary" style={{ marginTop: '2px' }}>
                  Saldo kas saat ini: <span className="font-bold text-success">{formatRupiah(cashBalance)}</span>
                </p>
              </div>
              <button className="btn btn-text" onClick={() => setShowAllotModal(null)} style={{ padding: '4px' }}>Batal</button>
            </div>

            <form onSubmit={handleAllotSubmit}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Masukkan Nominal Tabungan</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Misal: 100000" 
                  value={allotAmount}
                  onChange={(e) => setAllotAmount(e.target.value)}
                  autoFocus
                  required
                />
                {allotError && (
                  <p className="text-xs font-semibold text-danger" style={{ marginTop: '4px' }}>{allotError}</p>
                )}
              </div>

              <button type="submit" className="btn btn-success w-full">
                Allokasikan Ke Tabungan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Goal Modal Sheet */}
      {editGoal && (
        <div className="modal-overlay" onClick={() => setEditGoal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '18px' }}>
              <h2 className="text-lg font-bold">Edit Target Tabungan</h2>
              <button className="btn btn-text" onClick={() => setEditGoal(null)} style={{ padding: '4px' }}>Batal</button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Impian</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Misal: Beli Laptop Baru" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nominal Target (Rupiah)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Misal: 5000000" 
                  value={editTargetAmount}
                  onChange={(e) => setEditTargetAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Tanggal Tercapai</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={editTargetDate}
                  onChange={(e) => setEditTargetDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {/* Dynamic calculations display */}
              {getSavingsTargetCalculationInfo(editTargetAmount, editTargetDate)}

              {/* Icon Selector */}
              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label">Pilih Ikon / Upload Foto</label>
                <div className="flex gap-2" style={{ overflowX: 'auto', padding: '4px 0', alignItems: 'center' }}>
                  {/* Photo Upload Button */}
                  <label 
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1.5px dashed var(--border-glass)',
                      cursor: 'pointer',
                      height: '42px',
                      minWidth: '70px',
                      textAlign: 'center',
                      flexShrink: 0
                    }}
                  >
                    <span>📷 Upload</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) compressAndSetImage(file, true);
                      }} 
                      style={{ display: 'none' }} 
                    />
                  </label>

                  {/* Photo Preview & Revert */}
                  {editIcon.startsWith('data:image/') && (
                    <div style={{ position: 'relative', width: '42px', height: '42px', flexShrink: 0 }}>
                      <img 
                        src={editIcon} 
                        alt="Preview" 
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--primary)' }} 
                      />
                      <button
                        type="button"
                        onClick={() => setEditIcon('🎯')}
                        style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--danger)',
                          color: 'white',
                          border: 'none',
                          fontSize: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          zIndex: 10
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {emojiList.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setEditIcon(emoji)}
                      style={{
                        fontSize: '20px',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '2px solid transparent',
                        backgroundColor: editIcon === emoji ? 'var(--primary-glow)' : 'var(--bg-tertiary)',
                        borderColor: editIcon === emoji ? 'var(--primary)' : 'transparent',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Pilih Warna Aksen</label>
                <div className="flex gap-3">
                  {colorList.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditColor(c)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: c,
                        border: '3px solid transparent',
                        borderColor: editColor === c ? 'var(--text-primary)' : 'transparent',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}
                      aria-label={`Select color ${c}`}
                    ></button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
