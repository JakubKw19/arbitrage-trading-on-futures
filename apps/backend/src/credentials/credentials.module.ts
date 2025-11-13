import { Module } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { EncryptionService } from './encryption.service';
import { CredentialsRouter } from './credentials.router';

@Module({
  providers: [CredentialsService, CredentialsRouter, EncryptionService],
  exports: [CredentialsService, CredentialsRouter],
})
export class CredentialsModule {}
