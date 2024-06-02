import { Form, redirect, useActionData, useNavigation } from 'react-router-dom';
import { createOrder } from '../../services/apiRestaurant';
import Button from '../../ui/Button';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, getCart, getTotalCartPrice } from '../cart/cartSlice';
import EmptyCart from '../cart/EmptyCart';
import { store } from '../../store';
import { formatCurrency } from '../../utils/helpers';
import { useState } from 'react';
import { fetchAddress } from '../user/userSlice';

// https://uibakery.io/regex-library/phone-number
const isValidPhone = (str) => {
  const isValidNumber =
    /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
      str,
    );

  return isValidNumber
    ? isValidNumber
    : {
        phone: `Please give us your correct phone number. We might need it to contact you.`,
      };
};

function CreateOrder() {
  const [withPriority, setWithPriority] = useState(false);
  const {
    username,
    status: addressSts,
    position: { latitude, longitude },
    address,
    error: addressError,
  } = useSelector((store) => store.user);
  const cartTotalPrice = useSelector(getTotalCartPrice);
  const priority = withPriority ? cartTotalPrice * 0.2 : 0;
  const totalPrice = cartTotalPrice + priority;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const formErrors = useActionData();

  // Drived States
  const isSubmitting = navigation.state === 'submitting';
  const isAddressLoading = addressSts === 'loading';

  const cart = useSelector(getCart);

  if (cart.length === 0) return <EmptyCart />;

  function handleClick(e) {
    e.preventDefault();

    dispatch(fetchAddress());
  }

  return (
    <div className='px-4 py-6'>
      <h2 className='mb-8 text-xl font-semibold'>
        Ready to order? Let&apos;s go!
      </h2>

      <Form method='POST'>
        <div className='mb-5 flex flex-col gap-2 sm:flex-row sm:items-center'>
          <label className='sm:basis-40'>First Name</label>
          <input
            className='input grow'
            type='text'
            name='customer'
            required
            defaultValue={username}
          />
        </div>

        <div className='mb-5 flex flex-col gap-2 sm:flex-row sm:items-center'>
          <label className='sm:basis-40'>Phone number</label>
          <div className='grow'>
            <input className='input w-full' type='tel' name='phone' required />
            {formErrors?.phone && (
              <p className='mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700'>
                {formErrors.phone}
              </p>
            )}
          </div>
        </div>

        <div className='relative mb-5 flex flex-col gap-2 sm:flex-row sm:items-center'>
          <label className='sm:basis-40'>Address</label>
          <div className='grow'>
            <input
              className='input w-full'
              type='text'
              name='address'
              required
              placeholder='Adress'
              disabled={isAddressLoading}
              defaultValue={address}
            />
            {addressSts === 'error' && (
              <p className='mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700'>
                {addressError}
              </p>
            )}
          </div>

          {!latitude && !longitude && (
            <span className='absolute right-[5px] top-9 z-50 sm:right-[4.5px] sm:top-[4px] md:top-[6px]'>
              <Button
                disabled={isAddressLoading}
                type='small'
                onClick={handleClick}
              >
                Get position
              </Button>
            </span>
          )}
        </div>

        <div className='mb-12 flex items-center gap-5'>
          <input
            className='size-6 accent-yellow-400 focus:outline-none focus:ring focus:ring-yellow-400
            focus:ring-offset-2'
            type='checkbox'
            name='priority'
            id='priority'
            value={withPriority}
            onChange={(e) => setWithPriority(e.target.checked)}
          />
          <label htmlFor='priority' className='font-medium'>
            Want to yo give your order priority?
          </label>
        </div>

        <div>
          <input type='hidden' name='cart' value={JSON.stringify(cart)} />
          <input
            type='hidden'
            name='position'
            value={`${latitude ? latitude + longitude : ''}`}
          />
          <Button type='primary' isDisabled={isSubmitting}>
            {isSubmitting
              ? 'Placing Order...'
              : `Order now for ${formatCurrency(totalPrice)}`}
          </Button>
        </div>
      </Form>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export async function action({ request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const order = {
    ...data,
    priority: data.priority === 'true',
    cart: JSON.parse(data.cart),
  };

  const isValidNumber = isValidPhone(order.phone);

  if (isValidNumber !== true) {
    return isValidNumber;
  }

  const newOrder = await createOrder(order);

  // Do not over use this
  store.dispatch(clearCart());

  return redirect(`/order/${newOrder.id}`);
}

export default CreateOrder;
