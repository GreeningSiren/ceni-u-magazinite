import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Settings, Sun, Moon, Monitor, X } from 'lucide-react';
import { Theme, setTheme } from '../lib/theme';
import { useAuth } from '../lib/auth';

interface Region {
  id: number;
  name: string;
}

export default function UserSettings() {
  const { preferredRegion, theme, setPreferredRegion: setAuthPreferredRegion, setTheme: setAuthTheme } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>(preferredRegion);
  const [currentTheme, setCurrentTheme] = useState<Theme>(theme);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [modifiedRegion, setModifiedRegion] = useState(false);

  useEffect(() => {
    if (showModal) {
      fetchRegions();
      fetchUserPreferences();
    }
  }, [showModal]);

  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setRegions(data || []);
    } catch (error) {
      console.error('Грешка при зареждане на райони:', error);
    }
  };

  const fetchUserPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preferred_region, theme')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          setSelectedRegion(data.preferred_region || '');
          if (data.theme) {
            setCurrentTheme(data.theme as Theme);
            setTheme(data.theme as Theme);
          }
        }
      }
    } catch (error) {
      console.error('Грешка при зареждане на предпочитания:', error);
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setCurrentTheme(newTheme);
    handleSave(newTheme);
  };

  const handleSave = async (newTheme?: Theme) => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            preferred_region: selectedRegion,
            theme: newTheme || currentTheme
          }, {
            onConflict: 'user_id'
          });

        if (error) throw error;
        setSaveSuccess(true);
        setAuthPreferredRegion(selectedRegion);
        if (newTheme) {
          setAuthTheme(newTheme);
        }

        // Only close modal if it's not a theme change
        // if (!newTheme) {
        //   setTimeout(() => setShowModal(false), 1500);
        // }
        setTimeout(() => {
          setSaveSuccess(false);
          setModifiedRegion(false);
          setShowModal(false);
          if (modifiedRegion && !newTheme) {
            window.location.reload();
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Грешка при запазване на предпочитания:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:bg-gray-800 flex items-center"
        title="Настройки"
      >
        <Settings className="h-5 w-5" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-800"></div>
            </div>

            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            <div className="inline-block transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:text-white sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-md bg-white dark:bg-gray-900 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  Настройки
                </h3>
                <div className="mt-6 space-y-6">
                  <div>
                    <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Предпочитан район
                    </label>
                    <select
                      id="region"
                      value={selectedRegion}
                      onChange={(e) => { setSelectedRegion(e.target.value); setModifiedRegion(true); setSaveSuccess(false); }}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="" disabled={selectedRegion !== ""}>Изберете район</option>
                      {regions.map((region) => (
                        <option key={region.id} value={region.name}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Тема
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleThemeChange('light')}
                        className={`p-2 rounded-lg flex items-center ${currentTheme === 'light'
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-600 dark:text-white'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                          }`}
                      >
                        <Sun className="h-5 w-5" />
                        <span className="ml-2">Светла</span>
                      </button>
                      <button
                        onClick={() => handleThemeChange('dark')}
                        className={`p-2 rounded-lg flex items-center ${currentTheme === 'dark'
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-600 dark:text-white'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                          }`}
                      >
                        <Moon className="h-5 w-5" />
                        <span className="ml-2">Тъмна</span>
                      </button>
                      <button
                        onClick={() => handleThemeChange('system')}
                        className={`p-2 rounded-lg flex items-center ${currentTheme === 'system'
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-600 dark:text-white'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                          }`}
                      >
                        <Monitor className="h-5 w-5" />
                        <span className="ml-2">Системна</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {saveSuccess && (
                <div>
                  <div className="mt-4 p-2 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 rounded">
                    Настройките са запазени успешно!
                  </div>
                  {modifiedRegion && (
                    <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
                      Страницата ще се презареди за да се приложат промените.
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Отказ
                </button>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={loading}
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Запазване...' : 'Запази'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}