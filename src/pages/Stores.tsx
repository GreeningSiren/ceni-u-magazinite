import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Store, Edit, Trash2, MapPin } from 'lucide-react';
import { useAuth } from '../lib/auth';

interface StoreType {
  id: number;
  name: string;
  address: string | null;
  region: string | null;
  zip: string | null;
  image_url: string | null;
  maps_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  user_id: string;
}

interface RegionType {
  id: number;
  name: string;
}

export default function Stores() {
  const { user, isAdmin } = useAuth();
  const [stores, setStores] = useState<StoreType[]>([]);
  const [regions, setRegions] = useState<RegionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    region: '',
    zip: '',
    image_url: '',
    maps_url: ''
  });

  useEffect(() => {
    fetchStores();
    fetchRegions();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error('Грешка при извличане на магазини:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setRegions(data || []);
    } catch (error) {
      console.error('Грешка при извличане на райони:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingStore(null);
    setFormData({
      name: '',
      address: '',
      region: '',
      zip: '',
      image_url: '',
      maps_url: ''
    });
    setShowModal(true);
  };

  const openEditModal = (store: StoreType) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      address: store.address || '',
      region: store.region || '',
      zip: store.zip || '',
      image_url: store.image_url || '',
      maps_url: store.maps_url || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Потребителят не е удостоверен');
      
      const storeData = {
        name: formData.name,
        address: formData.address || null,
        region: formData.region || null,
        zip: formData.zip || null,
        image_url: formData.image_url || null,
        maps_url: formData.maps_url || null,
        user_id: user.data.user.id,
        status: isAdmin ? 'approved' : 'pending'
      };
      
      if (editingStore) {
        // Update existing store
        const { error } = await supabase
          .from('stores')
          .update(storeData)
          .eq('id', editingStore.id);
        
        if (error) throw error;
      } else {
        // Insert new store
        const { error } = await supabase
          .from('stores')
          .insert([storeData]);
        
        if (error) throw error;
      }
      
      setShowModal(false);
      fetchStores();
    } catch (error) {
      console.error('Грешка при запазване на магазин:', error);
    }
  };

  const canEditStore = (store: StoreType) => {
    return isAdmin || (user && store.user_id === user.id);
  };

  const canDeleteStore = () => {
    return isAdmin;
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете този магазин? Това ще изтрие и всички свързани записи на цени.')) {
      return;
    }
    
    try {
      // First delete related price records
      const { error: priceError } = await supabase
        .from('prices')
        .delete()
        .eq('store_id', id);
      
      if (priceError) throw priceError;
      
      // Then delete the store
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      fetchStores();
    } catch (error) {
      console.error('Грешка при изтриване на магазин:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Магазини</h1>
        {user && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Добави магазин
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          {stores.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {stores.map((store) => (
                <li key={store.id}>
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-md p-2">
                        {store.image_url ? (
                          <img 
                            src={store.image_url} 
                            alt={store.name} 
                            className="h-10 w-10 object-cover rounded"
                          />
                        ) : (
                          <Store className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{store.name}</h3>
                        <div className="mt-1 flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 dark:text-gray-400">
                          {store.region && (
                            <span className="flex items-center mr-3">
                              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                              Район: {store.region}
                            </span>
                          )}
                          {store.address && (
                            <span className="mt-1 sm:mt-0">
                              {store.address}
                              {store.zip && `, ${store.zip}`}
                            </span>
                          )}
                        </div>
                        {store.maps_url && (
                          <a 
                            href={store.maps_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-1 inline-flex items-center"
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            Виж на картата
                          </a>
                        )}
                      </div>
                    </div>
                    {user && (
                      <div className="flex space-x-2">
                        {canEditStore(store) && (
                          <button
                            onClick={() => openEditModal(store)}
                            className="inline-flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {canDeleteStore() && (
                          <button
                            onClick={() => handleDelete(store.id)}
                            className="inline-flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-12 text-center">
              <Store className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Няма магазини</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Започнете като добавите нов магазин.</p>
              {user && (
                <div className="mt-6">
                  <button
                    onClick={openAddModal}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Добави магазин
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Store Modal */}
      {showModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        {editingStore ? 'Редактиране на магазин' : 'Добавяне на нов магазин'}
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Име на магазина *
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Район
                          </label>
                          <select
                            id="region"
                            name="region"
                            value={formData.region}
                            onChange={handleInputChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="">Изберете район</option>
                            {regions.map((region) => (
                              <option key={region.id} value={region.name}>
                                {region.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Адрес
                          </label>
                          <input
                            type="text"
                            name="address"
                            id="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="ул. Пример 123, бл. 1, вх. А"
                          />
                        </div>
                        <div>
                          <label htmlFor="zip" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Пощенски код
                          </label>
                          <input
                            type="text"
                            name="zip"
                            id="zip"
                            value={formData.zip}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            URL на изображение
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <input
                              type="url"
                              name="image_url"
                              id="image_url"
                              value={formData.image_url}
                              onChange={handleInputChange}
                              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Въведете URL адрес на изображение на магазина (незадължително)
                          </p>
                        </div>
                        <div>
                          <label htmlFor="maps_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            URL на Google Maps
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <input
                              type="url"
                              name="maps_url"
                              id="maps_url"
                              value={formData.maps_url}
                              onChange={handleInputChange}
                              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="https://maps.google.com/..."
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Въведете URL адрес към Google Maps за този магазин (незадължително)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingStore ? 'Обнови' : 'Добави'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Отказ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}