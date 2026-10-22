import { mount } from './mount';
import { emit, EVENTS } from './events';

mount(document.getElementById('root'));

// Standalone mode has no product list, so we add a sample item to have something to look at.
emit(EVENTS.CART_ADD, { id: 1, name: 'Standalone sample product', price: 19.99 });
