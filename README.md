# cloudflare-redirect

Simple [CloudFlare Worker](https://workers.cloudflare.com) to implement a service similar to [redirect.name](https://redirect.name), but with HTTPS support.

## Usage

- Deploy the worker (you can copy `src/index.js` into the web interface)
- Add a [custom domain to your worker](https://developers.cloudflare.com/workers/platform/triggers/custom-domains/#:~:text=Custom%20Domains%20can%20be%20attached,%3E%20Triggers%20%3E%20Add%20Custom%20Domain.)
- Add a `URI` record for the domain pointing to the destination