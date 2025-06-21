<script lang="ts">
  import { onMount } from 'svelte'
  import Button from '$lib/components/ui/button/Button.svelte'
  import Card from '$lib/components/ui/card/Card.svelte'
  import CardContent from '$lib/components/ui/card/CardContent.svelte'
  import CardHeader from '$lib/components/ui/card/CardHeader.svelte'
  import CardTitle from '$lib/components/ui/card/CardTitle.svelte'

  let appVersion = ''
  let platform = ''

  onMount(async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        appVersion = await window.electronAPI.getAppVersion()
        platform = await window.electronAPI.getPlatform()
      } catch (error) {
        console.log('Running in browser mode')
      }
    }
  })
</script>

<svelte:head>
  <title>not.e - Enterprise Note Taking</title>
  <meta name="description" content="Enterprise-level note-taking application" />
</svelte:head>

<div class="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
  <div class="text-center space-y-4">
    <h1 class="text-4xl font-bold tracking-tight">Welcome to not.e</h1>
    <p class="text-xl text-muted-foreground max-w-[600px]">
      Enterprise-level note-taking application built with Electron, SvelteKit, and shadcn/ui
    </p>
  </div>

  <Card class="w-full max-w-md">
    <CardHeader>
      <CardTitle>Application Info</CardTitle>
    </CardHeader>
    <CardContent class="space-y-2">
      {#if appVersion}
        <p><span class="font-medium">Version:</span> {appVersion}</p>
      {/if}
      {#if platform}
        <p><span class="font-medium">Platform:</span> {platform}</p>
      {/if}
      <p><span class="font-medium">Mode:</span> {appVersion ? 'Electron' : 'Browser'}</p>
    </CardContent>
  </Card>

  <div class="flex gap-4">
    <Button variant="default">Get Started</Button>
    <Button variant="outline">Learn More</Button>
  </div>
</div>
