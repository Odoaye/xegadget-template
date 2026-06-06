import '../styles/globals.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>XE Tech — Premium Gadgets</title>
        <meta name="description" content="Quality gadgets at honest prices. From smartphones to earbuds, bringing you the best in tech." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="XE Tech — Premium Gadgets" />
        <meta property="og:description" content="Quality gadgets at honest prices. From smartphones to earbuds, bringing you the best in tech." />
        <meta property="og:image" content="/preview.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:alt" content="XE Tech branding with premium gadget preview." />
        <meta property="og:site_name" content="XE Tech" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="XE Tech — Premium Gadgets" />
        <meta name="twitter:description" content="Quality gadgets at honest prices. From smartphones to earbuds, bringing you the best in tech." />
        <meta name="twitter:image" content="/preview.png" />
        <meta name="twitter:image:alt" content="XE Tech branding with premium gadget preview." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,800;1,900&family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
