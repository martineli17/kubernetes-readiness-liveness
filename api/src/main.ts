import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { AppDataSource } from './infra/data/settings/database.config';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const dataSource = await app.resolve(DataSource);
  await dataSource.synchronize();
  await dataSource.runMigrations();

  await app.listen(3000);
}
bootstrap();
