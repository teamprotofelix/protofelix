# images/ — 신규 이미지 배치 안내

개편된 사이트가 참조하는 이미지 파일을 이 폴더에 넣어 주세요.
생성 프롬프트(A~E)의 산출물을 아래 파일명으로 저장하면 모든 페이지에서 자동으로 적용됩니다.

| 생성 프롬프트 | 저장 위치 | 권장 해상도·포맷 | 사용처 |
|---|---|---|---|
| A — 메인 Hero | `images/hero-beyond.webp` | 2560×1080 이상, WebP/AVIF | 메인 Hero 배경, OG 공유 이미지 |
| B — AstraHo 카드 | `images/astraho-ark.webp` | 1600×900, WebP (~250KB 목표) | 메인 카드 + AstraHo Hero 배경 |
| C — Lulu Research 카드 | `images/lulu-neuro-symbolic.webp` | 1600×900, WebP | 메인 카드, Lulu OG 이미지 |
| D — Serena Creative Lab 카드 | `images/serena-library.webp` | 1600×900, WebP | 메인 카드 + Serena 공동 창작 배너 + AstraHo 시설 카드 |
| E — LayerAI Center 개념 이미지 | `images/layerai-stack.webp` | 1600×900, WebP | 메인 카드 + LayerAI Center Hero 배경 + AstraHo 시설 카드 |

## 주의사항

- 파일명은 **대소문자까지 정확히** 일치해야 합니다 (GitHub Pages는 대소문자를 구분합니다).
- 이미지가 아직 없으면 기존 이미지(`chaossouplogo.jpg`, `astraho_bg.jpg`, `layerlogo.jpg` 등)로 자동 대체(fallback)되므로 사이트가 깨지지는 않습니다.
- 이미지가 들어간 후 브라우저 캐시 때문에 안 보이면 `Ctrl+F5`로 강력 새로고침하세요.
- 모든 이미지는 `AI-generated visual` 또는 제작 방식 표기가 적용되어 있습니다(대체 텍스트·푸터 표기).
