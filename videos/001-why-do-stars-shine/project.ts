import {defineVideo} from '@design/project';
import fusion from './scenes/01-fusion?scene';

export default defineVideo({
  name: '001-why-do-stars-shine',
  variables: {
    title: 'Why Do Stars Shine?',
    subtitle: 'The nuclear furnace in the sky',
  },
  // audio: voiceover,  // import voiceover from './audio/voiceover.wav';
  scenes: [fusion],
});
