import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Wallet {
  id: number;
  url: string;
  username: string;
  password: string;
  domain: string;
  value: number;
  lastChecked: string | null;
  status: string;
  error?: string;
}

interface WalletSummary {
  total: number;
  totalValue: string;
  active: number;
  pending: number;
}

const WalletCalculator: React.FC = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [summary, setSummary] = useState<WalletSummary>({
    total: 0,
    totalValue: '0.00',
    active: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedWallets, setSelectedWallets] = useState<number[]>([]);
  const [manualWallet, setManualWallet] = useState({
    url: '',
    username: '',
    password: '',
    value: '0'
  });
  const [calculationAmount, setCalculationAmount] = useState('0');
  const [showManualForm, setShowManualForm] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await axios.get('/api/wallet/wallets');
      if (response.data.success) {
        setWallets(response.data.wallets);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
      toast.error('Failed to fetch wallets');
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);

    setLoading(true);
    try {
      const response = await axios.post('/api/wallet/parse-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success(`Parsed ${response.data.count} wallets from document`);
        fetchWallets();
      }
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error.response?.data?.error || 'Failed to parse document');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('screenshot', file);

    setLoading(true);
    try {
      const response = await axios.post('/api/wallet/process-screenshot', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success('Screenshot processed successfully');
      }
    } catch (error: any) {
      console.error('Error uploading screenshot:', error);
      toast.error(error.response?.data?.error || 'Failed to process screenshot');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleAddManualWallet = async () => {
    if (!manualWallet.url || !manualWallet.username || !manualWallet.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post('/api/wallet/wallets', manualWallet);
      if (response.data.success) {
        toast.success('Wallet added successfully');
        setManualWallet({ url: '', username: '', password: '', value: '0' });
        setShowManualForm(false);
        fetchWallets();
      }
    } catch (error: any) {
      console.error('Error adding wallet:', error);
      toast.error(error.response?.data?.error || 'Failed to add wallet');
    }
  };

  const handleFetchWalletValue = async (walletId: number) => {
    setLoading(true);
    try {
      const response = await axios.post(`/api/wallet/wallets/${walletId}/fetch-value`);
      if (response.data.success) {
        toast.success('Wallet value fetched successfully');
        fetchWallets();
      } else {
        toast.error(response.data.result?.error || 'Failed to fetch wallet value');
      }
    } catch (error: any) {
      console.error('Error fetching wallet value:', error);
      toast.error('Failed to fetch wallet value');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchAllValues = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/wallet/wallets/fetch-all');
      if (response.data.success) {
        toast.success('All wallet values updated');
        fetchWallets();
      }
    } catch (error) {
      console.error('Error fetching all values:', error);
      toast.error('Failed to fetch wallet values');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateValue = async (walletId: number, newValue: string) => {
    try {
      const response = await axios.put(`/api/wallet/wallets/${walletId}`, {
        value: parseFloat(newValue)
      });
      if (response.data.success) {
        toast.success('Wallet value updated');
        fetchWallets();
      }
    } catch (error) {
      console.error('Error updating wallet value:', error);
      toast.error('Failed to update wallet value');
    }
  };

  const handleDeleteWallet = async (walletId: number) => {
    if (!window.confirm('Are you sure you want to delete this wallet?')) return;

    try {
      const response = await axios.delete(`/api/wallet/wallets/${walletId}`);
      if (response.data.success) {
        toast.success('Wallet deleted');
        fetchWallets();
      }
    } catch (error) {
      console.error('Error deleting wallet:', error);
      toast.error('Failed to delete wallet');
    }
  };

  const handleCalculation = async (operation: 'add' | 'subtract') => {
    if (selectedWallets.length === 0) {
      toast.error('Please select at least one wallet');
      return;
    }

    const amount = parseFloat(calculationAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const response = await axios.post('/api/wallet/calculate', {
        walletIds: selectedWallets,
        operation,
        amount
      });

      if (response.data.success) {
        toast.success(`${operation === 'add' ? 'Added' : 'Subtracted'} $${amount} to ${selectedWallets.length} wallets`);
        setSelectedWallets([]);
        setCalculationAmount('0');
        fetchWallets();
      }
    } catch (error) {
      console.error('Error performing calculation:', error);
      toast.error('Failed to perform calculation');
    }
  };

  const toggleWalletSelection = (walletId: number) => {
    setSelectedWallets(prev =>
      prev.includes(walletId)
        ? prev.filter(id => id !== walletId)
        : [...prev, walletId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'manual':
      case 'simulated':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'login_failed':
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Web Wallet Value Calculator</h1>
          <p className="text-gray-400">Track and manage your web wallet values in one place</p>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-1">Total Wallets</div>
            <div className="text-3xl font-bold">{summary.total}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-1">Total Value</div>
            <div className="text-3xl font-bold text-green-500">${summary.totalValue}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-1">Active</div>
            <div className="text-3xl font-bold text-green-400">{summary.active}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-gray-400 text-sm mb-1">Pending</div>
            <div className="text-3xl font-bold text-yellow-400">{summary.pending}</div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-bold mb-4">Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 text-center transition">
              <input
                type="file"
                accept=".txt,.doc,.docx,.pdf"
                onChange={handleDocumentUpload}
                className="hidden"
                disabled={loading}
              />
              📄 Upload Document
            </label>

            <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 text-center transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleScreenshotUpload}
                className="hidden"
                disabled={loading}
              />
              📸 Upload Screenshot
            </label>

            <button
              onClick={() => setShowManualForm(!showManualForm)}
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 transition"
            >
              ➕ Add Manual Wallet
            </button>

            <button
              onClick={handleFetchAllValues}
              disabled={loading || wallets.length === 0}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg p-4 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔄 Fetch All Values
            </button>
          </div>

          {/* Manual Wallet Form */}
          {showManualForm && (
            <div className="mt-6 p-6 bg-gray-700 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Add Wallet Manually</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="url"
                  placeholder="Wallet URL"
                  value={manualWallet.url}
                  onChange={(e) => setManualWallet({ ...manualWallet, url: e.target.value })}
                  className="bg-gray-800 text-white border border-gray-600 rounded-lg p-3"
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={manualWallet.username}
                  onChange={(e) => setManualWallet({ ...manualWallet, username: e.target.value })}
                  className="bg-gray-800 text-white border border-gray-600 rounded-lg p-3"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={manualWallet.password}
                  onChange={(e) => setManualWallet({ ...manualWallet, password: e.target.value })}
                  className="bg-gray-800 text-white border border-gray-600 rounded-lg p-3"
                />
                <input
                  type="number"
                  placeholder="Initial Value (optional)"
                  value={manualWallet.value}
                  onChange={(e) => setManualWallet({ ...manualWallet, value: e.target.value })}
                  className="bg-gray-800 text-white border border-gray-600 rounded-lg p-3"
                />
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleAddManualWallet}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-6 py-2 transition"
                >
                  Add Wallet
                </button>
                <button
                  onClick={() => setShowManualForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-6 py-2 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Calculation Section */}
        {selectedWallets.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
            <h2 className="text-xl font-bold mb-4">
              Calculate ({selectedWallets.length} wallet{selectedWallets.length > 1 ? 's' : ''} selected)
            </h2>
            <div className="flex gap-4 items-center">
              <input
                type="number"
                placeholder="Amount"
                value={calculationAmount}
                onChange={(e) => setCalculationAmount(e.target.value)}
                className="bg-gray-700 text-white border border-gray-600 rounded-lg p-3 flex-1"
              />
              <button
                onClick={() => handleCalculation('add')}
                className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-6 py-3 transition"
              >
                ➕ Add
              </button>
              <button
                onClick={() => handleCalculation('subtract')}
                className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-6 py-3 transition"
              >
                ➖ Subtract
              </button>
              <button
                onClick={() => setSelectedWallets([])}
                className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-6 py-3 transition"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Wallets List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold">Wallets</h2>
          </div>
          <div className="divide-y divide-gray-700">
            {wallets.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No wallets yet. Upload a document or add a wallet manually to get started.
              </div>
            ) : (
              wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className={`p-6 hover:bg-gray-750 transition ${
                    selectedWallets.includes(wallet.id) ? 'bg-gray-750 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedWallets.includes(wallet.id)}
                        onChange={() => toggleWalletSelection(wallet.id)}
                        className="mt-1 w-5 h-5 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <a
                            href={wallet.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 font-medium text-lg"
                          >
                            {wallet.domain}
                          </a>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(wallet.status)}`}>
                            {wallet.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <div>Username: {wallet.username}</div>
                          {wallet.lastChecked && (
                            <div>Last checked: {new Date(wallet.lastChecked).toLocaleString()}</div>
                          )}
                          {wallet.error && (
                            <div className="text-red-400">Error: {wallet.error}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        value={wallet.value}
                        onChange={(e) => handleUpdateValue(wallet.id, e.target.value)}
                        className="bg-gray-700 text-white border border-gray-600 rounded-lg p-2 w-32 text-right"
                      />
                      <span className="text-2xl font-bold text-green-500 w-24 text-right">
                        ${wallet.value.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleFetchWalletValue(wallet.id)}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition disabled:opacity-50"
                      >
                        🔄
                      </button>
                      <button
                        onClick={() => handleDeleteWallet(wallet.id)}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
              <div className="text-xl">Processing...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletCalculator;
