'use client';

import Script from 'next/script';

type GoogleAnalyticsProps = {
  measurementId?: string;
};

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const id = measurementId || process.env.NEXT_PUBLIC_GA_ID;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${id}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}


