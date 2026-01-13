export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { filename, data } = body;

    if (!filename || !data) {
      return new Response(JSON.stringify({ error: 'Missing filename or data' }), { status: 400 });
    }

    // Extract base64 data
    const base64Data = data.includes(',') ? data.split(',')[1] : data;
    
    // Convert base64 to Uint8Array
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Save to R2
    await env.BUCKET.put(`images/cover/${filename}`, bytes, {
        httpMetadata: { contentType: 'image/jpeg' } // You might want to detect mime type dynamically if possible, or default to jpeg/png
    });

    return new Response(JSON.stringify({
      success: true,
      path: `images/cover/${filename}`,
      message: 'Image uploaded to Cloudflare R2'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
