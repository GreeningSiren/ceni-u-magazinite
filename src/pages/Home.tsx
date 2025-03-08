import { Link } from 'react-router-dom';
import { ShoppingCart, DollarSign, BarChart3, TrendingDown } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
                <span className="block">Спестете пари от</span>
                <span className="block text-indigo-200">вашите покупки</span>
              </h1>
              <p className="mt-6 max-w-lg text-xl text-indigo-100">
                Проследявайте и сравнявайте цените на хранителните стоки в различни магазини, за да намерите най-добрите оферти и да спестите пари.
              </p>
              <div className="mt-10 flex space-x-4">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-600 dark:text-indigo-400 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Започнете
                </Link>
                <Link
                  to="/compare"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 bg-opacity-60 hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Сравни цени
                </Link>
              </div>
            </div>
            <div className="mt-12 md:mt-0 md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75"></div>
                <div className="relative bg-white p-6 rounded-lg shadow-xl">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                  <h2 className="text-lg font-medium text-gray-900">Проследяване на цени</h2>
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500">Мляко (1 литър)</span>
                      </div>
                      <div className="flex items-center text-green-600">
                        <TrendingDown className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">2.49 лв.</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500">Яйца (10 бр.)</span>
                      </div>
                      <div className="flex items-center text-green-600">
                        <TrendingDown className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">3.99 лв.</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500">Хляб</span>
                      </div>
                      <div className="flex items-center text-green-600">
                        <TrendingDown className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">1.79 лв.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">Функции</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Спестете време и пари
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Нашият инструмент за сравнение на цени ви помага да намерите най-добрите оферти и да спестите пари от вашите покупки.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Проследяване на магазини</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Добавяйте и управлявайте вашите местни хранителни магазини, за да следите къде пазарувате.
                  </p>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Записване на цени</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Записвайте цени докато пазарувате или когато видите промоции, за да изградите своята база данни с цени.
                  </p>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Сравнение и спестяване</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Лесно сравнявайте цени в различни магазини, за да намерите най-добрите оферти и да спестите пари.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-indigo-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Готови ли сте да започнете да спестявате?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Регистрирайте се сега и започнете да проследявате цените на хранителните стоки, за да намерите най-добрите оферти във вашия район.
          </p>
          <Link
            to="/dashboard"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 dark:text-indigo-400 bg-white hover:bg-indigo-50 sm:w-auto"
          >
            Започнете
          </Link>
        </div>
      </div>
    </div>
  );
}