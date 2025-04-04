import Head from "next/head"

interface SEOProps {
  title: string
  description: string
  keywords?: string
  url?: string
  image?: string
}

export default function SEO({
  title,
  description,
  keywords = "FTTH, CRM, FSM, fiber optics, FieldX, telecom automation, fiber management, innovation, ai, ai scheduler",
  url = "https://fieldx.gr",
  image = "https://fieldx.gr/og-image.jpg"
}: SEOProps) {
  return (
    <Head>
      {/* Basic SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Head>
  )
}
