<script>
  import { page } from '$app/stores'
  import logo from '$lib/images/logo-sharrr.svg'
  import github from '$lib/images/github-mark.svg'
</script>

<header class="bg-white/60">
  <div class="container mx-auto px-4 py-4">
    <div class="grid grid-cols-3 gap-4 items-center">
      <a class="flex flex-row items-center" href="/">
        <img class="w-16 sm:w-24" src={logo} alt="Sharrr" />
        <span class="sr-only">Home</span>
      </a>

      <nav class="grow flex flex-row justify-center">
        <ul class="flex flex-row items-center">
          <li class="flex" aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
            <a
              class="flex px-3 hover:text-primary {$page.url.pathname === '/'
                ? 'text-primary'
                : undefined}"
              href="/">Home</a
            >
          </li>
          <li class="flex" aria-current={$page.url.pathname === '/about' ? 'page' : undefined}>
            <a
              class="flex px-3 hover:text-primary {$page.url.pathname === '/about'
                ? 'text-primary'
                : undefined}"
              href="/about">About</a
            >
          </li>
        </ul>
      </nav>

      <div class="flex justify-end">
        <a href="https://github.com/stophecom/sharrr-svelte">
          <img class="w-6 sm:w-7" src={github} alt="GitHub" />
          <span class="sr-only">GitHub</span>
        </a>
      </div>
    </div>
  </div>
</header>
