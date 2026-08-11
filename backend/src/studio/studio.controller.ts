import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CharacterCatalogService } from '../catalog/character-catalog.service';
import { VoiceCatalogService } from '../catalog/voice-catalog.service';
import { CreateStoryProjectDto, UpdateStorySceneDto } from '../story/dto/story.dto';
import { StoryService } from '../story/story.service';
import { StudioService } from './studio.service';

@Controller('api/studio')
export class StudioController {
  constructor(
    private readonly studio: StudioService,
    private readonly charactersCatalog: CharacterCatalogService,
    private readonly voicesCatalog: VoiceCatalogService,
    private readonly stories: StoryService,
  ) {}
  @Get('capabilities') capabilities() {
    return this.studio.capabilities();
  }
  @Get('catalog/characters') characters(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.charactersCatalog.list(status, Number(limit), Number(offset));
  }
  @Get('catalog/voices') voices(
    @Query('languageCode') languageCode?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.voicesCatalog.list(languageCode, status, Number(limit), Number(offset));
  }
  @Post('projects') createProject(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateStoryProjectDto,
  ) {
    return this.stories.create(user.id, body);
  }
  @Get('projects/:projectId') getProject(
    @Param('projectId') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.stories.get(projectId, user.id);
  }
  @Patch('projects/:projectId/scenes/:sceneId') updateScene(
    @Param('projectId') projectId: string,
    @Param('sceneId') sceneId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateStorySceneDto,
  ) {
    return this.stories.updateScene(projectId, sceneId, user.id, body);
  }
}
