import '../styles/fonts.css';
import {makeProject, ProjectSettings, Vector2} from '@motion-canvas/core';
import endCard from './scenes/endCard?scene';
import titleCard from './scenes/titleCard?scene';
import {Format, formats} from './theme/layout';
import {VOICEOVER_VARIABLE, type Voiceover} from './utils/voiceover';

export interface VideoVariables extends Record<string, unknown> {
  /** Shown on the shared title card. */
  title: string;
  /** Optional kicker line under the title. */
  subtitle?: string;
}

export interface VideoConfig extends Omit<ProjectSettings, 'scenes' | 'variables'> {
  name: string;
  scenes: ProjectSettings['scenes'];
  variables: VideoVariables;
  /**
   * `landscape` (1920×1080, YouTube) or `vertical` (1080×1920, TikTok / Reels / Shorts).
   * Sets the canvas size; scenes adapt through `useFrame()`. Default: landscape.
   */
  format?: Format;
  /** Prepend the shared animated title card. Default: true for landscape, false for vertical. */
  intro?: boolean;
  /** Append the shared end card. Default: true for landscape, false for vertical. */
  outro?: boolean;
  /** `audio/voiceover.json` from `pnpm voice` — drives `waitForVO()` in scenes. */
  voiceover?: Voiceover;
}

/**
 * Wraps `makeProject` so every video gets the same fonts, intro and outro.
 * Use it in each `videos/<slug>/project.ts`.
 */
export function defineVideo({
  format = 'landscape',
  intro = format === 'landscape',
  outro = format === 'landscape',
  scenes,
  plugins = [],
  voiceover,
  variables,
  ...config
}: VideoConfig) {
  // Kick off font loading early so the first rendered frames use real fonts.
  void document.fonts.load('500 160px "Inter Tight Variable"');
  void document.fonts.load('italic 400 80px "Instrument Serif"');

  const {width, height} = formats[format];
  return makeProject({
    ...config,
    plugins: [
      ...plugins,
      {
        // The format in code is the source of truth for resolution, not the editor setting.
        name: 'videos-format',
        project(project) {
          project.meta.shared.size.set(new Vector2(width, height));
        },
      },
    ],
    variables: voiceover ? {...variables, [VOICEOVER_VARIABLE]: voiceover} : variables,
    scenes: [...(intro ? [titleCard] : []), ...scenes, ...(outro ? [endCard] : [])],
  });
}
