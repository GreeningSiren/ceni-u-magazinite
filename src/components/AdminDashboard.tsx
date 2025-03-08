import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Check, X, AlertCircle } from 'lucide-react';
import Dashboard from '../pages/Dashboard';

interface PendingItem {
  id: number;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  type: 'store' | 'product';
}

export default function AdminDashboard() {
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = async () => {
    setLoading(true);
    try {
      // Fetch pending stores
      const { data: stores, error: storesError } = await supabase
        .from('stores')
        .select('id, name, status, created_at')
        .eq('status', 'pending');

      if (storesError) throw storesError;

      // Fetch pending products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, status, created_at')
        .eq('status', 'pending');

      if (productsError) throw productsError;

      const allPendingItems = [
        ...(stores?.map(store => ({ ...store, type: 'store' as const })) || []),
        ...(products?.map(product => ({ ...product, type: 'product' as const })) || [])
      ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      setPendingItems(allPendingItems);
    } catch (error) {
      console.error('Error fetching pending items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeration = async (item: PendingItem, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from(item.type === 'store' ? 'stores' : 'products')
        .update({ status: newStatus })
        .eq('id', item.id);

      if (error) throw error;
      
      // Refresh the list after successful update
      await fetchPendingItems();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Dashboard />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Чакащи одобрение ({pendingItems.length})
      </h2>

      {pendingItems.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {pendingItems.map((item) => (
              <li key={`${item.type}-${item.id}`}>
                <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.type === 'store' ? 'Магазин' : 'Продукт'} •{' '}
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleModeration(item, 'approved')}
                      className="inline-flex items-center p-2 border border-transparent rounded-full text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleModeration(item, 'rejected')}
                      className="inline-flex items-center p-2 border border-transparent rounded-full text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12">
          <Check className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Няма чакащи одобрение
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Всички магазини и продукти са прегледани.
          </p>
        </div>
      )}
    </div>
  );
}