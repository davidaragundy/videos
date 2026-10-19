import {defineVideo} from '@design/project';
import voiceover from './audio/voiceover.mp3';
import voiceoverTiming from './audio/voiceover.json';
import hook from './scenes/01-hook?scene';
import wind from './scenes/02-wind?scene';
import energy from './scenes/03-energy?scene';
import math from './scenes/04-math?scene';
import shore from './scenes/05-shore?scene';
import loop from './scenes/06-loop?scene';

export default defineVideo({
  name: '002-waves',
  format: 'vertical',
  variables: {
    title: 'How Do Waves Work?',
  },
  audio: voiceover,
  voiceover: voiceoverTiming, // scenes' waitForVO('event') sync to the VO automatically
  scenes: [hook, wind, energy, math, shore, loop],
});
