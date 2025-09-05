import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { ModelsModule } from './models/models.module';
import { ControllersModule } from './controllers/controllers.module';

@Module({
  imports: [
    CommonModule,
    ModelsModule,
    ControllersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
