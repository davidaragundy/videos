/** Text-to-speech backends for `pnpm voice`. Each returns one MP3 clip per call. */

export interface SynthesizeOptions {
  apiKey: string;
  voice: string;
  model: string;
  /** Free-text delivery direction (only some providers use it). */
  style?: string;
}

export interface Provider {
  label: string;
  /** Env var prefix: `<PREFIX>_API_KEY`, `<PREFIX>_VOICE_ID`, `<PREFIX>_MODEL_ID`. */
  env: string;
  keyUrl: string;
  defaultVoice: string;
  defaultModel: string;
  synthesize(text: string, options: SynthesizeOptions): Promise<Buffer>;
}

async function request(url: string, init: RequestInit) {
  const res = await fetch(url, init);
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}\n  ${detail.slice(0, 500)}`);
  }
  return res;
}

const mp3 = async (res: Response) => Buffer.from(await res.arrayBuffer());

export const providers = {
  elevenlabs: {
    label: 'ElevenLabs',
    env: 'ELEVENLABS',
    keyUrl: 'https://elevenlabs.io/app/settings/api-keys',
    defaultVoice: 'JBFqnCBsd6RMkjVDRZzb', // premade "George"
    defaultModel: 'eleven_multilingual_v2',
    async synthesize(text, {apiKey, voice, model}) {
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`;
      return mp3(
        await request(url, {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          body: JSON.stringify({text, model_id: model}),
        }),
      );
    },
  },

  fish: {
    label: 'Fish Audio',
    env: 'FISH_AUDIO',
    keyUrl: 'https://fish.audio/app/api-keys',
    // Empty = Fish Audio's default voice. Use a voice model id from fish.audio/discovery.
    defaultVoice: '',
    defaultModel: 's2.1-pro-free', // free developer tier; `s2.1-pro` for paid
    async synthesize(text, {apiKey, voice, model}) {
      return mp3(
        await request('https://api.fish.audio/v1/tts', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            model,
          },
          body: JSON.stringify({
            text,
            format: 'mp3',
            mp3_bitrate: 192,
            ...(voice ? {reference_id: voice} : {}),
          }),
        }),
      );
    },
  },

  openai: {
    label: 'OpenAI',
    env: 'OPENAI',
    keyUrl: 'https://platform.openai.com/api-keys',
    defaultVoice: 'onyx',
    defaultModel: 'gpt-4o-mini-tts',
    async synthesize(text, {apiKey, voice, model, style}) {
      return mp3(
        await request('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            voice,
            input: text,
            response_format: 'mp3',
            // `instructions` is only accepted by the gpt-4o-*-tts models.
            ...(style && model.includes('gpt-') ? {instructions: style} : {}),
          }),
        }),
      );
    },
  },

  google: {
    label: 'Google Cloud TTS',
    env: 'GOOGLE_TTS',
    keyUrl: 'https://console.cloud.google.com/apis/credentials',
    defaultVoice: 'en-US-Chirp3-HD-Charon',
    defaultModel: '', // the model is part of the voice name
    async synthesize(text, {apiKey, voice}) {
      const languageCode = voice.split('-').slice(0, 2).join('-');
      const res = await request(
        'https://texttospeech.googleapis.com/v1/text:synthesize',
        {
          method: 'POST',
          headers: {'X-Goog-Api-Key': apiKey, 'Content-Type': 'application/json'},
          body: JSON.stringify({
            input: {text},
            voice: {languageCode, name: voice},
            audioConfig: {audioEncoding: 'MP3', sampleRateHertz: 44100},
          }),
        },
      );
      const {audioContent} = (await res.json()) as {audioContent: string};
      return Buffer.from(audioContent, 'base64');
    },
  },
} satisfies Record<string, Provider>;

export type ProviderId = keyof typeof providers;
export const providerIds = Object.keys(providers) as ProviderId[];
