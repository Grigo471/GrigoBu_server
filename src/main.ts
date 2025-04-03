import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as path from 'path';

declare const module: any;

async function start() {
    const PORT = process.env.PORT || 5000;
    const isDev = process.env.NODE_ENV === 'development';

    const httpsOptions = isDev
        ? undefined
        : {
              key: fs.readFileSync(
                  path.resolve(__dirname, '..', 'secrets', 'privkey.pem'),
              ),
              cert: fs.readFileSync(
                  path.resolve(__dirname, '..', 'secrets', 'fullchain.pem'),
              ),
          };

    const app = await NestFactory.create(AppModule, { httpsOptions });

    app.enableCors({
        origin: isDev
            ? process.env.CLIENT_URL
            : new RegExp(process.env.CLIENT_URL),
        methods: ['GET', 'PATCH', 'POST', 'DELETE'],
        credentials: true,
    });

    app.use(cookieParser());

    const config = new DocumentBuilder()
        .setTitle('API для учебного проекта Griboo')
        .setDescription(
            `Данное API предназначено для создания, хранения, просмотра, 
/ оценивания и редактирования статей и пользователей приложения Griboo`,
        )
        .setVersion('1.0.0')
        .addTag('Griboo')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/docs', app, document);

    await app.listen(PORT, () => console.log(`Server started at port ${PORT}`));

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}

start();
