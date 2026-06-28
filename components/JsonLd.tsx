/**
 * Renders a <script type="application/ld+json"> block. Server-rendered,
 * so it's present in the raw HTML for search engines without needing JS
 * execution — same reasoning as the AdSense verification meta tag.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
