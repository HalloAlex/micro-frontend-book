module.exports = {
  publicPath: '//localhost:8081',
  configureWebpack: {
    devServer: {
      port: 8081,
      headers: {
        'Access-Control-Allow-Origin': '*'            
      }
    },
    output: {
      library: 'app2',
      libraryTarget: 'umd'
    }
  }
}