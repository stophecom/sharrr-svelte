<script>
  import { page } from '$app/stores'
  import logo from '$lib/images/logo-sharrr.svg'
  import github from '$lib/images/github.svg'
</script>

<header class=" bg-white">
  <div class="container mx-auto px-4 py-3">
    <div class="grid grid-cols-3 gap-4 items-center">
      <a class="flex flex-row items-center" href="/">
        <img class="w-24" src={logo} alt="Sharrr" />
      </a>

      <nav class="grow flex flex-row justify-center">
        <ul class="flex flex-row items-center">
          <li class="flex" aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
            <a class="flex px-3" href="/">Home</a>
          </li>
          <li class="flex" aria-current={$page.url.pathname === '/about' ? 'page' : undefined}>
            <a class="flex px-3" href="/about">About</a>
          </li>
        </ul>
      </nav>

      <div class="flex justify-end">
        <a href="https://github.com/stophecom/sharrr-svelte">
          <img class="w-8" src={github} alt="GitHub" />
        </a>
      </div>
    </div>
  </div>
</header>
