<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold">Welcome to the Home Page</h1>
    <p>If you can see this, the routing is working.</p>
    <div class="mt-4 space-x-2">
      <NuxtLink to="/login" class="text-blue-500 hover:underline">Go to Login</NuxtLink>
      <NuxtLink to="/signup" class="text-blue-500 hover:underline">Go to Signup</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
