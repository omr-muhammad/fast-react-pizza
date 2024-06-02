import { Outlet, useNavigation } from 'react-router-dom';
import CartOverview from '../features/cart/CartOverview';
import Header from './Header';
import Loader from './Loader';

export default function AppLayout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  if (isLoading) return <Loader />;

  return (
    <div className='grid h-screen grid-rows-[auto_1fr_auto]'>
      {/* <Loader /> */}
      <Header />

      <div className='overflow-auto'>
        <main className='mx-auto max-w-3xl'>
          <Outlet />
        </main>
      </div>

      <CartOverview />
    </div>
  );
}
