function isCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  const bots = [
    'facebookexternalhit',
    'facebot',
    'twitterbot',
    'whatsapp',
    'discordbot',
    'slackbot',
    'linkedinbot',
    'telegrambot',
    'googlebot',
    'bingbot',
    'applebot',
  ];
  return bots.some(bot => ua.includes(bot));
}

function extractVendorSlug(hostname, pathname) {
  const parts = hostname.split('.');
  if (parts.length >= 3 && parts[0].toLowerCase() !== 'www') {
    return parts[0];
  }
  const segments = pathname.replace(/^\//, '').split('/');
  const first = segments[0]?.trim();
  if (first && first.length > 0 && !['login', 'checkout', 'api'].includes(first.toLowerCase())) {
    return first;
  }
  return 'admin';
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const userAgent = req.headers['user-agent'];

    if (!isCrawler(userAgent)) {
      return res.status(200).send('');
    }

    const hostname = req.headers.host || '';
    const pathname = new URL(req.url || '/', `https://${hostname}`).pathname;
    const slug = extractVendorSlug(hostname, pathname);

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    let vendorName = 'Compra Acelerada';
    let vendorPhoto = `https://${hostname}/og-default.jpg`;
    const siteUrl = `https://${hostname}${pathname}`;

    if (supabaseUrl && supabaseKey) {
      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/vendors?id=eq.${encodeURIComponent(slug)}&select=nome,foto_perfil_url,ativo`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
            },
          }
        );
        const data = await response.json();
        if (data && data.length > 0 && data[0].ativo) {
          vendorName = data[0].nome || vendorName;
          if (data[0].foto_perfil_url) {
            vendorPhoto = data[0].foto_perfil_url;
          }
        }
      } catch (e) {
        console.error('Erro ao buscar vendedor para OG:', e);
      }
    }

    const title = `${vendorName} - Realize o sonho da sua Honda`;
    const description = `Confira o catálogo de motos Honda com ${vendorName}. Explore os modelos e encontre a Honda ideal para você!`;

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${vendorPhoto}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${siteUrl}" />
  <meta property="og:site_name" content="Compra Acelerada" />
  <meta property="og:locale" content="pt_BR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${vendorPhoto}" />
</head>
<body></body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(html);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
