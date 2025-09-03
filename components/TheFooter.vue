<template>
  <footer class="py-6 md:px-8 md:py-0">
    <div class="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
      <p class="text-center text-sm leading-loose text-muted-foreground md:text-left">
        Built by Jules. The source code is available on GitHub.
      </p>
      <div class="flex items-center space-x-4">
        <NuxtLink to="/terms" class="text-sm font-medium text-muted-foreground hover:text-foreground">
          利用規約
        </NuxtLink>
        <NuxtLink to="/privacy" class="text-sm font-medium text-muted-foreground hover:text-foreground">
          プライバシーポリシー
        </NuxtLink>
        <NuxtLink to="/contact" class="text-sm font-medium text-muted-foreground hover:text-foreground">
          お問い合わせ
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>