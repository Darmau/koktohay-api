import { Module } from '@nestjs/common';
import { LanguageModule } from '@/settings/language/language.module';
import { ConfigModule } from '@/settings/config/config.module';

@Module({
  imports: [LanguageModule, ConfigModule],
})
export class SettingsModule {}
