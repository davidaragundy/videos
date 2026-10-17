import '../styles/fonts.css';
import {makeProject, ProjectSettings} from '@motion-canvas/core';
import endCard from './scenes/endCard?scene';
import titleCard from './scenes/titleCard?scene';

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
  /** Prepend the shared animated title card. Default: true. */
  intro?: boolean;
  /** Append the shared end card. Default: true. */
  outro?: boolean;
}

/**
 * Wraps `makeProject` so every video gets the same fonts, intro and outro.
 * Use it in each `videos/<slug>/project.ts`.
 */
export function defineVideo({
  intro = true,
  outro = true,
  scenes,
  ...config
}: VideoConfig) {
  // Kick off font loading early so the first rendered frames use real fonts.
  void document.fonts.load('800 160px "Outfit Variable"');
  void document.fonts.load('700 44px "Nunito Variable"');

  return makeProject({
    ...config,
    scenes: [...(intro ? [titleCard] : []), ...scenes, ...(outro ? [endCard] : [])],
  });
}
