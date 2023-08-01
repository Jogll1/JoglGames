// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'public/js/chess/chessAI-worker.js',
  output: {
    file: 'bundle-chessWorker.js',
    format: 'esm',
  },
  plugins: [
    resolve(), // Resolve npm packages
    commonjs(), // Convert CommonJS modules to ES6, if needed
  ],
};