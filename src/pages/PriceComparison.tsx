import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, DollarSign, TrendingDown, TrendingUp, Search } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

interface Store {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  brand: string | null;
}

interface PriceRecord {
  id: number;
  product_id: number;
  store_id: number;
  price: number;
  date_observed: string;
  on_sale: boolean;
  product_name: string;
  product_brand: string | null;
  store_name: string;
}

export default function PriceComparison() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [priceRecords, setPriceRecords] = useState<PriceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    product_id: '',
    store_id: '',
    price: '',
    date_observed: new Date().toISOString().split('T')[0],
    on_sale: false
  });

  useEffect(() => {
    fetchStoresAndProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchPriceComparison(selectedProduct);
    }
  }, [selectedProduct]);

  const fetchStoresAndProducts = async () => {
    setLoading(true);
    try {
      // Fetch stores
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('id, name')
        .order('name');
      
      if (storesError) throw storesError;
      setStores(storesData || []);
      
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, brand')
        .order('name');
      
      if (productsError) throw productsError;
      setProducts(productsData || []);
      
      // If there are products, select the first one by default
      if (productsData && productsData.length > 0) {
        setSelectedProduct(productsData[0].id);
      }
    } catch (error) {
      console.error('Грешка при извличане на данни:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceComparison = async (productId: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prices')
        .select(`
          id,
          product_id,
          store_id,
          price,
          date_observed,
          on_sale,
          products (name, brand),
          stores (name)
        `)
        .eq('product_id', productId)
        .order('price', { ascending: true });
      
      if (error) throw error;
      
      // Transform the data to a more usable format
      const formattedData = data?.map(item => ({
        id: item.id,
        product_id: item.product_id,
        store_id: item.store_id,
        price: item.price,
        date_observed: item.date_observed,
        on_sale: item.on_sale,
        product_name: item.products?.name || '',
        product_brand: item.products?.brand || null,
        store_name: item.stores?.name || ''
      })) || [];
      
      setPriceRecords(formattedData);
    } catch (error) {
      console.error('Грешка при извличане на сравнение на цени:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const openAddModal = () => {
    setFormData({
      product_id: selectedProduct?.toString() || '',
      store_id: '',
      price: '',
      date_observed: new Date().toISOString().split('T')[0],
      on_sale: false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Потребителят не е удостоверен');
      
      const priceData = {
        product_id: parseInt(formData.product_id),
        store_id: parseInt(formData.store_id),
        price: parseFloat(formData.price),
        date_observed: formData.date_observed,
        on_sale: formData.on_sale,
        user_id: user.data.user.id
      };
      
      const { error } = await supabase
        .from('prices')
        .insert([priceData]);
      
      if (error) throw error;
      
      setShowModal(false);
      if (selectedProduct) {
        fetchPriceComparison(selectedProduct);
      }
    } catch (error) {
      console.error('Грешка при запазване на запис за цена:', error);
    }
  };

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = parseInt(e.target.value);
    setSelectedProduct(productId);
  };

  const handleAddPrice = () => {
    if (!user) {
      navigate('/auth', { state: { from: '/compare' } });
      return;
    }
    openAddModal();
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Сравнение на цени</h1>
        {user && (
          <button
            onClick={handleAddPrice}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Добави цена
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="mb-6">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Търсене на продукти
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
              placeholder="Търсене по име на продукт или марка"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="product" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Изберете продукт за сравнение
          </label>
          <select
            id="product"
            name="product"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={selectedProduct || ''}
            onChange={handleProductSelect}
          >
            <option value="">Изберете продукт</option>
            {filteredProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} {product.brand ? `(${product.brand})` : ''}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {selectedProduct ? (
              priceRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Магазин
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Цена
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Дата на наблюдение
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Статус
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Сравнение
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {priceRecords.map((record, index) => {
                        const isLowestPrice = index === 0; // First record is the lowest price
                        const priceDifference = index > 0 
                          ? ((record.price - priceRecords[0].price) / priceRecords[0].price * 100).toFixed(1)
                          : '0';
                        
                        return (
                          <tr key={record.id} className={isLowestPrice ? 'bg-green-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-900">
                              {record.store_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {record.price.toFixed(2)} лв.
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(record.date_observed).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {record.on_sale ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Промоция
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  Редовна цена
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isLowestPrice ? (
                                <span className="inline-flex items-center text-sm text-green-600">
                                  <TrendingDown className="h-4 w-4 mr-1" />
                                  Най-добра цена
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-sm text-red-600">
                                  <TrendingUp className="h-4 w-4 mr-1" />
                                  {priceDifference}% по-скъпо
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Няма данни за цени</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Не са намерени записи за цени за този продукт. Добавете някои цени, за да започнете сравнението!
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={handleAddPrice}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Добави цена
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Изберете продукт</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Моля, изберете продукт от падащото меню, за да видите сравнение на цените.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Price Modal */}
      {showModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Добавяне на нова цена
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="product_id" className="block text-sm font-medium text-gray-700">
                            Продукт *
                          </label>
                          <select
                            id="product_id"
                            name="product_id"
                            required
                            value={formData.product_id}
                            onChange={handleInputChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">Изберете продукт</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} {product.brand ? `(${product.brand})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="store_id" className="block text-sm font-medium text-gray-700">
                            Магазин *
                          </label>
                          <select
                            id="store_id"
                            name="store_id"
                            required
                            value={formData.store_id}
                            onChange={handleInputChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">Изберете магазин</option>
                            {stores.map((store) => (
                              <option key={store.id} value={store.id}>
                                {store.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                            Цена (лв.) *
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <input
                              type="number"
                              name="price"
                              id="price"
                              required
                              min="0"
                              step="0.01"
                              value={formData.price}
                              onChange={handleInputChange}
                              className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                              placeholder="0.00"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">лв.</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="date_observed" className="block text-sm font-medium text-gray-700">
                            Дата на наблюдение
                          </label>
                          <input
                            type="date"
                            name="date_observed"
                            id="date_observed"
                            value={formData.date_observed}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            id="on_sale"
                            name="on_sale"
                            type="checkbox"
                            checked={formData.on_sale}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="on_sale" className="ml-2 block text-sm text-gray-900">
                            Този продукт е в промоция
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Добави
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
