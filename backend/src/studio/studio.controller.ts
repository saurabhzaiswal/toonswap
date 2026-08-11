import { Body, Controller, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { ProjectInput, SceneInput, StudioService } from './studio.service';

@Controller('api/studio')
export class StudioController {
  constructor(private readonly studio: StudioService) {}

  @Get('capabilities')
  capabilities() { return this.studio.capabilities(); }

  @Get('catalog/characters')
  characters(@Query('status') status?: string, @Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.studio.listCharacters(status, Number(limit), Number(offset));
  }

  @Get('catalog/voices')
  voices(@Query('languageCode') languageCode?: string, @Query('status') status?: string, @Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.studio.listVoices(languageCode, status, Number(limit), Number(offset));
  }

  @Post('projects')
  createProject(@Body() body: ProjectInput) { return this.studio.createProject(body); }

  @Get('projects/:projectId')
  getProject(@Param('projectId') projectId: string, @Headers('x-toonswap-session') session?: string) {
    return this.studio.getProject(projectId, session);
  }

  @Patch('projects/:projectId/scenes/:sceneId')
  updateScene(@Param('projectId') projectId: string, @Param('sceneId') sceneId: string, @Headers('x-toonswap-session') session: string | undefined, @Body() body: SceneInput) {
    return this.studio.updateScene(projectId, sceneId, session, body);
  }
}
