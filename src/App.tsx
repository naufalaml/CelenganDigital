import { useState, useEffect } from 'react';
import { MobileFrame } from './components/MobileFrame';
import { Dashboard } from './components/Dashboard';
import { SavingsGoals } from './components/SavingsGoals';
import { History } from './components/History';
import { TransactionForm } from './components/TransactionForm';
import { Settings } from './components/Settings';
import { SplashScreen } from './components/SplashScreen';
import { PermissionScreen } from './components/PermissionScreen';
import type { Transaction, SavingsGoal } from './types';
import { scheduleDailyNotifications } from './utils/notifications';
import { Home, Target, Plus, Receipt, Settings as SettingsIcon } from 'lucide-react';

function App() {
  // Launch state machine: 'splash' | 'permissions' | 'ready'
  const [appState, setAppState] = useState<'splash' | 'permissions' | 'ready'>('splash');

  const handleSplashFinished = () => {
    const isGranted = localStorage.getItem('app_permissions_granted') === 'true';
    if (isGranted) {
      setAppState('ready');
    } else {
      setAppState('permissions');
    }
  };

  const handlePermissionGranted = () => {
    localStorage.setItem('app_permissions_granted', 'true');
    setAppState('ready');
  };

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
  });

  // Active Tab State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Core Data States
  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const savedGoals = localStorage.getItem('savings_goals');
    return savedGoals ? JSON.parse(savedGoals) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTx = localStorage.getItem('transactions');
    return savedTx ? JSON.parse(savedTx) : [];
  });

  // User Preferences States
  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem('settings_username') || 'Kak';
  });

  // Helper functions for default chart dates
  const getDefaultStartDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-01`;
  };

  const getDefaultEndDate = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const [chartStartDate, setChartStartDate] = useState<string>(() => {
    return localStorage.getItem('settings_chart_start_date') || getDefaultStartDate();
  });

  const [chartEndDate, setChartEndDate] = useState<string>(() => {
    return localStorage.getItem('settings_chart_end_date') || getDefaultEndDate();
  });

  // Sync Preferences to LocalStorage
  useEffect(() => {
    localStorage.setItem('settings_username', username);
  }, [username]);

  useEffect(() => {
    localStorage.setItem('settings_chart_start_date', chartStartDate);
  }, [chartStartDate]);

  useEffect(() => {
    localStorage.setItem('settings_chart_end_date', chartEndDate);
  }, [chartEndDate]);

  // Reset Data Handler
  const handleResetData = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Auto-update chartEndDate to today if a new day has started
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastOpened = localStorage.getItem('last_opened_date');
    if (lastOpened !== todayStr) {
      setChartEndDate(todayStr);
      localStorage.setItem('last_opened_date', todayStr);
    }
  }, []);

  // Schedule daily notifications when app is ready
  useEffect(() => {
    if (appState === 'ready') {
      scheduleDailyNotifications();
    }
  }, [appState]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('savings_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Calculations for balance checks
  const totalIncome = transactions
    .filter(t => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalAllotted = transactions
    .filter(t => t.type === 'tabungan')
    .reduce((sum, t) => sum + t.amount, 0);

  const cashBalance = totalIncome - totalExpense - totalAllotted;

  // Add Transaction handler
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}`
    };

    setTransactions(prev => [newTx, ...prev]);
  };

  // Delete Transaction handler
  const handleDeleteTransaction = (id: string) => {
    const txToDelete = transactions.find(t => t.id === id);
    if (!txToDelete) return;

    // If deleting a goal allotment, we must subtract that amount from the goal's current amount!
    if (txToDelete.type === 'tabungan' && txToDelete.goalId) {
      setGoals(prevGoals => 
        prevGoals.map(g => 
          g.id === txToDelete.goalId 
            ? { ...g, currentAmount: Math.max(0, g.currentAmount - txToDelete.amount) } 
            : g
        )
      );
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Add Goal handler
  const handleAddGoal = (newGoalData: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const newGoal: SavingsGoal = {
      ...newGoalData,
      id: `goal-${Date.now()}`,
      currentAmount: 0
    };

    setGoals(prev => [...prev, newGoal]);
  };

  // Delete Goal handler
  const handleDeleteGoal = (id: string) => {
    // We remove the goal, and clean up transactions associated with this goal (removing their goalId link)
    setGoals(prev => prev.filter(g => g.id !== id));
    setTransactions(prev => 
      prev.map(t => t.goalId === id ? { ...t, goalId: undefined } : t)
    );
  };

  // Update/Edit Goal handler
  const handleUpdateGoal = (updatedGoal: SavingsGoal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  // Allot Cash to Savings Goal handler
  const handleAllotMoney = (goalId: string, amount: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    // 1. Create a tabungan type transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'tabungan',
      amount,
      category: goal.name, // Goal name acts as category
      date: new Date().toISOString().split('T')[0],
      note: `Tabungan untuk target ${goal.name}`,
      goalId
    };

    // 2. Add transaction and update goal's currentAmount
    setTransactions(prev => [newTx, ...prev]);
    setGoals(prevGoals => 
      prevGoals.map(g => 
        g.id === goalId 
          ? { ...g, currentAmount: g.currentAmount + amount } 
          : g
      )
    );
  };

  // Render Active Tab Component
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            transactions={transactions} 
            theme={theme} 
            onNavigate={setActiveTab} 
            username={username}
            chartStartDate={chartStartDate}
            chartEndDate={chartEndDate}
          />
        );
      case 'goals':
        return (
          <SavingsGoals 
            goals={goals} 
            onAddGoal={handleAddGoal} 
            onDeleteGoal={handleDeleteGoal} 
            onUpdateGoal={handleUpdateGoal}
            onAllotMoney={handleAllotMoney}
            cashBalance={cashBalance}
          />
        );
      case 'history':
        return (
          <History 
            transactions={transactions} 
            onDeleteTransaction={handleDeleteTransaction} 
          />
        );
      case 'settings':
        return (
          <Settings 
            username={username}
            onUpdateUsername={setUsername}
            chartStartDate={chartStartDate}
            chartEndDate={chartEndDate}
            onUpdateChartRange={(start, end) => {
              setChartStartDate(start);
              setChartEndDate(end);
            }}
            onResetData={handleResetData}
            cashBalance={cashBalance}
            transactionsCount={transactions.length}
            goalsCount={goals.length}
          />
        );
      default:
        return (
          <Dashboard 
            transactions={transactions} 
            theme={theme} 
            onNavigate={setActiveTab} 
            username={username}
            chartStartDate={chartStartDate}
            chartEndDate={chartEndDate}
          />
        );
    }
  };

  return (
    <MobileFrame 
      theme={theme} 
      setTheme={setTheme}
      bottomNav={
        appState === 'ready' ? (
          <nav className="bottom-nav">
            <button 
              className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              aria-label="Dashboard Tab"
            >
              <Home size={22} style={{ marginBottom: '4px' }} />
              <span>Dashboard</span>
            </button>

            <button 
              className={`bottom-nav-item ${activeTab === 'goals' ? 'active' : ''}`}
              onClick={() => setActiveTab('goals')}
              aria-label="Goals Tab"
            >
              <Target size={22} style={{ marginBottom: '4px' }} />
              <span>Target</span>
            </button>

            {/* Center Float Button to record transaction */}
            <button 
              className="bottom-nav-action"
              onClick={() => setShowAddModal(true)}
              aria-label="Tambah Transaksi"
            >
              <Plus size={26} />
            </button>

            <button 
              className={`bottom-nav-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
              aria-label="Transactions Tab"
            >
              <Receipt size={22} style={{ marginBottom: '4px' }} />
              <span>Transaksi</span>
            </button>

            <button 
              className={`bottom-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
              aria-label="Settings Tab"
            >
              <SettingsIcon size={22} style={{ marginBottom: '4px' }} />
              <span>Pengaturan</span>
            </button>
          </nav>
        ) : undefined
      }
    >
      {appState === 'splash' && (
        <SplashScreen onFinished={handleSplashFinished} />
      )}
      
      {appState === 'permissions' && (
        <PermissionScreen onGranted={handlePermissionGranted} />
      )}

      {appState === 'ready' && (
        <>
          {/* Content Area */}
          {renderContent()}

          {/* Transaction Entry Form Sheet Overlay */}
          {showAddModal && (
            <TransactionForm 
              onAddTransaction={handleAddTransaction} 
              onClose={() => setShowAddModal(false)} 
            />
          )}
        </>
      )}
    </MobileFrame>
  );
}

export default App;
