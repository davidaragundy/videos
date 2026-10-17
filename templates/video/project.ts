import {defineVideo} from '@design/project';
import main from './scenes/01-main?scene';

export default defineVideo({
  name: '{{SLUG}}',
  variables: {
    title: '{{TITLE}}',
  },
  // audio: voiceover,  // import voiceover from './audio/voiceover.wav';
  scenes: [main],
});
