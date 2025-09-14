<template>
  <footer class="container mx-auto py-6 px-6 md:py-0 md:h-24 flex flex-col items-center justify-between gap-4 md:flex-row">
    <p class="text-center text-sm leading-loose text-foreground md:text-left">
      © 2025 Marketplace All rights reserved.
    </p>
    <div class="flex items-center space-x-4">
      <NuxtLink to="/terms" class="text-sm font-medium text-foreground hover:text-muted-foreground">
        利用規約
      </NuxtLink>
      <NuxtLink to="/privacy" class="text-sm font-medium text-foreground hover:text-muted-foreground">
        プライバシーポリシー
      </NuxtLink>
      <NuxtLink to="/contact" class="text-sm font-medium text-foreground hover:text-muted-foreground">
        お問い合わせ
      </NuxtLink>
    </div>
  </footer>
</template>