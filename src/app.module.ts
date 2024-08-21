import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ArticlesModule } from './articles/articles.module';
import { FileModule } from './file/file.module';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, '..', 'static'),
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Cvigun678101255',
      database: 'nest-grigobu',
      models: [],
      autoLoadModels: true,
      synchronize: true,
    }),
    ArticlesModule,
    UsersModule,
    FileModule,
  ],
})
export class AppModule {}
