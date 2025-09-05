import { Global, Module } from '@nestjs/common';
import { DbConnectionService } from './db-connection/db-connection.service';

const services = [
  DbConnectionService
];

@Global()
@Module({
  providers: services,
  exports: services
})
export class CommonModule {}
