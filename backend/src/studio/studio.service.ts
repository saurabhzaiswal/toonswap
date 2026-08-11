import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CatalogStatus, StudioMode } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';
import { PrismaService } from '../database/prisma.service';

type JsonRecord = Record<string, unknown>;

export interface SceneInput {
  title?: string;
  duration?: number;
  character?: string;
  location?: string;
  action?: string;
  dialogue?: string;
  expression?: string;
  camera?: string;
  audioMode?: string;
  changeScope?: string;
  continuity?: string;
}

export interface ProjectInput {
  ownerSessionId?: string;
  title?: string;
  prompt?: string;
  era?: string;
  genre?: string;
  audience?: string;
  visualStyle?: string;
  language?: string;
  duration?: number;
  captions?: boolean;
  mode?: string;
  cast?: Array<{ id?: string; role?: string; voiceProfileId?: string; customSnapshot?: JsonRecord }>;
  scenes?: SceneInput[];
}

@Injectable()
export class StudioService {
  constructor(private readonly prisma: PrismaService) {}

  capabilities() {
    return {
      projectStorage: 'implemented',
      sceneVersionModel: 'implemented',
      catalogApi: 'implemented',
      storyPlanner: 'local-prototype-only',
      renderQueue: 'not-connected',
      voiceSynthesis: 'not-connected',
      moderation: 'required-before-provider-calls',
      limits: { minimumSeconds: 15, maximumSeconds: 3600 },
    };
  }

  async listCharacters(status?: string, limit = 24, offset = 0) {
    const catalogStatus = this.catalogStatus(status);
    const take = Math.min(100, Math.max(1, Number(limit) || 24));
    const skip = Math.max(0, Number(offset) || 0);
    const where = catalogStatus ? { status: catalogStatus } : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.character.findMany({ where, take, skip, orderBy: [{ status: 'asc' }, { name: 'asc' }] }),
      this.prisma.character.count({ where }),
    ]);
    return { items, total, limit: take, offset: skip };
  }

  async listVoices(languageCode?: string, status?: string, limit = 24, offset = 0) {
    const catalogStatus = this.catalogStatus(status);
    const take = Math.min(100, Math.max(1, Number(limit) || 24));
    const skip = Math.max(0, Number(offset) || 0);
    const where = { ...(languageCode ? { languageCode } : {}), ...(catalogStatus ? { status: catalogStatus } : {}) };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.voiceProfile.findMany({ where, take, skip, orderBy: [{ status: 'asc' }, { languageName: 'asc' }, { name: 'asc' }] }),
      this.prisma.voiceProfile.count({ where }),
    ]);
    return { items, total, limit: take, offset: skip };
  }

  async createProject(input: ProjectInput) {
    const duration = Number(input.duration ?? 30);
    if (!Number.isFinite(duration) || duration < 15 || duration > 3600) throw new BadRequestException('duration must be between 15 and 3600 seconds');
    if (!input.prompt?.trim() || input.prompt.trim().length < 12) throw new BadRequestException('prompt must contain at least 12 characters');
    if ((input.scenes?.length ?? 0) > 120) throw new BadRequestException('a project can contain at most 120 editable scenes');

    const projectId = uuidv7();
    const ownerSessionId = input.ownerSessionId?.trim() || uuidv7();
    const mode = input.mode?.toLowerCase() === 'creator' ? StudioMode.CREATOR : StudioMode.SIMPLE;
    const scenes = (input.scenes?.length ? input.scenes : [{ title: 'Opening scene', duration, action: input.prompt }]).map((scene, index) => this.sceneData(scene, index));
    const totalSceneDuration = scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0);
    if (totalSceneDuration > 3600) throw new BadRequestException('combined scene duration cannot exceed 3600 seconds');

    const project = await this.prisma.storyProject.create({
      data: {
        id: projectId,
        ownerSessionId,
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
          create: (input.cast ?? []).slice(0, 100).map((member, index) => ({
            id: uuidv7(), characterId: member.id || null, voiceProfileId: member.voiceProfileId || null,
            role: member.role || (index === 0 ? 'lead' : 'supporting'), sortOrder: index, customSnapshot: member.customSnapshot as any,
          })),
        },
        scenes: { create: scenes },
      },
      include: { storyCharacters: true, scenes: { orderBy: { sortOrder: 'asc' } } },
    });
    return { ownerSessionId, project };
  }

  async getProject(projectId: string, ownerSessionId?: string) {
    const project = await this.prisma.storyProject.findUnique({ where: { id: projectId }, include: { storyCharacters: { include: { character: true, voiceProfile: true }, orderBy: { sortOrder: 'asc' } }, scenes: { orderBy: { sortOrder: 'asc' } } } });
    if (!project) throw new NotFoundException('project not found');
    this.assertOwner(project.ownerSessionId, ownerSessionId);
    return project;
  }

  async updateScene(projectId: string, sceneId: string, ownerSessionId: string | undefined, input: SceneInput) {
    const project = await this.prisma.storyProject.findUnique({ where: { id: projectId }, select: { ownerSessionId: true } });
    if (!project) throw new NotFoundException('project not found');
    this.assertOwner(project.ownerSessionId, ownerSessionId);
    const existing = await this.prisma.storyScene.findFirst({ where: { id: sceneId, projectId } });
    if (!existing) throw new NotFoundException('scene not found');
    const duration = input.duration === undefined ? existing.durationSeconds : this.sceneDuration(input.duration);
    return this.prisma.storyScene.update({ where: { id: sceneId }, data: {
      title: input.title?.trim() || existing.title, durationSeconds: duration,
      characters: input.character?.trim() ?? existing.characters, location: input.location?.trim() ?? existing.location,
      action: input.action?.trim() ?? existing.action, dialogue: input.dialogue?.trim() ?? existing.dialogue,
      expression: input.expression?.trim() ?? existing.expression, camera: input.camera?.trim() ?? existing.camera,
      audioMode: input.audioMode?.trim() ?? existing.audioMode, regenerationScope: input.changeScope?.trim() ?? existing.regenerationScope,
      continuity: input.continuity?.trim() ?? existing.continuity, version: { increment: 1 },
    } });
  }

  private sceneData(scene: SceneInput, index: number) {
    return { id: uuidv7(), sortOrder: index, title: scene.title?.trim() || `Scene ${index + 1}`, durationSeconds: this.sceneDuration(scene.duration ?? 8), characters: scene.character?.trim() || 'Full cast', location: scene.location?.trim() || 'Story world', action: scene.action?.trim() || 'Describe what happens.', dialogue: scene.dialogue?.trim() || null, expression: scene.expression?.trim() || 'curious', camera: scene.camera?.trim() || 'Wide establishing shot', audioMode: scene.audioMode?.trim() || 'Narration', regenerationScope: scene.changeScope?.trim() || 'Keep everything', continuity: scene.continuity?.trim() || null };
  }

  private sceneDuration(value: number) {
    const duration = Number(value);
    if (!Number.isFinite(duration) || duration < 1 || duration > 900) throw new BadRequestException('each scene duration must be between 1 and 900 seconds');
    return Math.round(duration);
  }

  private catalogStatus(status?: string): CatalogStatus | undefined {
    if (!status) return undefined;
    const candidate = status.toUpperCase() as CatalogStatus;
    if (!Object.values(CatalogStatus).includes(candidate)) throw new BadRequestException('invalid catalog status');
    return candidate;
  }

  private assertOwner(expected: string, received?: string) {
    if (!received || received !== expected) throw new ForbiddenException('valid x-toonswap-session header required');
  }
}
