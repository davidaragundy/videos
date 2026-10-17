import {defineConfig} from 'vite';
import motionCanvas from '@motion-canvas/vite-plugin';
import ffmpeg from '@motion-canvas/ffmpeg';
import {fileURLToPath, URL} from 'node:url';

/**
 * Every folder in `videos/` that contains a `project.ts` is picked up
 * automatically and shows up in the editor's project picker.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@design': fileURLToPath(new URL('./src/design', import.meta.url)),
    },
  },
  plugins: [
    motionCanvas({
      project: './videos/*/project.ts',
      output: './output',
    }),
    ffmpeg(),
  ],
});
