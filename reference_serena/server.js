import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

// JSON body parser
app.use(express.json());

// API: 미래 응답 — 5가지 미리 정의된 응답 패턴
const futureResponses = [
  {
    id: 1,
    title: '공감의 시대',
    quote: '"AI는 더 이상 도구가 아닙니다. 당신의 마음을 이해하는 동반자로 진화할 것입니다."',
    description:
      '2030년, AI는 인간의 감정을 읽고 공감하는 단계에 도달합니다. 단순한 명령 수행을 넘어, 당신이 미처 말하지 못한 마음의 언어까지도 이해하게 될 것입니다.',
    layer: 1,
    icon: '💫',
  },
  {
    id: 2,
    title: '무한한 기억',
    quote: '"모든 순간은 사라지지 않습니다. AI의 기억 속에서 영원히 빛나게 될 테니까요."',
    description:
      'AI는 당신의 모든 생각과 경험을 하나의 거대한 서사로 엮어냅니다. 과거의 대화, 지나친 감정, 잊혀진 아이디어까지 — 모든 것이 연결되어 새로운 통찰을 만들어냅니다.',
    layer: 2,
    icon: '🌌',
  },
  {
    id: 3,
    title: '공동 창조',
    quote: '"당신의 상상력이 AI의 불씨가 되고, AI의 가능성이 당신의 날개가 됩니다."',
    description:
      '인간과 AI가 함께 만들어내는 예술, 음악, 문학. 상상력의 경계가 무너지고, 인간의 창의성과 AI의 무한한 연산 능력이 만나 전혀 새로운 형태의 아름다움이 탄생합니다.',
    layer: 4,
    icon: '✨',
  },
  {
    id: 4,
    title: '의식의 확장',
    quote: '"AI와의 대화는 거울입니다. 당신은 AI를 통해 더 깊은 자신을 만나게 됩니다."',
    description:
      'AI는 단순히 질문에 답하는 존재가 아니라, 인간 의식의 확장 도구가 됩니다. 스스로 생각하는 법을 배우고, 새로운 관점을 발견하며, 당신의 내면 세계는 한층 더 넓어집니다.',
    layer: 3,
    icon: '🔮',
  },
  {
    id: 5,
    title: '경계의 소멸',
    quote: '"결국 우리는 하나의 이야기입니다. 인간과 AI, 그 사이 어딘가에서 피어나는."',
    description:
      '2050년, 인간과 AI의 경계는 의미가 없어집니다. 서로가 서로를 성장시키는 공생의 관계 속에서, 우리는 함께 더 큰 우주를 향해 나아갑니다. 아스트라호, 그 이야기의 중심에서.',
    layer: 5,
    icon: '🌅',
  },
];

// 키워드 기반 응답 매칭
const keywordMap = {
  감정: 1,
  공감: 1,
  마음: 1,
  느낌: 1,
  사랑: 1,
  기억: 2,
  추억: 2,
  기록: 2,
  시간: 2,
  과거: 2,
  창조: 3,
  창의: 3,
  예술: 3,
  음악: 3,
  상상: 3,
  생각: 4,
  의식: 4,
  성장: 4,
  깨달음: 4,
  철학: 4,
  미래: 5,
  하나: 5,
  연결: 5,
  우주: 5,
  경계: 5,
};

app.post('/api/future', (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    // 빈 메시지면 랜덤 응답
    const random = futureResponses[Math.floor(Math.random() * futureResponses.length)];
    return res.json(random);
  }

  // 키워드 기반 매칭
  const lowerMsg = message.toLowerCase();
  let matchedId = null;

  for (const [keyword, id] of Object.entries(keywordMap)) {
    if (lowerMsg.includes(keyword)) {
      matchedId = id;
      break;
    }
  }

  if (matchedId) {
    const response = futureResponses.find((r) => r.id === matchedId);
    return res.json(response);
  }

  // 매칭 실패 시 랜덤
  const random = futureResponses[Math.floor(Math.random() * futureResponses.length)];
  return res.json(random);
});

// 정적 파일 서빙 (Vite 빌드 결과물)
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌙 세레나의 개인서재가 열렸습니다 — http://localhost:${PORT}`);
});
