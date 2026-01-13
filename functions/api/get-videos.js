export async function onRequestGet(context) {
  try {
    const { env } = context;
    let object = null;

    // 1. Try to get from R2 if BUCKET is bound
    if (env.BUCKET) {
      try {
        object = await env.BUCKET.get('data/videos.json');
      } catch (r2Error) {
        console.error('R2 Error:', r2Error);
      }
    }

    // 2. If not found in R2 or R2 failed, fallback to static asset
    if (object === null) {
      console.log('Falling back to static videos.json...');

      // Use env.ASSETS.fetch for Cloudflare Pages assets if available
      // otherwise fallback to normal fetch
      const url = new URL(context.request.url);
      const staticUrl = `${url.origin}/data/videos.json`;

      let response;
      if (env.ASSETS) {
        response = await env.ASSETS.fetch(staticUrl);
      } else {
        response = await fetch(staticUrl);
      }

      if (response.ok) {
        return response;
      }
      return new Response('[]', { headers: { 'Content-Type': 'application/json' } });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Content-Type', 'application/json');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(object.body, {
      headers,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}