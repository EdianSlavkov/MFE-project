import { faker } from '@faker-js/faker/locale/en';

// A fixed seed makes faker deterministic: the same "random" products on every reload and for every viewer.
faker.seed(42);

export const products = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  name: faker.commerce.productName(),
  price: Number(faker.commerce.price({ min: 5, max: 200 })),
  // picsum returns the same image for the same seed, which keeps the demo stable too.
  image: `https://picsum.photos/seed/mfe-${index + 1}/300/200`,
}));
