import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './apresentation/controllers/health.controller';
// import { AppDataSource } from './infra/data/settings/database.config';
import { SettingsDataGateway } from './infra/data/gateways/settings.gateway';
import { SettingsSchema } from './infra/data/schemas/settings.schema';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env']
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DATABASE_HOST,
      port: 5432,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      synchronize: false,
      logging: true,
      entities: [SettingsSchema],
      subscribers: [],
      migrations: [],
      migrationsRun: false,
      poolSize: 5,
    }),
  ],
  controllers: [HealthController],
  providers: [SettingsDataGateway],
})
export class AppModule { }
