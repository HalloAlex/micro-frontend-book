module.exports = {
  webpack: function(config, env) {
    config.output.library = 'app1';
    config.output.libraryTarget = 'umd';
    return config;
  },
  devServer: function(configFunction) {
    return function(proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);
      config.headers = {'Access-Control-Allow-Origin': '*'}
      return config;
    };
  },
};