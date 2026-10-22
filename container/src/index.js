// The dynamic import creates an async boundary. Webpack uses this pause to set up the shared scope
// (decide which copy of React to use) before any code that imports React runs.
// Importing bootstrap statically here would crash with "Shared module is not available for eager consumption".
import('./bootstrap');
