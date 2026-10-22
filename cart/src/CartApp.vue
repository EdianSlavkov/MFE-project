<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { emit, on, EVENTS } from './events';

const items = ref([]);
const user = ref(null);
const message = ref('');

const count = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0));
const total = computed(() => items.value.reduce((sum, item) => sum + item.price * item.quantity, 0));

/**
 * Adds a product or increases its quantity when it is already in the cart.
 */
function add(product) {
  const existing = items.value.find((item) => item.id === product.id);
  message.value = '';
  if (existing) existing.quantity += 1;
  else items.value.push({ ...product, quantity: 1 });
}

/**
 * Changes a quantity and drops the line when it reaches zero.
 */
function change(item, delta) {
  item.quantity += delta;
  if (item.quantity <= 0) items.value = items.value.filter((other) => other.id !== item.id);
}

function checkout() {
  message.value = `Thanks ${user.value.name}! Order total: $${total.value.toFixed(2)}`;
  items.value = [];
}

// Subscriptions live as long as the component. Removing them on unmount avoids leaks
// when the host removes the cart from the page.
let offs = [];
onMounted(() => {
  offs = [
    on(EVENTS.CART_ADD, add),
    on(EVENTS.LOGIN, (loggedIn) => (user.value = loggedIn)),
    on(EVENTS.LOGOUT, () => (user.value = null)),
  ];
});
onUnmounted(() => offs.forEach((off) => off()));

// Tell the outside world (e.g. the header badge) whenever the count changes.
watch(count, (value) => emit(EVENTS.CART_CHANGED, { count: value }), { immediate: true });
</script>

<template>
  <div class="cart-box">
    <h3 class="cart-title">Cart <small class="cart-tech">(Vue)</small></h3>

    <p v-if="message" class="cart-message">{{ message }}</p>
    <p v-else-if="items.length === 0" class="cart-muted">Your cart is empty.</p>

    <ul v-else class="cart-list">
      <li v-for="item in items" :key="item.id" class="cart-item">
        <span class="cart-name">{{ item.name }}</span>
        <span class="cart-qty">
          <button class="cart-step" @click="change(item, -1)">-</button>
          {{ item.quantity }}
          <button class="cart-step" @click="change(item, 1)">+</button>
        </span>
        <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
      </li>
    </ul>

    <div class="cart-total">Total: ${{ total.toFixed(2) }}</div>

    <!-- Checkout depends on the login micro frontend, but only through the LOGIN event. No import. -->
    <button class="cart-checkout" :disabled="!user || items.length === 0" @click="checkout">
      {{ user ? 'Checkout' : 'Log in to checkout' }}
    </button>
  </div>
</template>

<!--
  "scoped" makes Vue add a unique attribute to every element and selector, so these styles
  can never leak into the host or into other micro frontends. Colors still come from the host's CSS variables.
-->
<style scoped>
.cart-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  font-family: var(--mfe-font, sans-serif);
  color: var(--mfe-color-text, #111827);
  background: var(--mfe-color-surface, #ffffff);
  border: 1px solid var(--mfe-color-border, #d1d5db);
  border-radius: var(--mfe-radius, 8px);
}
.cart-title { margin: 0; }
.cart-tech { color: var(--mfe-color-muted, #6b7280); font-weight: normal; }
.cart-message { margin: 0; color: var(--mfe-color-primary, #7c3aed); }
.cart-muted { color: var(--mfe-color-muted, #6b7280); margin: 0; }
.cart-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.cart-item { display: grid; grid-template-columns: 1fr auto auto; gap: 8px; align-items: center; font-size: 14px; }
.cart-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cart-qty { display: flex; align-items: center; gap: 4px; }
.cart-step {
  width: 24px;
  height: 24px;
  cursor: pointer;
  color: inherit;
  background: transparent;
  border: 1px solid var(--mfe-color-border, #d1d5db);
  border-radius: var(--mfe-radius, 8px);
}
.cart-total { font-weight: 700; text-align: right; }
.cart-checkout {
  padding: 8px;
  border: none;
  cursor: pointer;
  background: var(--mfe-color-primary, #7c3aed);
  color: var(--mfe-color-primary-text, #ffffff);
  border-radius: var(--mfe-radius, 8px);
}
.cart-checkout:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
