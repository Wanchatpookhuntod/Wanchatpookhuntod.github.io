export async function onRequestGet(context) {
  try {
    const { env } = context;
    // Try to get from R2 first
    const object = await env.BUCKET.get('data/videos.json');

    if (object === null) {
      // If not in R2, try to fetch the static asset (the original file in the repository)
      // This acts as a fallback or "initial state"
      const url = new URL(context.request.url);
      const staticUrl = `${url.origin}/data/videos.json`;
      const response = await fetch(staticUrl);
      if(response.ok) {
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