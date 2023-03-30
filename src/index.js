export default {
  async fetch(request, env) {
    return await handleRequest(request).catch(
      (err) => new Response(err.stack, { status: 500 })
    )
  }
}

/**
 * @param {string} domain
 * @returns {string}
 */
async function resolveUri(domain) {
  const requestUrl = 'https://cloudflare-dns.com/dns-query?type=URI&name=' + encodeURIComponent(domain);
  console.log(`dns URL: ${requestUrl}`);
  const response = await fetch(requestUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/dns-json',
    },
  });
  const json = await response.json();
  if (!json.Answer || !json.Answer[0] || !json.Answer[0].data) {
    throw `No URI record found for ${domain}`;
  }
  const rawData = json.Answer[0].data;
  const match = rawData.match(/^\\#((?: [0-9A-Fa-f]{2})+)$/);
  if (!match) {
    throw `Malformed URI record for ${domain}: ${rawData}`;
  }
  const uriBytes = match[1].substring(5 * 3).replaceAll(' ', '%');
  return decodeURIComponent(uriBytes);
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  const domain = url.hostname;

  // Redirect to HTTPS first for HSTS
  if (url.protocol !== 'https:') {
    url.protocol = 'https:';
    console.log(`Switching to HTTPS: ${url.toString()}`);
    return Response.redirect(url.toString(), 301);
  }

  // Resolve the redirected domain
  try {
    const destination = await resolveUri(domain);
    return new Response(null, {
      status: 302,
      headers: {
        'Location': destination,
        'Strict-Transport-Security': 'max-age=31536000;',
      }
    });
  } catch (error) {
    return new Response(error, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
        'Strict-Transport-Security': 'max-age=31536000;',
      },
    });
  }
}