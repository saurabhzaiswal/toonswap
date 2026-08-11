import { Module } from '@nestjs/common';
import { CharacterCatalogService } from './character-catalog.service';
import { VoiceCatalogService } from './voice-catalog.service';

@Module({ providers: [CharacterCatalogService, VoiceCatalogService], exports: [CharacterCatalogService, VoiceCatalogService] })
export class CatalogModule {}
