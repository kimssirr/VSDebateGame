const BASE_URL = import.meta.env.PROD
  ? 'https://vsdebategame.onrender.com'
  : '';

export async function callGrok(prompt) {
  try {
    const response = await fetch(`${BASE_URL}/api/grok`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`서버 오류: ${response.status}`);
    }

    const data = await response.json();
    console.log('Grok 응답:', data);  // 응답 확인
    return data.result || '';
  } catch (error) {
    console.error('Grok API 호출 실패:', error);
    return '';
  }
}
