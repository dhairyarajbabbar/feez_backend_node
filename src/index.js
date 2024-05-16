const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

let server;
mongoose.set("strictQuery", true);
const url="mongodb+srv://dhairyarajbabbar:qvo0dkslzZ3UNbYc@feemanagement.lmkfmxp.mongodb.net/?retryWrites=true&w=majority&appName=FeeManagement";
const connectToMongoDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://dhairyarajbabbar:TeiksZnjkoJERKd2@cluster0.thybtrd.mongodb.net/", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      serverApi: { version: '1', strict: true, deprecationErrors: true },
    });
    logger.info('Connected to MongoDB');
    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};
// const connectToMongoDb=(async ()=>{
//   return mongoose.connect(url).then ( () => {
//       console.log("mongodb connected");
//   });
// })
connectToMongoDB();

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
