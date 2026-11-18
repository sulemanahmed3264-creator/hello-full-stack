const app = require("./app");
const config = require("./config/config");
const connectDB = require("./config/db");

const startServer = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`Server chal raha hai: http://localhost:${config.port} (${config.nodeEnv})`);
  });
};

startServer();