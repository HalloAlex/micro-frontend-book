module.exports = function override(config, env) {
  config.output = {
    library: 'app1',
    libraryTarget: 'umd'
  }
  return config;
}