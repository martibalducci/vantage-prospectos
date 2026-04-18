export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { ciudad, cantidad } = req.body;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Generá una lista de ${cantidad} cafeterías o bares reales e independientes en ${ciudad}. Para cada uno devolvé un objeto JSON con estos campos exactos: nombre_negocio, nombre_dueno (si es conocido, sino string vacío), ciudad, barrio, link_instagram (formato @handle, si no lo sabés dejalo vacío), detalle_especifico (una observación concreta y real del negocio: producto conocido, estilo del local, reseña típica — NUNCA genérico). Devolvé SOLO un array JSON válido, sin texto adicional, sin markdown, sin explicaciones.`
      }]
    })
  });

  const data = await response.json();
  const text = data.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const leads = JSON.parse(text);

await fetch('https://script.google.com/macros/s/AKfycbxwSPv1xzR_uganOiaHqVj3TYaaDsotbZz-Mveb-58Pgd4Wop-urQ0P6Yh3nqd-1brN9w/exec', {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      sheetId: '1V6SYNosU95M8I7L85WJYwlCmnpyAy5nQvFZoZvCcvoI',
      leads
    })
  });

  res.status(200).json({ leads });
}
