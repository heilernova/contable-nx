import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { ModelsModule } from './models/models.module';
import { ControllersModule } from './controllers/controllers.module';

@Module({
  imports: [
    CommonModule,
    ModelsModule,
    ControllersModule,
    JwtModule.register({
      global: true,
      secret:  process.env.JWT_SECRET || crypto.randomUUID(),
      signOptions: { expiresIn: '2h' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
