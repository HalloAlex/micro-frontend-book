import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel'

export default {
  input: './MySelfSingleSpa/single-spa.js',
  output: {
    dir: './dist',
    format: 'umd',
    name: 'singleSpa'
  },
  plugins: [
    resolve({ extensions: ['.js'] }),
    babel({
      exclude: 'node_modules/**'
    })
  ]
};