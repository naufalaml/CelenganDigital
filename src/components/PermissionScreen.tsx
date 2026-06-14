import React, { useState } from 'react';
import { Database, Bell, Shield, CheckCircle } from 'lucide-react';

interface PermissionScreenProps {
  onGranted: () => void;
}

export const PermissionScreen: React.FC<PermissionScreenProps> = ({ onGranted }) => {
  const [showSystemDialog, setShowSystemDialog] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleStartRequest = () => {
    setShowSystemDialog(true);
  };

  const handleAllow = () => {
    setShowSystemDialog(false);
    // Smooth transition out
    setIsAnimatingOut(true);
    setTimeout(() => {
      onGranted();
    }, 500); // match transition duration
  };

  const handleDeny = () => {
    setShowSystemDialog(false);
    // Even if denied in mockup, let them continue but show warning
    alert('Izin penyimpanan disimulasikan. Aplikasi tetap akan beroperasi menggunakan penyimpanan lokal browser.');
    setIsAnimatingOut(true);
    setTimeout(() => {
      onGranted();
    }, 500);
  };

  return (
    <div 
      className="permission-container"
      style={{ 
        opacity: isAnimatingOut ? 0 : 1,
        transform: isAnimatingOut ? 'scale(0.95)' : 'scale(1)'
      }}
    >
      {/* Illustration */}
      <div className="perm-illustration">
        <div className="perm-ill-box">
          <Shield size={38} />
          <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', backgroundColor: 'var(--success)', borderRadius: '50%', padding: '2px', color: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
            <CheckCircle size={14} fill="var(--success)" stroke="white" />
          </div>
        </div>
      </div>

      {/* Intro text */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 className="text-xl font-bold" style={{ marginBottom: '8px' }}>Izin Akses Aplikasi</h2>
        <p className="text-xs text-secondary" style={{ maxWidth: '300px', margin: '0 auto', lineHeight: 1.5 }}>
          CelenganDigital memerlukan beberapa izin akses berikut untuk memastikan data tabungan Anda tersimpan dengan aman di perangkat.
        </p>
      </div>

      {/* Permissions List Card */}
      <div className="perm-card">
        {/* Permission Row 1 */}
        <div className="perm-row">
          <div className="perm-icon-box" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
            <Database size={20} />
          </div>
          <div className="perm-details">
            <h3 className="perm-title">Akses Penyimpanan (Storage)</h3>
            <p className="perm-desc">
              Diperlukan untuk menyimpan database transaksi keuangan, target tabungan, dan riwayat saldo secara offline aman di dalam memori internal handphone Anda.
            </p>
          </div>
        </div>

        {/* Permission Row 2 */}
        <div className="perm-row">
          <div className="perm-icon-box" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            <Bell size={20} />
          </div>
          <div className="perm-details">
            <h3 className="perm-title">Notifikasi Pengingat</h3>
            <p className="perm-desc">
              Mengirimkan notifikasi berkala dan pengingat menabung agar target keuangan dan rencana tabungan masa depan Anda tercapai tepat waktu.
            </p>
          </div>
        </div>
      </div>

      {/* Security note */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: '12px', marginBottom: 'auto', fontSize: '11px', color: 'var(--text-secondary)' }}>
        <span>🔒</span>
        <span style={{ lineHeight: 1.4 }}>
          CelenganDigital berkomitmen penuh menjaga privasi Anda. Seluruh data keuangan disimpan lokal dan tidak dikirim ke server luar mana pun.
        </span>
      </div>

      {/* Primary Action Button */}
      <button 
        type="button" 
        className="btn btn-primary w-full"
        style={{ padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '14px', marginTop: '24px' }}
        onClick={handleStartRequest}
      >
        Lanjutkan & Berikan Izin
      </button>

      {/* Simulated System Dialog Overlay */}
      {showSystemDialog && (
        <div className="sim-dialog-overlay">
          <div className="sim-dialog">
            <div className="sim-dialog-header">
              <div className="sim-dialog-icon">
                <Database size={22} />
              </div>
              <h3 className="sim-dialog-title">Izinkan Akses Penyimpanan?</h3>
            </div>
            <div className="sim-dialog-body">
              Aplikasi "CelenganDigital" meminta izin untuk membaca dan menulis ke penyimpanan perangkat Anda untuk menyimpan berkas database saldo & transaksi.
            </div>
            <div className="sim-dialog-actions">
              <button 
                type="button" 
                className="sim-dialog-btn cancel"
                onClick={handleDeny}
              >
                Tolak
              </button>
              <button 
                type="button" 
                className="sim-dialog-btn confirm"
                onClick={handleAllow}
              >
                Izinkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
