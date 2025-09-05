import { Module } from '@nestjs/common';
import { PucController } from './puc/puc.controller';

@Module({
  controllers: [PucController]
})
export class ControllersModule {}
