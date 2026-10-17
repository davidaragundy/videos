import {defineVideo} from '@design/project';
import fusion from './scenes/01-fusion?scene';

export default defineVideo({
  name: '001-why-do-stars-shine',
  variables: {
    title: 'Why Do Stars Shine?',
    subtitle: 'The nuclear furnace in the sky',
  },
  // Voiceover: run `pnpm voice <slug>`, then uncomment (and add the imports below):
  //   import voiceover from './audio/voiceover.mp3';
  //   import voiceoverTiming from './audio/voiceover.json';
  // audio: voiceover,
  // voiceover: voiceoverTiming, // scenes' waitForVO('event') sync to the VO automatically
  scenes: [fusion],
});
