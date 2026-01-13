export async function onRequestGet(context) {
  const { env, params } = context;
  const filename = params.filename; // Array of path segments or string depending on setup. For [[filename]], params.filename is array if slashes, or string.
  
  // Since we are in functions/images/cover/[[filename]].js
  // filename will capture everything after images/cover/
  
  // In Pages functions [[var]] captures array of path segments
  const path = Array.isArray(filename) ? filename.join('/') : filename;

  if (!path) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    const object = await env.BUCKET.get(`images/cover/${path}`);

    if (object === null) {
      // Return 404 if not found in R2
      // Cloudflare Pages will then try to serve static asset if we pass through?
      // Actually standard behavior is: if Function returns response, that's it.
      // If we want to fallback to static asset, we can use context.next() if we were in middleware.
      // But here we are at a specific route. a 404 here is a 404.
      // EXCEPT: Static assets are checked BEFORE functions usually? 
      // Cloudflare: "If a static asset exists... Function will NOT be executed."
      // So this function Only runs if the static image is MISSING.
      // So if it's missing in R2 as well, it's a true 404.
      return new Response('Image not found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    // Ensure cache control
    headers.set('Cache-Control', 'public, max-age=31536000');

    return new Response(object.body, {
      headers,
    });
  } catch (err) {
    return new Response('Error loading image', { status: 500 });
  }
}
