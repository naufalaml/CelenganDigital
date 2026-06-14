import React, { useState, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet, Target, Sparkles, TrendingUp } from 'lucide-react';
import type { Transaction } from '../types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardProps {
  transactions: Transaction[];
  theme: 'light' | 'dark';
  onNavigate: (tab: string) => void;
  username: string;
  chartStartDate: string;
  chartEndDate: string;
}

export const formatRupiah = (num: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatNumberOnly = (num: number) => {
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(num));
  return num < 0 ? `-${formatted}` : formatted;
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  transactions, 
  theme, 
  onNavigate,
  username,
  chartStartDate,
  chartEndDate
}) => {
  const [showIncome, setShowIncome] = useState(true);
  const [showExpense, setShowExpense] = useState(true);

  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalAllottedToGoals = transactions
    .filter(t => t.type === 'tabungan')
    .reduce((sum, t) => sum + t.amount, 0);

  // Current balance = Income - Expense - Tabungan alokasi (since saving is locking away money)
  // Wait, or does tabungan count as savings balance? In Celengan, the primary cash balance is Income - Expense - Tabungan
  // And the savings balance is the totalAllottedToGoals. Let's make it clear.
  // Cash Saldo = Income - Expense - Tabungan alokasi
  // Total Tabungan = totalAllottedToGoals
  const cashBalance = totalIncome - totalExpense - totalAllottedToGoals;
  const savingsBalance = totalAllottedToGoals;

  // Memoize labels and data calculation to avoid recalculating array refs on every render
  const { chartLabels, baselineIncome, baselineExpense, rangeText } = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    // Fallbacks if dates are invalid
    let start = new Date(chartStartDate);
    let end = new Date(chartEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      // Fallback: 6 months ago to today
      const today = new Date();
      start = new Date(today.getFullYear(), today.getMonth() - 5, 1);
      end = today;
    }

    // Calculate actual difference in days (inclusive)
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const labels: string[] = [];
    const inc: number[] = [];
    const exp: number[] = [];
    let rangeText = '';

    if (diffDays < 30) {
      // Daily mode
      rangeText = `${diffDays} Hari`;
      
      let current = new Date(start);
      for (let i = 0; i < diffDays; i++) {
        const year = current.getFullYear();
        const month = current.getMonth();
        const date = current.getDate();
        
        labels.push(`${date} ${months[month]}`);

        const incomeSum = transactions
          .filter(t => {
            const tDate = new Date(t.date);
            return tDate.getFullYear() === year && tDate.getMonth() === month && tDate.getDate() === date && t.type === 'pemasukan';
          })
          .reduce((sum, t) => sum + t.amount, 0);

        const expenseSum = transactions
          .filter(t => {
            const tDate = new Date(t.date);
            return tDate.getFullYear() === year && tDate.getMonth() === month && tDate.getDate() === date && t.type === 'pengeluaran';
          })
          .reduce((sum, t) => sum + t.amount, 0);

        inc.push(incomeSum);
        exp.push(expenseSum);

        current.setDate(current.getDate() + 1);
      }
    } else {
      // Monthly mode
      let monthsCount = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
      rangeText = `${monthsCount} Bulan`;

      let current = new Date(start.getFullYear(), start.getMonth(), 1);
      const targetEnd = new Date(end.getFullYear(), end.getMonth(), 1);
      
      let safetyCounter = 0;
      const queryMonths: { year: number, month: number }[] = [];
      while (current <= targetEnd && safetyCounter < 24) {
        queryMonths.push({
          year: current.getFullYear(),
          month: current.getMonth()
        });
        labels.push(`${months[current.getMonth()]} '${current.getFullYear().toString().substring(2)}`);
        current.setMonth(current.getMonth() + 1);
        safetyCounter++;
      }

      queryMonths.forEach(({ year, month }) => {
        const incomeSum = transactions
          .filter(t => {
            const tDate = new Date(t.date);
            return tDate.getFullYear() === year && tDate.getMonth() === month && t.type === 'pemasukan';
          })
          .reduce((sum, t) => sum + t.amount, 0);

        const expenseSum = transactions
          .filter(t => {
            const tDate = new Date(t.date);
            return tDate.getFullYear() === year && tDate.getMonth() === month && t.type === 'pengeluaran';
          })
          .reduce((sum, t) => sum + t.amount, 0);

        inc.push(incomeSum);
        exp.push(expenseSum);
      });
    }

    if (labels.length === 0) {
      labels.push("Data");
      inc.push(0);
      exp.push(0);
    }

    return {
      chartLabels: labels,
      baselineIncome: inc,
      baselineExpense: exp,
      rangeText
    };
  }, [transactions, chartStartDate, chartEndDate]);

  const chartThemeColors = useMemo(() => ({
    income: theme === 'dark' ? '#34d399' : '#10b981',
    incomeGlow: theme === 'dark' ? 'rgba(52, 211, 153, 0.12)' : 'rgba(16, 185, 129, 0.08)',
    expense: theme === 'dark' ? '#fb7185' : '#f43f5e',
    expenseGlow: theme === 'dark' ? 'rgba(251, 113, 133, 0.12)' : 'rgba(244, 63, 94, 0.08)',
    gridColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
    textColor: theme === 'dark' ? '#94a3b8' : '#64748b'
  }), [theme]);

  const lineChartData = useMemo(() => ({
    labels: chartLabels,
    datasets: [
      {
        label: 'Pemasukan',
        data: baselineIncome,
        borderColor: chartThemeColors.income,
        backgroundColor: chartThemeColors.incomeGlow,
        fill: true,
        tension: 0.42,
        borderWidth: 2.5,
        pointBackgroundColor: chartThemeColors.income,
        pointBorderColor: 'transparent',
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: chartThemeColors.income,
        pointHoverBorderColor: theme === 'dark' ? '#0f1016' : '#ffffff',
        pointHoverBorderWidth: 2,
        hidden: !showIncome,
      },
      {
        label: 'Pengeluaran',
        data: baselineExpense,
        borderColor: chartThemeColors.expense,
        backgroundColor: chartThemeColors.expenseGlow,
        fill: true,
        tension: 0.42,
        borderWidth: 2.5,
        pointBackgroundColor: chartThemeColors.expense,
        pointBorderColor: 'transparent',
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: chartThemeColors.expense,
        pointHoverBorderColor: theme === 'dark' ? '#0f1016' : '#ffffff',
        pointHoverBorderWidth: 2,
        hidden: !showExpense,
      }
    ]
  }), [chartLabels, baselineIncome, baselineExpense, chartThemeColors, showIncome, showExpense, theme]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 350,
      easing: 'easeInOutQuad' as const
    },
    hover: {
      mode: 'index' as const,
      intersect: false
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        padding: 10,
        cornerRadius: 12,
        backgroundColor: theme === 'dark' ? '#171821' : '#ffffff',
        titleColor: theme === 'dark' ? '#f8fafc' : '#0f172a',
        bodyColor: theme === 'dark' ? '#94a3b8' : '#475569',
        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        borderWidth: 1,
        titleFont: {
          family: 'Plus Jakarta Sans',
          size: 12,
          weight: 'bold' as const
        },
        bodyFont: {
          family: 'Plus Jakarta Sans',
          size: 12
        },
        callbacks: {
          label: (context: any) => {
            return ` ${context.dataset.label}: ${formatRupiah(context.parsed.y)}`;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: chartThemeColors.textColor,
          font: {
            family: 'Plus Jakarta Sans',
            size: 10
          }
        }
      },
      y: {
        grid: {
          color: chartThemeColors.gridColor
        },
        ticks: {
          color: chartThemeColors.textColor,
          font: {
            family: 'Plus Jakarta Sans',
            size: 9
          },
          callback: (value: any) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`;
            if (value >= 1000) return `${value / 1000}rb`;
            return value;
          }
        },
        beginAtZero: false,
        grace: '8%'
      }
    }
  }), [chartThemeColors, theme]);

  return (
    <div className="flex flex-col gap-4">
      {/* Welcome & Info */}
      <div className="flex items-center justify-between" style={{ marginTop: '8px' }}>
        <div>
          <span className="text-xs font-bold text-tertiary" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
            Dompet Digital Anda
          </span>
          <h1 className="text-2xl font-bold" style={{ letterSpacing: '-0.5px', marginTop: '2px' }}>
            Halo, {username}! 👋
          </h1>
        </div>
        <div 
          className="flex items-center gap-1 text-xs font-semibold badge badge-success"
          style={{ padding: '6px 12px', background: 'var(--success-glow)' }}
        >
          <Sparkles size={12} className="text-success" />
          <span>Aman</span>
        </div>
      </div>

      {/* Primary Balance Card */}
      <div 
        className="glass-card flex flex-col justify-between" 
        style={{ 
          background: 'var(--primary-gradient)', 
          color: 'white',
          border: 'none',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 12px 28px rgba(99, 102, 241, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background glow vector */}
        <div 
          style={{
            position: 'absolute',
            width: '160px',
            height: '160px',
            background: 'rgba(255, 255, 255, 0.12)',
            borderRadius: '50%',
            top: '-40px',
            right: '-40px',
            pointerEvents: 'none'
          }}
        ></div>

        <div className="flex items-center justify-between" style={{ color: 'white' }}>
          <div className="flex items-center gap-2">
            <Wallet size={18} opacity={0.8} />
            <span style={{ fontSize: '13px', fontWeight: 500, opacity: 0.9, color: 'white' }}>Saldo Utama (Kas)</span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '20px', color: 'white' }}>
            IDR
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', margin: '14px 0 10px 0', color: 'white' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, marginRight: '4px', color: '#ffffff', opacity: 0.9 }}>Rp</span>
          <h2 className="text-3xl font-bold" style={{ margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-1px', color: '#ffffff', display: 'inline' }}>
            {formatNumberOnly(cashBalance)}
          </h2>
        </div>

        <div className="flex justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '12px', marginTop: '4px', color: 'white' }}>
          <div>
            <span style={{ fontSize: '11px', opacity: 0.75, display: 'block', color: 'white' }}>Total Tabungan Target</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, marginRight: '2px', color: '#ffffff', opacity: 0.9 }}>Rp</span>
              {formatNumberOnly(savingsBalance)}
            </span>
          </div>
          <button 
            className="btn btn-text" 
            onClick={() => onNavigate('goals')}
            style={{ 
              color: 'white', 
              fontSize: '12px', 
              fontWeight: 700, 
              padding: 0, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px' 
            }}
          >
            <Target size={14} />
            <span>Lihat Target</span>
          </button>
        </div>
      </div>

      {/* Stats Quick Box */}
      <div className="stats-box">
        <div className="stats-card pemasukan">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-secondary">Pemasukan</span>
            <div style={{ color: 'var(--success)' }}><ArrowUpRight size={16} /></div>
          </div>
          <span className="text-base font-bold text-success" style={{ letterSpacing: '-0.5px' }}>
            {formatRupiah(totalIncome)}
          </span>
        </div>
        <div className="stats-card pengeluaran">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-secondary">Pengeluaran</span>
            <div style={{ color: 'var(--danger)' }}><ArrowDownRight size={16} /></div>
          </div>
          <span className="text-base font-bold text-danger" style={{ letterSpacing: '-0.5px' }}>
            {formatRupiah(totalExpense)}
          </span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass-card flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-primary-color" />
            <h3 className="text-base font-bold">Tren Keuangan</h3>
          </div>
          <span className="text-xs text-tertiary" style={{ fontWeight: 600 }}>{rangeText}</span>
        </div>

        {/* Custom Legend Buttons */}
        <div className="flex gap-2" style={{ marginTop: '-4px' }}>
          <button 
            type="button"
            className="btn" 
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              borderRadius: '20px',
              backgroundColor: showIncome ? 'var(--success-glow)' : 'var(--bg-tertiary)',
              color: showIncome ? 'var(--success)' : 'var(--text-tertiary)',
              border: showIncome ? '1px solid var(--success)' : '1px solid transparent',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onClick={() => setShowIncome(!showIncome)}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
            <span>Pemasukan</span>
          </button>

          <button 
            type="button"
            className="btn" 
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              borderRadius: '20px',
              backgroundColor: showExpense ? 'var(--danger-glow)' : 'var(--bg-tertiary)',
              color: showExpense ? 'var(--danger)' : 'var(--text-tertiary)',
              border: showExpense ? '1px solid var(--danger)' : '1px solid transparent',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onClick={() => setShowExpense(!showExpense)}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--danger)' }}></span>
            <span>Pengeluaran</span>
          </button>
        </div>
        
        <div style={{ height: '180px', position: 'relative' }}>
          <Line data={lineChartData} options={chartOptions} />
        </div>
      </div>


    </div>
  );
};
