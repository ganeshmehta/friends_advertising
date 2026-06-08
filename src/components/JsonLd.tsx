/**
 * Tiny server-component for injecting JSON-LD structured data. Encapsulates
 * the `dangerouslySetInnerHTML` pattern with a typed payload so call-sites
 * stay declarative and there's no risk of XSS (the payload is fully serialised
 * from a typed object via `JSON.stringify`).
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | ReadonlyArray<Record<string, unknown>> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
