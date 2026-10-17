import {defineVideo} from '@design/project';
import fusion from './scenes/01-fusion?scene';
import voiceover from './audio/voiceover.mp3';
import voiceoverTiming from './audio/voiceover.json';

export default defineVideo({
  name: '001-why-do-stars-shine',
  variables: {
    title: 'Why Do Stars Shine?',
    subtitle: 'The nuclear furnace in the sky',
  },
  audio: voiceover,
  voiceover: voiceoverTiming, // scenes' waitForVO('event') sync to the VO automatically
  scenes: [fusion],
});
