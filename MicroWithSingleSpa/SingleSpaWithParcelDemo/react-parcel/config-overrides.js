module.exports = function override(config, env) {
  config.output = {
    library: 'reactParcel',
    libraryTarget: 'umd'
  }
  return config;
}