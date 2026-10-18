import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title: string;
  description?: string;
}

export function SEO({ title, description }: SEOProps) {
  const { pathname } = useLocation();
  const baseUrl = import.meta.env.VITE_SITE_URL || 'https://alazab.com';
  const url = `${baseUrl.replace(/\/$/, '')}${pathname}`;
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
    </Helmet>
  );
}
