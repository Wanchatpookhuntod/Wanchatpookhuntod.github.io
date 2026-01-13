export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const videos = await request.json();

    if (!Array.isArray(videos)) {
      return new Response(JSON.stringify({ error: 'Expected array of videos' }), { status: 400 });
    }

    // Remove thumbnailData from each video to save space
    const cleanVideos = videos.map(video => {
      const { thumbnailData, ...rest } = video;
      return rest;
    });

    // Save to R2
    await env.BUCKET.put('data/videos.json', JSON.stringify(cleanVideos, null, 2), {
        httpMetadata: { contentType: 'application/json' }
    });

    return new Response(JSON.stringify({
      success: true,
      count: cleanVideos.length,
      message: 'Videos saved successfully to Cloudflare R2'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
