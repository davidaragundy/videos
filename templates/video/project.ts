import {defineVideo} from '@design/project';
import main from './scenes/01-main?scene';

export default defineVideo({
  name: '{{SLUG}}',
  format: 'landscape', // or 'vertical' (TikTok / Reels / Shorts)
  variables: {
    title: '{{TITLE}}',
  },
  // Voiceover: run `pnpm voice <slug>`, then uncomment (and add the imports below):
  //   import voiceover from './audio/voiceover.mp3';
  //   import voiceoverTiming from './audio/voiceover.json';
  // audio: voiceover,
  // voiceover: voiceoverTiming, // scenes' waitForVO('event') sync to the VO automatically
  scenes: [main],
});
