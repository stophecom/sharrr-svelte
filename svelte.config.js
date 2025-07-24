import adapter from '@sveltejs/adapter-vercel'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),

    alias: {
      $components: 'src/components',
      $api: 'src/routes/api/v1'
    }

    // csp: {
    //   directives: {
    //     'script-src': ['self']
    //   },
    //   reportOnly: {
    //     'script-src': ['self']
    //   }
    // }
  }
}

export default config
