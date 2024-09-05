import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

declare const module: any;

async function start() {
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
start();
