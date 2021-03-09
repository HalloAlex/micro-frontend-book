module.exports = {
  publicPath: '//localhost:8081',
  devServer: {
    port: 8081
  },
  configureWebpack: {
    output: {
      library: 'app2',
      libraryTarget: 'umd'
    }
  }
}