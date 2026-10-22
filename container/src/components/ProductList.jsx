import { products } from '../data/products';
import { emit, EVENTS } from '../events';

export default function ProductList() {
  return (
    <section className="shell-products">
      {products.map((product) => (
        <article key={product.id} className="shell-card">
          <img src={product.image} alt={product.name} loading="lazy" />
          <div className="shell-card-body">
            <strong>{product.name}</strong>
            <span className="shell-card-price">${product.price.toFixed(2)}</span>
            {/* The container does not know how the cart stores items. It just announces the intent. */}
            <button className="shell-primary" onClick={() => emit(EVENTS.CART_ADD, product)}>
              Add to cart
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
