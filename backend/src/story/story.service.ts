import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StudioMode } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';
import { PrismaService } from '../database/prisma.service';
import { CreateStoryProjectDto, StorySceneDto, UpdateStorySceneDto } from './dto/story.dto';

@Injectable()
export class StoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, input: CreateStoryProjectDto) {
    const duration = Number(input.duration ?? 30);
    const projectId = uuidv7();
    const mode = input.mode?.toLowerCase() === 'creator' ? StudioMode.CREATOR : StudioMode.SIMPLE;
    const scenes = (
      input.scenes?.length
        ? input.scenes
        : [{ title: 'Opening scene', duration, action: input.prompt }]
    ).map((scene, index) => this.sceneData(scene, index));
    const totalSceneDuration = scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0);
    if (totalSceneDuration > 3600)
      throw new BadRequestException('combined scene duration cannot exceed 3600 seconds');

    const project = await this.prisma.storyProject.create({
      data: {
        id: projectId,
        userId,
        title: input.title?.trim() || 'Untitled ToonSwap story',
        prompt: input.prompt.trim(),
        worldId: input.era || 'stone-spark',
        genre: input.genre || 'Comedy adventure',
        audience: input.audience || 'Family',
        visualStyle: input.visualStyle || 'Warm 2D adventure',
        primaryLanguageCode: input.language || 'Hindi',
        targetDurationSeconds: Math.round(duration),
        captionsEnabled: input.captions !== false,
        mode,
        storyCharacters: {
          create: (input.cast ?? []).map((member, index) => ({
            id: uuidv7(),
            character: member.selfInsertAssetId ? undefined : this.connectByIdOrSlug(member.id),
            voiceProfile: this.connectByIdOrSlug(member.voiceProfileId),
            selfInsertAsset: member.selfInsertAssetId
              ? { connect: { id: member.selfInsertAssetId } }
              : undefined,
            role: member.role || (index === 0 ? 'lead' : 'supporting'),
            sortOrder: index,
            customSnapshot: member.customSnapshot as any,
          })),
        },
        scenes: { create: scenes },
      },
      include: { storyCharacters: true, scenes: { orderBy: { sortOrder: 'asc' } } },
    });
    return { project };
  }

  async get(projectId: string, userId: string) {
    const project = await this.prisma.storyProject.findFirst({
      where: { id: projectId, userId },
      include: {
        storyCharacters: {
          include: { character: true, voiceProfile: true, selfInsertAsset: true },
          orderBy: { sortOrder: 'asc' },
        },
        scenes: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!project) throw new NotFoundException('project not found');
    return project;
  }

  async updateScene(
    projectId: string,
    sceneId: string,
    userId: string,
    input: UpdateStorySceneDto,
  ) {
    const project = await this.prisma.storyProject.findFirst({
      where: { id: projectId, userId },
      select: { id: true },
    });
    if (!project) throw new NotFoundException('project not found');
    const existing = await this.prisma.storyScene.findFirst({ where: { id: sceneId, projectId } });
    if (!existing) throw new NotFoundException('scene not found');
    return this.prisma.storyScene.update({
      where: { id: sceneId },
      data: {
        title: input.title?.trim() || existing.title,
        durationSeconds: input.duration ?? existing.durationSeconds,
        characters: input.character?.trim() ?? existing.characters,
        location: input.location?.trim() ?? existing.location,
        action: input.action?.trim() ?? existing.action,
        dialogue: input.dialogue?.trim() ?? existing.dialogue,
        expression: input.expression?.trim() ?? existing.expression,
        camera: input.camera?.trim() ?? existing.camera,
        audioMode: input.audioMode?.trim() ?? existing.audioMode,
        regenerationScope: input.changeScope?.trim() ?? existing.regenerationScope,
        continuity: input.continuity?.trim() ?? existing.continuity,
        outputLayers: this.mediaLayers(input, existing.outputLayers),
        version: { increment: 1 },
      },
    });
  }

  private sceneData(scene: StorySceneDto, index: number) {
    return {
      id: uuidv7(),
      sortOrder: index,
      title: scene.title?.trim() || `Scene ${index + 1}`,
      durationSeconds: scene.duration ?? 8,
      characters: scene.character?.trim() || 'Full cast',
      location: scene.location?.trim() || 'Story world',
      action: scene.action?.trim() || 'Describe what happens.',
      dialogue: scene.dialogue?.trim() || null,
      expression: scene.expression?.trim() || 'curious',
      camera: scene.camera?.trim() || 'Wide establishing shot',
      audioMode: scene.audioMode?.trim() || 'Narration',
      regenerationScope: scene.changeScope?.trim() || 'Keep everything',
      continuity: scene.continuity?.trim() || null,
      outputLayers: this.mediaLayers(scene),
    };
  }
  private mediaLayers(scene: StorySceneDto, existing: unknown = {}) {
    const current =
      existing && typeof existing === 'object' && !Array.isArray(existing)
        ? (existing as Record<string, any>)
        : {};
    return {
      ...current,
      audio: {
        ...(current.audio || {}),
        voiceVolume: scene.voiceVolume ?? current.audio?.voiceVolume ?? 100,
        voicePitch: scene.voicePitch ?? current.audio?.voicePitch ?? 0,
        voiceSpeed: scene.voiceSpeed ?? current.audio?.voiceSpeed ?? 1,
        musicTrack: scene.musicTrack ?? current.audio?.musicTrack ?? 'None',
        musicVolume: scene.musicVolume ?? current.audio?.musicVolume ?? 22,
        revision: scene.audioRevision ?? current.audio?.revision ?? 1,
      },
      video: {
        ...(current.video || {}),
        trimStart: scene.trimStart ?? current.video?.trimStart ?? 0,
        trimEnd: scene.trimEnd ?? current.video?.trimEnd ?? 0,
        transition: scene.transition ?? current.video?.transition ?? 'Cut',
      },
    };
  }
  private connectByIdOrSlug(value?: string) {
    if (!value) return undefined;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
      ? { connect: { id: value } }
      : { connect: { slug: value } };
  }
}
