import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { StudioMode } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';
import { PrismaService } from '../database/prisma.service';
import { CreateStoryProjectDto, StorySceneDto, UpdateStorySceneDto } from './dto/story.dto';

@Injectable()
export class StoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateStoryProjectDto) {
    const duration = Number(input.duration ?? 30);
    const projectId = uuidv7();
    const ownerSessionId = input.ownerSessionId?.trim() || uuidv7();
    const mode = input.mode?.toLowerCase() === 'creator' ? StudioMode.CREATOR : StudioMode.SIMPLE;
    const scenes = (input.scenes?.length ? input.scenes : [{ title: 'Opening scene', duration, action: input.prompt }]).map((scene, index) => this.sceneData(scene, index));
    const totalSceneDuration = scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0);
    if (totalSceneDuration > 3600) throw new BadRequestException('combined scene duration cannot exceed 3600 seconds');

    const project = await this.prisma.storyProject.create({
      data: {
        id: projectId, ownerSessionId, title: input.title?.trim() || 'Untitled ToonSwap story', prompt: input.prompt.trim(),
        worldId: input.era || 'stone-spark', genre: input.genre || 'Comedy adventure', audience: input.audience || 'Family',
        visualStyle: input.visualStyle || 'Warm 2D adventure', primaryLanguageCode: input.language || 'Hindi',
        targetDurationSeconds: Math.round(duration), captionsEnabled: input.captions !== false, mode,
        storyCharacters: { create: (input.cast ?? []).map((member, index) => ({
          id: uuidv7(), characterId: member.selfInsertAssetId ? null : member.id || null, voiceProfileId: member.voiceProfileId || null,
          selfInsertAssetId: member.selfInsertAssetId || null, role: member.role || (index === 0 ? 'lead' : 'supporting'),
          sortOrder: index, customSnapshot: member.customSnapshot as any,
        })) },
        scenes: { create: scenes },
      },
      include: { storyCharacters: true, scenes: { orderBy: { sortOrder: 'asc' } } },
    });
    return { ownerSessionId, project };
  }

  async get(projectId: string, ownerSessionId?: string) {
    const project = await this.prisma.storyProject.findUnique({ where: { id: projectId }, include: { storyCharacters: { include: { character: true, voiceProfile: true, selfInsertAsset: true }, orderBy: { sortOrder: 'asc' } }, scenes: { orderBy: { sortOrder: 'asc' } } } });
    if (!project) throw new NotFoundException('project not found');
    this.assertOwner(project.ownerSessionId, ownerSessionId);
    return project;
  }

  async updateScene(projectId: string, sceneId: string, ownerSessionId: string | undefined, input: UpdateStorySceneDto) {
    const project = await this.prisma.storyProject.findUnique({ where: { id: projectId }, select: { ownerSessionId: true } });
    if (!project) throw new NotFoundException('project not found');
    this.assertOwner(project.ownerSessionId, ownerSessionId);
    const existing = await this.prisma.storyScene.findFirst({ where: { id: sceneId, projectId } });
    if (!existing) throw new NotFoundException('scene not found');
    return this.prisma.storyScene.update({ where: { id: sceneId }, data: {
      title: input.title?.trim() || existing.title, durationSeconds: input.duration ?? existing.durationSeconds,
      characters: input.character?.trim() ?? existing.characters, location: input.location?.trim() ?? existing.location,
      action: input.action?.trim() ?? existing.action, dialogue: input.dialogue?.trim() ?? existing.dialogue,
      expression: input.expression?.trim() ?? existing.expression, camera: input.camera?.trim() ?? existing.camera,
      audioMode: input.audioMode?.trim() ?? existing.audioMode, regenerationScope: input.changeScope?.trim() ?? existing.regenerationScope,
      continuity: input.continuity?.trim() ?? existing.continuity, version: { increment: 1 },
    } });
  }

  private sceneData(scene: StorySceneDto, index: number) {
    return { id: uuidv7(), sortOrder: index, title: scene.title?.trim() || `Scene ${index + 1}`, durationSeconds: scene.duration ?? 8, characters: scene.character?.trim() || 'Full cast', location: scene.location?.trim() || 'Story world', action: scene.action?.trim() || 'Describe what happens.', dialogue: scene.dialogue?.trim() || null, expression: scene.expression?.trim() || 'curious', camera: scene.camera?.trim() || 'Wide establishing shot', audioMode: scene.audioMode?.trim() || 'Narration', regenerationScope: scene.changeScope?.trim() || 'Keep everything', continuity: scene.continuity?.trim() || null };
  }
  private assertOwner(expected: string, received?: string) { if (!received || received !== expected) throw new ForbiddenException('valid x-toonswap-session header required'); }
}
