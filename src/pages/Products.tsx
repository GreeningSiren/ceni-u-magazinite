import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, ShoppingBag, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

interface ProductType {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  brand: string | null;
  image_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  user_id: string;
}

export default function Products() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    image_url: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Грешка при извличане на продукти:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      brand: '',
      image_url: ''
    });
    setShowModal(true);
  };

  const openEditModal = (product: ProductType) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      brand: product.brand || '',
      image_url: product.image_url || ''
    });
    setShowModal(true);
  };

  const handleProductClick = (productId: number) => {
    navigate(`/compare?product=${productId}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Потребителят не е удостоверен');
      
      const productData = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category || null,
        brand: formData.brand || null,
        image_url: formData.image_url || null,
        user_id: user.data.user.id,
        status: isAdmin ? 'approved' : 'pending'
      };
      
      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
      } else {
        const { data, error: fError } = await supabase.functions.invoke('extract-image-url', {
          body: JSON.stringify({ url: productData.image_url }),
        });
        console.log("data", data);
        productData.image_url = data.raw_url;
        if(fError) throw fError;

        // Insert new product
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        
        if (error) throw error;
      }
      
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Грешка при запазване на продукт:', error);
    }
  };

  const canEditProduct = (product: ProductType) => {
    return isAdmin || (user && product.user_id === user.id);
  };

  const canDeleteProduct = () => {
    return isAdmin;
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете този продукт? Това ще изтрие и всички свързани записи на цени.')) {
      return;
    }
    
    try {
      // First delete related price records
      const { error: priceError } = await supabase
        .from('prices')
        .delete()
        .eq('product_id', id);
      
      if (priceError) throw priceError;
      
      // Then delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      fetchProducts();
    } catch (error) {
      console.error('Грешка при изтриване на продукт:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Продукти</h1>
        {user && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Добави продукт
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          {products.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {products.map((product) => (
                <li 
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-md p-2">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="h-10 w-10 object-cover rounded"
                          />
                        ) : (
                          <ShoppingBag className="h-5 w-5 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{product.name}</h3>
                        <div className="mt-1 flex items-center">
                          {product.brand && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                              Марка: {product.brand}
                            </span>
                          )}
                          {product.category && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {product.category}
                            </span>
                          )}
                        </div>
                        {product.description && (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {user && (
                      <div className="flex space-x-2" onClick={e => e.stopPropagation()}>
                        {canEditProduct(product) && (
                          <button
                            onClick={() => openEditModal(product)}
                            className="inline-flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {canDeleteProduct() && (
                          <button
                            onClick={() => handleDelete(product.id)}
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
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Няма продукти</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Започнете като добавите нов продукт.</p>
              {user && (
                <div className="mt-6">
                  <button
                    onClick={openAddModal}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Добави продукт
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Product Modal */}
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
                        {editingProduct ? 'Редактиране на продукт' : 'Добавяне на нов продукт'}
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Име на продукта *
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
                          <label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Марка
                          </label>
                          <input
                            type="text"
                            name="brand"
                            id="brand"
                            value={formData.brand}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Категория
                          </label>
                          <input
                            type="text"
                            name="category"
                            id="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="напр., Млечни, Плодове, Хляб"
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
                            Въведете URL адрес на изображение на продукта (незадължително)
                          </p>
                        </div>
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Описание
                          </label>
                          <textarea
                            name="description"
                            id="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
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
                    {editingProduct ? 'Обнови' : 'Добави'}
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