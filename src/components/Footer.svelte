<script lang="ts">
  import FaHeart from 'svelte-icons/fa/FaHeart.svelte'
  import Button from '$components/Button.svelte'
</script>

<footer class="p-6 pt-8 flex flex-col items-center text-center text-gray-600">
  <div class="py-4 flex flex-col items-center justify-center text-center p-5 max-w-sm">
    <small class="mb-3"
      >*No, you are not the product. The internet can still be a great place. Together for privacy
      over profits.</small
    >
    <Button
      href="https://donate.stripe.com/28oeV1gKP3bv4b6144"
      variant="dark"
      size="small"
      class=""
      target="_blank"
    >
      <div class="flex mr-2 w-4 h-4">
        <FaHeart />
      </div>
      Support</Button
    >
  </div>
  <small>
    Created by{' '}
    <a class="underline hover:text-primary" href="https://twitter.com/stophecom"> @stophecom</a>
    <!-- Use <a class="underline hover:text-primary" href="https://scrt.link">scrt.link</a> for greater needs. -->
    &bull;
    <a class="underline hover:text-primary" href="https://github.com/stophecom/sharrr-svelte">
      Github</a
    >
  </small>
</footer>
