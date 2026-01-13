export async function onRequestDelete(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { filename } = body;

    if (!filename) {
      return new Response(JSON.stringify({ error: 'Missing filename' }), { status: 400 });
    }

    await env.BUCKET.delete(`images/cover/${filename}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Image deleted from Cloudflare R2'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
