Deno.serve(async (request) => {
  const url = new URL(request.url);
  url.hostname = 'api.telegram.org';
  url.protocol = 'https:';

  return fetch(
    new Request(url.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? null : request.body,
      redirect: 'follow'
    })
  );
});
