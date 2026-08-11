<template>
  <footer class="site-footer">
    <div class="footer-main">
      <div class="footer-brand">
        <RouterLink class="brand footer-logo" to="/">
          <img class="brand-mark" src="/favicon.svg" alt="" aria-hidden="true" />
          <span class="brand-name">Toon<span>Swap</span></span>
        </RouterLink>
        <p>Build original cartoon worlds.<br />Made locally, shared globally.</p>
      </div>
      <div class="footer-links">
        <strong>Create</strong>
        <RouterLink to="/#studio">Quick toon</RouterLink>
        <RouterLink to="/characters">Character lab</RouterLink>
        <RouterLink to="/voices">Voice library</RouterLink>
        <RouterLink to="/story-studio">Story studio</RouterLink>
        <RouterLink to="/roadmap">How it works</RouterLink>
      </div>
      <div class="footer-links">
        <strong>Explore</strong>
        <RouterLink to="/blog">Blog</RouterLink>
        <RouterLink to="/privacy">Privacy</RouterLink>
        <RouterLink to="/terms">Terms</RouterLink>
        <RouterLink to="/community-guidelines">Community guidelines</RouterLink>
      </div>
      <div class="footer-note">
        <strong>Built for joy, never imitation.</strong>
        <p>
          Use original characters, licensed media, and voices you own or have permission to use.
          ToonSwap does not support celebrity clones or copied cartoon identities.
        </p>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 ToonSwap</span>
      <span>Original characters · Consent-first voices · Responsible creation</span>
      <span>Made with care in India, for everywhere.</span>
    </div>
  </footer>
</template>
