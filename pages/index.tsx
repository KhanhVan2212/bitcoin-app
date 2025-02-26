import type { NextPage } from 'next';
import BitcoinChart from '../components/BitcoinChart';
import ThemeToggle from '../components/ThemeToggle';

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Bitcoin
        </h1>
        <ThemeToggle />
      </header>
      <main className="flex-grow container mx-auto py-8 px-4">
        <BitcoinChart />
      </main>
      <footer className="bg-white dark:bg-gray-800 py-4 text-center text-gray-600 dark:text-gray-300">
        <p>Nguyễn Khánh Văn</p>
      </footer>
    </div>
  );
};

export default Home;