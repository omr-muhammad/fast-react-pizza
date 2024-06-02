import { useDispatch } from 'react-redux';
import { deleteItem } from '../features/cart/cartSlice';
import Button from './Button';

export default function DeleteItem({ pizzaId }) {
  const dispatch = useDispatch();
  return (
    <Button onClick={() => dispatch(deleteItem(pizzaId))} type='small'>
      Delete
    </Button>
  );
}
