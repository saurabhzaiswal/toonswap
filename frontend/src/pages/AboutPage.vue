<script setup>
import PlatformPageShell from '../components/PlatformPageShell.vue';
import AppButton from '../components/ui/AppButton.vue';
</script>

<template>
  <PlatformPageShell
    eyebrow="The person building ToonSwap"
    title="Created by Saurabh Choudhary."
    description="ToonSwap is designed and engineered by Saurabh Choudhary as an original, consent-first AI cartoon storytelling platform for creators around the world."
    accent="#2db8a9"
    stat="Built in India"
    status="Independent product · Original characters · Responsible creation"
  >
    <section class="founder-section section-pad">
      <article class="founder-card">
        <div class="founder-portrait" aria-hidden="true">
          <span>SC</span>
          <i></i>
        </div>
        <div class="founder-copy">
          <p class="kicker">Creator and full-stack engineer</p>
          <h2>Saurabh Choudhary</h2>
          <p>
            Saurabh builds production SaaS platforms, secure identity systems, real-time
            applications, developer tools, and generative AI products. He created ToonSwap to make
            original cartoon storytelling easier without copying famous characters or voices.
          </p>
          <p>
            ToonSwap combines approachable creative tools with clear consent, identity-media safety,
            editable story structure, and an original-IP boundary that protects creators.
          </p>
          <div class="founder-actions">
            <AppButton
              href="https://saurabhzaiswal.vercel.app/"
              target="_blank"
              rel="me external noopener noreferrer"
              variant="primary"
              arrow
            >
              Visit Saurabh's portfolio
            </AppButton>
            <AppButton
              href="https://github.com/saurabhzaiswal"
              target="_blank"
              rel="me external noopener noreferrer"
              variant="outline"
              arrow
            >
              View GitHub
            </AppButton>
          </div>
        </div>
      </article>

      <div class="principles-grid">
        <article>
          <span>01</span>
          <h3>Original by design</h3>
          <p>
            New characters, worlds, movement languages, and voice directions built for ToonSwap.
          </p>
        </article>
        <article>
          <span>02</span>
          <h3>Consent before creation</h3>
          <p>Selfies and voices are sensitive media. Permission and private handling come first.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Simple enough to begin</h3>
          <p>
            Friendly guided choices first, with deeper production controls available when needed.
          </p>
        </article>
      </div>
    </section>
  </PlatformPageShell>
</template>

<style scoped lang="scss">
@use '../styles/tokens' as *;

.founder-section {
  display: grid;
  gap: clamp(30px, 5vw, 64px);
  padding-top: clamp(42px, 6vw, 84px);
  padding-bottom: clamp(64px, 8vw, 112px);
}

.founder-card {
  display: grid;
  grid-template-columns: minmax(260px, 0.72fr) minmax(0, 1.28fr);
  overflow: hidden;
  border: 1.5px solid $line;
  border-radius: 30px;
  background: $paper;
  box-shadow: $shadow-soft;
}

.founder-portrait {
  position: relative;
  min-height: 460px;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: $mint;
}

.founder-portrait::before,
.founder-portrait::after {
  content: '';
  position: absolute;
  width: 280px;
  height: 280px;
  border: 2px solid rgba(23, 20, 31, 0.15);
  border-radius: 50%;
}

.founder-portrait::before {
  left: -120px;
  top: -100px;
}

.founder-portrait::after {
  right: -110px;
  bottom: -120px;
}

.founder-portrait span {
  position: relative;
  z-index: 2;
  width: 180px;
  height: 220px;
  display: grid;
  place-items: center;
  border: 3px solid $ink;
  border-radius: 48% 48% 32px 32px;
  background: $coral;
  box-shadow: 12px 14px 0 $ink;
  color: white;
  font-size: clamp(3rem, 7vw, 5.5rem);
  font-weight: 950;
  letter-spacing: -0.08em;
  transform: rotate(-3deg);
}

.founder-portrait i {
  position: absolute;
  width: 220px;
  height: 28px;
  margin-top: 275px;
  border-radius: 50%;
  background: rgba(23, 20, 31, 0.18);
}

.founder-copy {
  align-self: center;
  padding: clamp(34px, 6vw, 78px);
}

.founder-copy h2 {
  margin: 10px 0 24px;
  font-size: clamp(2.5rem, 5vw, 5.6rem);
  line-height: 0.95;
  letter-spacing: -0.055em;
}

.founder-copy > p:not(.kicker) {
  max-width: 62ch;
  margin: 0 0 18px;
  color: $muted;
  font-size: clamp(1rem, 1.4vw, 1.16rem);
  line-height: 1.75;
}

.founder-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 34px;
}

.principles-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.principles-grid article {
  min-height: 230px;
  padding: clamp(24px, 3vw, 36px);
  border: 1.5px solid $line;
  border-radius: 24px;
  background: $paper;
}

.principles-grid span {
  display: inline-grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 13px;
  background: $gold;
  font-weight: 950;
}

.principles-grid h3 {
  margin: 28px 0 10px;
  font-size: 1.4rem;
}

.principles-grid p {
  margin: 0;
  color: $muted;
  line-height: 1.65;
}

@media (max-width: 820px) {
  .founder-card {
    grid-template-columns: 1fr;
  }

  .founder-portrait {
    min-height: 330px;
  }

  .principles-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .founder-card {
    border-radius: 22px;
  }

  .founder-copy {
    padding: 28px 22px 36px;
  }

  .founder-actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
