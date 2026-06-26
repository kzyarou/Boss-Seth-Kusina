import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trash2,
  Shield,
  Ban,
  AlertCircle,
  X } from
'lucide-react';
import { useAppContext } from '../context/AppContext';

// Helper to safely convert timestamp to string
function formatTimestamp(timestamp: any): string {
  if (!timestamp) return 'Just now';
  if (typeof timestamp === 'string') return timestamp;
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  }
  if (timestamp instanceof Date) return timestamp.toLocaleDateString();
  return 'Just now';
}

export function Admin() {
  const { currentUser, recipes, updateRecipeStatus, users, deleteRecipe, deleteUser, addWarning, blockMachineId, unblockMachineId, blockedMachineIds, loadBlockedMachineIds, userWarnings, loadUserWarnings } = useAppContext();
  const [activeTab, setActiveTab] = useState<'recipes' | 'users' | 'errors' | 'blocked'>(
    'recipes'
  );
  const [errorLog, setErrorLog] = useState<any[]>([]);
  const [warningModal, setWarningModal] = useState<{isOpen: boolean, userId: string}>({isOpen: false, userId: ''});
  const [blockModal, setBlockModal] = useState<{isOpen: boolean, machineId: string}>({isOpen: false, machineId: ''});
  const [warningReason, setWarningReason] = useState('');
  const [blockReason, setBlockReason] = useState('');
  useEffect(() => {
    if (activeTab === 'errors') {
      const log = JSON.parse(localStorage.getItem('app_error_log') || '[]');
      setErrorLog(log.reverse()); // Newest first
    }
    if (activeTab === 'blocked') {
      loadBlockedMachineIds();
    }
    if (activeTab === 'users') {
      // Reload user data to get latest warning counts
      Object.keys(users).forEach(userId => {
        loadUserWarnings(userId);
      });
    }
  }, [activeTab, users]);
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-stone-900 mb-4">
          Bawal Ka Dito
        </h2>
        <p className="text-stone-500 mb-6">
          Pang-admin lang 'tong page na 'to, boss.
        </p>
        <Link to="/" className="text-primary-500 hover:underline">
          Uwi na sa Home
        </Link>
      </div>);

  }
  const pendingRecipes = recipes.filter((r) => r.status === 'pending');
  const registeredUsers = Object.values(users).filter((u) => u.role !== 'admin');
  const clearErrors = () => {
    localStorage.removeItem('app_error_log');
    setErrorLog([]);
  };
  const handleDeleteRecipe = async (recipeId: string) => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      await deleteRecipe(recipeId);
    }
  };
  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      await deleteUser(userId);
    }
  };
  const handleAddWarning = async () => {
    if (warningReason.trim()) {
      await addWarning(warningModal.userId, warningReason);
      setWarningReason('');
      setWarningModal({isOpen: false, userId: ''});
      // Force reload warnings for the user to show real-time update
      loadUserWarnings(warningModal.userId);
    }
  };
  const handleBlockMachineId = () => {
    if (blockReason.trim()) {
      blockMachineId(blockModal.machineId, blockReason);
      setBlockReason('');
      setBlockModal({isOpen: false, machineId: ''});
    }
  };
  const handleUnblockMachineId = async (machineId: string) => {
    if (confirm('Are you sure you want to unblock this machine ID?')) {
      await unblockMachineId(machineId);
    }
  };
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-stone-900 mb-2">
          Dashboard ng Admin
        </h1>
        <p className="text-stone-500">
          Manage recipes, view users, and monitor app health.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-stone-200 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab('recipes')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'recipes' ? 'border-primary-500 text-primary-600' : 'border-transparent text-stone-500 hover:text-stone-700'}`}>
          
          <FileText className="w-5 h-5" />
          Pending Recipes ({pendingRecipes.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'users' ? 'border-primary-500 text-primary-600' : 'border-transparent text-stone-500 hover:text-stone-700'}`}>
          
          <Users className="w-5 h-5" />
          Registered Users ({registeredUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('blocked')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'blocked' ? 'border-primary-500 text-primary-600' : 'border-transparent text-stone-500 hover:text-stone-700'}`}>
          
          <Ban className="w-5 h-5" />
          Blocked Machine IDs ({blockedMachineIds.length})
        </button>
        <button
          onClick={() => setActiveTab('errors')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'errors' ? 'border-primary-500 text-primary-600' : 'border-transparent text-stone-500 hover:text-stone-700'}`}>
          
          <AlertTriangle className="w-5 h-5" />
          Breaks / Errors
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'recipes' &&
      <div>
          {pendingRecipes.length > 0 ?
        <div className="space-y-6">
              {pendingRecipes.map((recipe) =>
          <div
            key={recipe.id}
            className="flex flex-col sm:flex-row gap-4 p-4 border border-stone-100 rounded-2xl bg-stone-50">
            
                  <img
              src={recipe.image}
              alt=""
              className="w-full sm:w-32 h-32 object-cover rounded-xl" />
            
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-stone-900">
                          {recipe.title}
                        </h3>
                        <p className="text-sm text-stone-500 mb-2">
                          By {users[recipe.authorId]?.username}
                        </p>
                      </div>
                    </div>
                    <p className="text-stone-600 text-sm line-clamp-2 mb-4">
                      {recipe.description}
                    </p>
                    <div className="flex gap-3 mt-4 sm:mt-0">
                      <button
                  onClick={() => handleDeleteRecipe(recipe.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                  
                        <Trash2 className="w-5 h-5" />
                        Delete
                      </button>
                      <button
                  onClick={() =>
                  updateRecipeStatus(recipe.id, 'rejected')
                  }
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                  
                        <XCircle className="w-5 h-5" />
                        I-Reject
                      </button>
                      <button
                  onClick={() =>
                  updateRecipeStatus(recipe.id, 'approved')
                  }
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-green-600 bg-green-50 hover:bg-green-100 transition-colors">
                  
                        <CheckCircle2 className="w-5 h-5" />
                        I-Approve
                      </button>
                    </div>
                  </div>
                </div>
          )}
            </div> :

        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-stone-900 mb-2">
                Tapos na lahat!
              </h3>
              <p className="text-stone-500">
                Walang pending na luto, petiks muna.
              </p>
            </div>
        }
        </div>
      }

      {activeTab === 'users' &&
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-stone-100 bg-stone-50/50">
            <h3 className="font-bold text-lg text-stone-900">
              Registered Users
            </h3>
            <p className="text-sm text-stone-500">
              Note: PII (Personal Identifiable Information) must be encrypted
              and access-controlled server-side in production.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-100">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Warnings</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {registeredUsers.length > 0 ?
              registeredUsers.map((user) =>
              <tr
                key={user.id}
                className="hover:bg-stone-50/50 transition-colors">
                
                      <td className="px-6 py-4 font-medium text-stone-900">
                        <div className="flex items-center gap-3">
                          <img
                      src={user.avatar}
                      alt=""
                      className="w-8 h-8 rounded-full bg-stone-100" />
                    
                          {user.username}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-stone-600">
                        {user.email || '—'}
                      </td>
                      <td className="px-6 py-4 text-stone-600">
                        {user.phone || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          (user.warningCount || 0) > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {user.warningCount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-stone-500">
                        {new Date(
                    parseInt(user.id.replace('u_', '')) || Date.now()
                  ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setWarningModal({isOpen: true, userId: user.id})}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Give Warning">
                            <AlertCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
              ) :

              <tr>
                    <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-stone-500">
                  
                      Walang registered users pa.
                    </td>
                  </tr>
              }
              </tbody>
            </table>
          </div>
        </div>
      }

      {activeTab === 'blocked' &&
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-stone-900">Blocked Machine IDs</h3>
              <p className="text-sm text-stone-500">Manage blocked devices</p>
            </div>
            <button
              onClick={() => setBlockModal({isOpen: true, machineId: ''})}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
            
                <Ban className="w-4 h-4" />
                Block New
              </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-100">
                <tr>
                  <th className="px-6 py-4">Machine ID</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Blocked Date</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {blockedMachineIds.length > 0 ?
              blockedMachineIds.map((block) =>
              <tr
                key={block.id}
                className="hover:bg-stone-50/50 transition-colors">
                
                      <td className="px-6 py-4 font-mono text-stone-900">
                        {block.machineId}
                      </td>
                      <td className="px-6 py-4 text-stone-600">
                        {block.reason}
                      </td>
                      <td className="px-6 py-4 text-stone-500">
                        {formatTimestamp(block.timestamp)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleUnblockMachineId(block.machineId)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Unblock">
                          <Shield className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
              ) :

              <tr>
                    <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-stone-500">
                  
                      Walang blocked machine IDs pa.
                    </td>
                  </tr>
              }
              </tbody>
            </table>
          </div>
        </div>
      }

      {activeTab === 'errors' &&
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-stone-900">Error Log</h3>
              <p className="text-sm text-stone-500">Caught by ErrorBoundary</p>
            </div>
            {errorLog.length > 0 &&
          <button
            onClick={clearErrors}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
            
                <Trash2 className="w-4 h-4" />
                Clear Log
              </button>
          }
          </div>
          <div className="divide-y divide-stone-100">
            {errorLog.length > 0 ?
          errorLog.map((err, i) =>
          <div
            key={i}
            className="p-6 hover:bg-stone-50/50 transition-colors">
            
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-red-600 font-mono text-sm break-all">
                      {err.message}
                    </h4>
                    <span className="text-xs text-stone-400 whitespace-nowrap ml-4">
                      {new Date(err.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {err.componentStack &&
            <pre className="text-xs text-stone-500 bg-stone-100 p-3 rounded-xl overflow-x-auto mt-3">
                      {err.componentStack}
                    </pre>
            }
                </div>
          ) :

          <div className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3 opacity-50" />
                <p className="text-stone-500 font-medium">
                  Walang breaks, malinis!
                </p>
              </div>
          }
          </div>
        </div>
      }

      {/* Warning Modal */}
      {warningModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-stone-900">Give Warning</h3>
              <button
                onClick={() => setWarningModal({isOpen: false, userId: ''})}
                className="p-2 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={warningReason}
              onChange={(e) => setWarningReason(e.target.value)}
              placeholder="Enter reason for warning..."
              className="w-full bg-stone-50 border border-stone-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl py-3 px-4 outline-none transition-all resize-none h-32 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setWarningModal({isOpen: false, userId: ''})}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleAddWarning}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-yellow-600 bg-yellow-50 hover:bg-yellow-100 transition-colors">
                Send Warning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Machine ID Modal */}
      {blockModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-stone-900">Block Machine ID</h3>
              <button
                onClick={() => setBlockModal({isOpen: false, machineId: ''})}
                className="p-2 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={blockModal.machineId}
              onChange={(e) => setBlockModal({...blockModal, machineId: e.target.value})}
              placeholder="Enter Machine ID..."
              className="w-full bg-stone-50 border border-stone-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl py-3 px-4 outline-none transition-all mb-4"
            />
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Enter reason for blocking..."
              className="w-full bg-stone-50 border border-stone-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl py-3 px-4 outline-none transition-all resize-none h-24 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setBlockModal({isOpen: false, machineId: ''})}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleBlockMachineId}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>);

}