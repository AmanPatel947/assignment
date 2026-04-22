const app = require('./app');
const { assertEnv, config } = require('./config/env');

assertEnv();

app.listen(config.port, () => {
  console.log(`API listening on port ${config.port}`);
});
