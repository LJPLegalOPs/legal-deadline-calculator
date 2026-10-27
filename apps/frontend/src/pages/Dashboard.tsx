import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { caseAPI, deadlineAPI } from '../services/api';

interface Case {
  id: number;
  name: string;
  caseNumber?: string;
  baseDate: string;
  jurisdiction: string;
  practiceArea?: string;
}

interface Deadline {
  id: number;
  ruleName: string;
  calculatedDate: string;
  citation?: string;
  adjustments?: string[];
}

export function Dashboard() {
  const { user, logout } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewCaseForm, setShowNewCaseForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    caseNumber: '',
    baseDate: '',
    jurisdiction: 'louisiana',
    practiceArea: 'appeal',
  });

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await caseAPI.getCases();
      setCases(response.data);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to load cases';
      console.error('Load cases error:', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const loadDeadlines = async (caseId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await deadlineAPI.getDeadlines(caseId);
      setDeadlines(response.data);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to load deadlines';
      console.error('Load deadlines error:', msg);
      setError(msg);
      setDeadlines([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const calculateDeadlines = async (caseId: number, baseDate: string, jurisdiction: string, practiceArea?: string) => {
    if (calculating) {
      console.log('⏳ Already calculating, skipping...');
      return false;
    }

    try {
      console.log('🚀 Starting calculation:', { caseId, baseDate, jurisdiction, practiceArea });
      setCalculating(true);
      setError(null);
      
      console.log('📡 Calling deadlineAPI.calculate...');
      const response = await deadlineAPI.calculate({
        caseId,
        baseDate,
        jurisdiction,
        practiceArea,
      });
      
      console.log('✅ Calculate response received:', response.data);
      await loadDeadlines(caseId);
      return true;
    } catch (err: any) {
      console.error('❌ Calculate error caught:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to calculate deadlines';
      setError(msg);
      return false;
    } finally {
      setCalculating(false);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const caseResponse = await caseAPI.createCase(formData);
      const newCase = caseResponse.data;
      
      setCases([...cases, newCase]);
      setFormData({ name: '', caseNumber: '', baseDate: '', jurisdiction: 'louisiana', practiceArea: 'appeal' });
      setShowNewCaseForm(false);
      setSelectedCase(newCase);
      
      await calculateDeadlines(newCase.id, formData.baseDate, formData.jurisdiction, formData.practiceArea);
    } catch (err: any) {
      setError(err.message || 'Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  const handleCaseSelect = async (caseItem: Case) => {
    setSelectedCase(caseItem);
    setError(null);
    await loadDeadlines(caseItem.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.firmName || user?.email}</p>
          </div>
          <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Cases</h2>
              <button onClick={() => setShowNewCaseForm(!showNewCaseForm)} className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
                + New Case
              </button>

              {showNewCaseForm && (
                <form onSubmit={handleCreateCase} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
                  <input type="text" placeholder="Case name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <input type="text" placeholder="Case number" value={formData.caseNumber} onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <input type="date" value={formData.baseDate} onChange={(e) => setFormData({ ...formData, baseDate: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  <select value={formData.practiceArea} onChange={(e) => setFormData({ ...formData, practiceArea: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="appeal">Appeal</option>
                    <option value="writ">Writ</option>
                    <option value="discovery">Discovery</option>
                  </select>
                  <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg text-sm">
                    {loading ? 'Creating...' : 'Create & Calculate'}
                  </button>
                </form>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {cases.map((caseItem) => (
                  <button key={caseItem.id} onClick={() => handleCaseSelect(caseItem)} className={`w-full text-left p-3 rounded-lg transition ${selectedCase?.id === caseItem.id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'}`}>
                    <p className="font-semibold text-gray-900">{caseItem.name}</p>
                    {caseItem.caseNumber && <p className="text-sm text-gray-600">{caseItem.caseNumber}</p>}
                    <p className="text-xs text-gray-500">{new Date(caseItem.baseDate).toLocaleDateString()}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedCase ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedCase.name}</h2>
                {selectedCase.caseNumber && <p className="text-gray-600 mb-4">Case #: {selectedCase.caseNumber}</p>}
                
                <button 
                  onClick={() => calculateDeadlines(selectedCase.id, selectedCase.baseDate, selectedCase.jurisdiction || 'louisiana', selectedCase.practiceArea)} 
                  disabled={loading || calculating} 
                  className="mb-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  {calculating ? 'Calculating...' : 'Calculate Deadlines'}
                </button>

                {loading ? (
                  <p className="text-gray-500">Loading deadlines...</p>
                ) : deadlines.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Calculated Deadlines</h3>
                    {deadlines.map((deadline) => (
                      <div key={deadline.id} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                        <p className="font-semibold text-gray-900">{deadline.ruleName}</p>
                        <p className="text-lg font-bold text-blue-600 mt-1">
                          {new Date(deadline.calculatedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        {deadline.adjustments && deadline.adjustments.length > 0 && <p className="text-sm text-orange-600 mt-2">⚠️ {deadline.adjustments.join(' | ')}</p>}
                        {deadline.citation && <p className="text-xs text-gray-500 mt-2">Citation: {deadline.citation}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No deadlines calculated yet. Click "Calculate Deadlines" to generate them.</p>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">Select a case to view deadlines</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
