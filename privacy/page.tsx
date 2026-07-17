import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Loophole handles data, cookies, and advertising.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <article className="max-w-2xl">
      <h1 className="font-display font-bold text-3xl mb-2">Privacy Policy</h1>
      <p className="stat-line text-ink/40 dark:text-white/30 mb-6">Last updated: June 28, 2026</p>

      <div className="space-y-6 text-ink/80 dark:text-white/70 leading-relaxed text-sm">
        <section>
          <h2 className="font-display font-bold text-lg text-ink dark:text-white mb-2">What we store on your device</h2>
          <p>
            Loophole saves your results, streaks, and theme preference (light/dark) directly in
            your browser&rsquo;s local storage. This data never leaves your device and is not sent to
            our servers — we don&rsquo;t have accounts, and we don&rsquo;t know who you are. Clearing your
            browser data or using a different device/browser will reset your streaks.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-ink dark:text-white mb-2">Advertising</h2>
          <p>
            This site shows ads served by Google AdSense. Google and its partners may use
            cookies and similar technologies to serve ads based on your prior visits to this or
            other websites. You can opt out of personalized advertising by visiting{' '}
            <a href="https://adssettings.google.com" className="underline">
              Google&rsquo;s Ads Settings
            </a>
            . For more on how Google uses data, see{' '}
            <a href="https://policies.google.com/technologies/partner-sites" className="underline">
              How Google uses information from sites that use our services
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-ink dark:text-white mb-2">Analytics</h2>
          <p>
            This site does not currently use any third-party analytics service. If that
            changes, this policy will be updated to name the provider and link to its privacy
            documentation before it&rsquo;s added.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-ink dark:text-white mb-2">Children&rsquo;s privacy</h2>
          <p>
            This site is not directed at children under 13 (or the relevant age of digital
            consent in your jurisdiction) and we do not knowingly collect personal information
            from them.
          </p>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg text-ink dark:text-white mb-2">Contact</h2>
          <p>Questions about this policy: openwave25@gmail.com</p>
        </section>
      </div>
    </article>
  );
}
