import { Module } from '@nestjs/common';
import { StudioController } from './studio.controller';
import { StudioService } from './studio.service';
import { CatalogModule } from '../catalog/catalog.module';
import { StoryModule } from '../story/story.module';

@Module({ imports: [CatalogModule, StoryModule], controllers: [StudioController], providers: [StudioService] })
export class StudioModule {}
