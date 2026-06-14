import React from 'react';
import { Settings as SettingsIcon, User, BarChart3, Trash2, ShieldAlert, Check } from 'lucide-react';
import { formatRupiah } from './Dashboard';

interface SettingsProps {
  username: string;
  onUpdateUsername: (name: string) => void;
  chartStartDate: string;
  chartEndDate: string;
  onUpdateChartRange: (startDate: string, endDate: string) => void;
  onResetData: () => void;
  onLoadDemoData: () => void;
  cashBalance: number;
  transactionsCount: number;
  goalsCount: number;
}

export const Settings: React.FC<SettingsProps> = ({
  username,
  onUpdateUsername,
  chartStartDate,
  chartEndDate,
  onUpdateChartRange,
  onResetData,
  onLoadDemoData,
  cashBalance,
  transactionsCount,
  goalsCount
}) => {
  // Profile Name States
  const [tempName, setTempName] = React.useState(username);
  const [isNameSaved, setIsNameSaved] = React.useState(false);

  // Chart Range States
  const [tempStartDate, setTempStartDate] = React.useState(chartStartDate);
  const [tempEndDate, setTempEndDate] = React.useState(chartEndDate);
  const [dateError, setDateError] = React.useState('');
  const [isChartSaved, setIsChartSaved] = React.useState(false);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    onUpdateUsername(tempName.trim());
    setIsNameSaved(true);
    setTimeout(() => setIsNameSaved(false), 2000);
  };

  const handleSaveChartRange = (e: React.FormEvent) => {
    e.preventDefault();
    setDateError('');

    const start = new Date(tempStartDate);
    const end = new Date(tempEndDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setDateError('Tanggal mulai atau berakhir tidak valid');
      return;
    }

    if (start > end) {
      setDateError('Tanggal mulai harus sebelum tanggal berakhir!');
      return;
    }

    onUpdateChartRange(tempStartDate, tempEndDate);
    setIsChartSaved(true);
    setTimeout(() => setIsChartSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginTop: '8px' }}>
        <div>
          <span className="text-xs font-bold text-tertiary" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
            Preferensi Aplikasi
          </span>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ letterSpacing: '-0.5px' }}>
            <SettingsIcon size={22} className="text-primary-color" />
            <span>Pengaturan</span>
          </h1>
        </div>
      </div>

      {/* Profile Settings Card */}
      <div className="glass-card flex flex-col gap-3">
        <h3 className="text-sm font-bold flex items-center gap-2 text-secondary">
          <User size={16} className="text-primary-color" />
          <span>Profil Pengguna</span>
        </h3>
        
        <form onSubmit={handleSaveName} className="flex gap-2">
          <input 
            type="text" 
            className="form-input" 
            placeholder="Masukkan nama Anda..."
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            style={{ fontSize: '13px', flex: 1 }}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            {isNameSaved ? <Check size={16} /> : 'Simpan'}
          </button>
        </form>
      </div>

      {/* Chart Preferences Card (Start & End Date Picker Form) */}
      <div className="glass-card flex flex-col gap-3">
        <h3 className="text-sm font-bold flex items-center gap-2 text-secondary">
          <BarChart3 size={16} className="text-primary-color" />
          <span>Rentang Waktu Grafik</span>
        </h3>
        
        <form onSubmit={handleSaveChartRange} className="flex flex-col gap-3">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tanggal Mulai (Start Date)</label>
            <input 
              type="date" 
              className="form-input" 
              value={tempStartDate}
              onChange={(e) => setTempStartDate(e.target.value)}
              style={{ fontSize: '13px' }}
              required
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tanggal Berakhir (End Date)</label>
            <input 
              type="date" 
              className="form-input" 
              value={tempEndDate}
              onChange={(e) => setTempEndDate(e.target.value)}
              style={{ fontSize: '13px' }}
              required
            />
          </div>

          {dateError && (
            <p className="text-xs font-semibold text-danger" style={{ marginTop: '2px' }}>{dateError}</p>
          )}

          <button 
            type="submit" 
            className="btn btn-primary w-full flex items-center justify-center gap-2" 
            style={{ padding: '10px', fontSize: '13px', marginTop: '4px' }}
          >
            {isChartSaved ? (
              <>
                <Check size={16} />
                <span>Grafik Diperbarui!</span>
              </>
            ) : (
              'Simpan & Terapkan Grafik'
            )}
          </button>
        </form>
      </div>

      {/* App Stats Box */}
      <div className="glass-card flex flex-col gap-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <h3 className="text-xs font-bold text-tertiary" style={{ textTransform: 'uppercase' }}>Informasi Data Saat Ini</h3>
        <div className="flex flex-col gap-1 text-sm font-semibold text-secondary">
          <div className="flex justify-between">
            <span>Saldo Kas Utama:</span>
            <span className="text-primary-color">{formatRupiah(cashBalance)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Catatan Transaksi:</span>
            <span>{transactionsCount} Transaksi</span>
          </div>
          <div className="flex justify-between">
            <span>Jumlah Target Tabungan:</span>
            <span>{goalsCount} Target</span>
          </div>
        </div>
      </div>

      {/* Demo Data Card */}
      <div className="glass-card flex flex-col gap-3" style={{ border: '1px solid rgba(16, 185, 129, 0.2)' }}>
        <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--success)' }}>
          <span>💡</span>
          <span>Simulasi / Demo Data</span>
        </h3>
        
        <p className="text-xs text-tertiary">
          Ingin menguji fitur dengan data simulasi? Klik tombol di bawah ini untuk mengisi grafik dan target tabungan dengan data contoh secara otomatis.
        </p>

        <button 
          type="button" 
          className="btn btn-success w-full flex items-center justify-center gap-2"
          style={{ 
            fontSize: '13px',
            padding: '10px'
          }}
          onClick={onLoadDemoData}
        >
          <span>📥</span>
          <span>Muat Data Contoh (Demo)</span>
        </button>
      </div>

      {/* Danger Zone Reset Data Card */}
      <div className="glass-card flex flex-col gap-3" style={{ border: '1px solid rgba(244, 63, 94, 0.2)' }}>
        <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--danger)' }}>
          <ShieldAlert size={16} />
          <span>Zona Bahaya</span>
        </h3>
        
        <p className="text-xs text-tertiary">
          Tindakan ini akan menghapus seluruh data transaksi, target tabungan, dan pengaturan kustom yang tersimpan di LocalStorage secara permanen.
        </p>

        <button 
          type="button" 
          className="btn btn-primary w-full flex items-center justify-center gap-2"
          style={{ 
            background: 'var(--danger-gradient)', 
            boxShadow: '0 6px 15px var(--danger-glow)',
            fontSize: '13px',
            padding: '10px'
          }}
          onClick={() => {
            if (window.confirm('APAKAH ANDA YAKIN? Semua riwayat tabungan Anda akan dihapus permanen dan aplikasi akan di-reset ke data bawaan.')) {
              onResetData();
            }
          }}
        >
          <Trash2 size={16} />
          <span>Hapus Semua Data Aplikasi</span>
        </button>
      </div>

      {/* License / Credits */}
      <div style={{ 
        textAlign: 'center', 
        padding: '12px 0 8px 0', 
        fontSize: '11px', 
        color: 'var(--text-tertiary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        opacity: 0.85
      }}>
        <span style={{ fontWeight: 700, letterSpacing: '0.5px' }}>CelenganDigital v1.0.0</span>
        <span>Lisensi MIT © 2026 naufalaml</span>
        <a 
          href="https://github.com/naufalaml" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
        >
          github.com/naufalaml
        </a>
      </div>
    </div>
  );
};
