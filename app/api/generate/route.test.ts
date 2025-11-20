import { POST } from './route';

function jsonRequest(body: any): Request {
  return new Request('http://localhost/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('api/generate POST (unit)', () => {
  const realFetch = global.fetch;

  afterEach(() => {
    jest.resetAllMocks();
    global.fetch = realFetch as any;
  });

  it('400 when apiKey or url missing', async () => {
    const res = await POST(jsonRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Missing apiKey or url/i);
  });

  it('proxies upstream non-ok error with details', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('upstream boom'),
    });
    const res = await POST(jsonRequest({ apiKey: 'k', url: 'https://arxiv.org/html/2511.05375v1' }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Upstream error');
    expect(data.details).toContain('upstream boom');
  });

  it('parses JSON from Gemini candidates', async () => {
    const payload = { questions: [{ question: 'Q', options: ['A','B','C','D'], answer: 'A' }], url: 'u' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        candidates: [
          { content: { parts: [{ text: JSON.stringify(payload) }] } }
        ]
      }),
    });

    const res = await POST(jsonRequest({ apiKey: 'k', url: 'u' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.questions)).toBe(true);
    expect(data.questions.length).toBe(1);
  });

  it('returns raw when JSON parse fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        candidates: [
          { content: { parts: [{ text: 'not-json' }] } }
        ]
      }),
    });

    const res = await POST(jsonRequest({ apiKey: 'k', url: 'u' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(typeof data.raw).toBe('string');
  });
});

describe('api/generate POST (integration, optional)', () => {
  const apiKey = process.env.GOOGLE_API_KEY;

  const maybeIt = apiKey ? it : it.skip;

  maybeIt('calls Gemini and returns JSON or raw', async () => {
    const res = await POST(jsonRequest({ apiKey, url: 'https://arxiv.org/html/2511.05375v1' }));
    expect([200, 500]).toContain(res.status);
    const data = await res.json();
    if (res.status === 200) {
      expect(data.questions || data.raw).toBeDefined();
    } else {
      // upstream failure details should be present
      expect(data.error).toBeDefined();
    }
  }, 20000);
});


