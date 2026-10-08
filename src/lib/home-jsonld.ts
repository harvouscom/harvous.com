const SITE = "https://harvous.com";

/* No FAQPage here: the questions live on /faq/, which carries that markup. */
export function buildHomeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Harvous",
        url: SITE,
        description:
          "A Bible study notes app alternative — remember and reconnect with what you saved from Scripture, read right alongside your notes. No sermon transcription.",
      },
      {
        "@type": "SoftwareApplication",
        name: "Harvous",
        applicationCategory: "ProductivityApplication",
        operatingSystem: "Web",
        url: SITE,
        description:
          "Bible study notes app with scripture pills, highlights, threads, suggestions, and a built-in Bible reader — built to help you remember what you saved.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
  };
}
