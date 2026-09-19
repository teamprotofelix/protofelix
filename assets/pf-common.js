/* ============================================================
   Protofelix × AstraHo — 확장 탐험 공통 모듈 (pf-common.js)
   - NotebookStore: IndexedDB(로컬) 저장, 실패 시 메모리+localStorage 폴백
   - Markdown/JSON 내보내기·가져오기(버전 확인·중복 병합)
   - 라벨 배지, 시드 난수, 토스트
   저장 위치: "이 브라우저" — 서버 전송 없음.
   ============================================================ */
(function () {
    'use strict';

    var SCHEMA_VERSION = 1;
    var DB_NAME = 'pf-notebook';
    var STORE_NAME = 'notes';
    var LS_KEY = 'pf-notebook-fallback-v1';

    /* ---------- 라벨 ---------- */
    var KB_LABELS = {
        established: ['Established', '확립된 지식'],
        research: ['Research', '연구'],
        hypothesis: ['Hypothesis', '가설'],
        philosophy: ['Philosophy', '철학'],
        fiction: ['Fiction', '허구'],
        unknown: ['Unknown', '미지']
    };
    var MODE_LABELS = {
        curated: ['CURATED', '편집 큐레이션'],
        rule_based: ['RULE_BASED', '규칙 기반 계산'],
        user_authored: ['USER_AUTHORED', '사용자 작성'],
        local_model: ['LOCAL_MODEL', '기기 내 모델'],
        live_api: ['LIVE_API', '실시간 API']
    };

    function kbBadge(status) {
        var meta = KB_LABELS[status] || KB_LABELS.unknown;
        return '<span class="pf-badge ks-' + status + '" title="지식 상태: ' + meta[1] + '">' + meta[0] + '</span>';
    }
    function modeBadge(mode) {
        var meta = MODE_LABELS[mode] || MODE_LABELS.curated;
        return '<span class="pf-badge mode-' + mode + '" title="실행 모드: ' + meta[1] + '">' + meta[0] + '</span>';
    }
    function pjBadge(status) {
        var names = { vision: 'VISION', concept: 'CONCEPT', prototype: 'PROTOTYPE', measured: 'MEASURED', narrative: 'NARRATIVE' };
        return '<span class="pf-badge pj-' + status + '">' + (names[status] || status) + '</span>';
    }

    /* ---------- 유틸 ---------- */
    function toast(msg) {
        var el = document.getElementById('pf-toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'pf-toast';
            el.setAttribute('role', 'status');
            document.body.appendChild(el);
        }
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(toast._t);
        toast._t = setTimeout(function () { el.classList.remove('show'); }, 2600);
    }

    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function fmtDate(d) {
        d = d || new Date();
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
            ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }
    function uid() {
        return 'pf-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    }

    /* 시드 난수 (mulberry32) — 같은 시드는 같은 결과 */
    function mulberry32(seed) {
        var a = seed >>> 0;
        return function () {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            var t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function download(filename, text, mime) {
        var blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 800);
    }

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    /* CSV 수식 주입 방어 */
    function csvSafe(v) {
        v = String(v == null ? '' : v);
        if (/^[=+\-@]/.test(v)) v = "'" + v;
        return '"' + v.replace(/"/g, '""') + '"';
    }

    /* ---------- NotebookStore ---------- */
    var db = null;
    var fallback = null;

    function loadFallback() {
        try {
            var raw = localStorage.getItem(LS_KEY);
            var arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr : [];
        } catch (e) { return []; }
    }
    function saveFallback(arr) {
        try { localStorage.setItem(LS_KEY, JSON.stringify(arr)); } catch (e) { /* 저장 불가 */ }
    }

    function openDB() {
        return new Promise(function (resolve) {
            if (db) return resolve(db);
            if (!('indexedDB' in window)) return resolve(null);
            var req;
            try { req = indexedDB.open(DB_NAME, SCHEMA_VERSION); }
            catch (e) { return resolve(null); }
            req.onupgradeneeded = function () {
                var d = req.result;
                if (!d.objectStoreNames.contains(STORE_NAME)) {
                    d.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
            req.onsuccess = function () { db = req.result; resolve(db); };
            req.onerror = function () { resolve(null); };
            req.onblocked = function () { resolve(null); };
        });
    }

    function tx(storeName, mode, fn) {
        return new Promise(function (resolve, reject) {
            if (!db) return reject(new Error('no-db'));
            var t;
            try { t = db.transaction(storeName, mode); } catch (e) { return reject(e); }
            var s = t.objectStore(storeName);
            var out = fn(s);
            t.oncomplete = function () { resolve(out && 'result' in out ? out.result : undefined); };
            t.onerror = function () { reject(t.error); };
            t.onabort = function () { reject(t.error || new Error('abort')); };
        });
    }

    var notebook = {
        storageLabel: '이 브라우저 (IndexedDB)',
        /* 노트 추가·갱신 */
        add: function (note) {
            var item = Object.assign({
                id: uid(),
                type: 'note',        // bookmark | note | question | brief | experiment | route | source
                title: '',
                body: '',
                tags: [],
                page: location.pathname.split('/').filter(Boolean).slice(-1)[0] || 'home',
                schemaVersion: SCHEMA_VERSION,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }, note || {});
            item.updatedAt = new Date().toISOString();
            if (!item.title) item.title = (item.body || '').slice(0, 60) || '(제목 없음)';
            return openDB().then(function (d) {
                if (d) {
                    return tx(STORE_NAME, 'readwrite', function (s) {
                        s.put(item);
                        return { ok: true, id: item.id };
                    }).then(function () { return { ok: true, id: item.id }; });
                }
                fallback = loadFallback();
                var i = fallback.findIndex(function (n) { return n.id === item.id; });
                if (i >= 0) fallback[i] = item; else fallback.push(item);
                saveFallback(fallback);
                return Promise.resolve({ ok: true, id: item.id });
            });
        },
        list: function () {
            return openDB().then(function (d) {
                if (d) {
                    return tx(STORE_NAME, 'readonly', function (s) {
                        var req = s.getAll();
                        req.onsuccess = function () { };
                        return req;
                    }).then(function (arr) {
                        return (arr || []).sort(function (a, b) {
                            return (b.updatedAt || '').localeCompare(a.updatedAt || '');
                        });
                    });
                }
                return loadFallback().sort(function (a, b) {
                    return (b.updatedAt || '').localeCompare(a.updatedAt || '');
                });
            });
        },
        remove: function (id) {
            return openDB().then(function (d) {
                if (d) {
                    return tx(STORE_NAME, 'readwrite', function (s) { s.delete(id); });
                }
                fallback = loadFallback().filter(function (n) { return n.id !== id; });
                saveFallback(fallback);
                return Promise.resolve();
            });
        },
        clear: function () {
            return openDB().then(function (d) {
                if (d) {
                    return tx(STORE_NAME, 'readwrite', function (s) { s.clear(); });
                }
                fallback = [];
                saveFallback(fallback);
                return Promise.resolve();
            });
        },
        count: function () { return notebook.list().then(function (arr) { return arr.length; }); }
    };

    /* ---------- 내보내기/가져오기 ---------- */
    var TYPE_NAMES = {
        bookmark: '북마크', note: '노트', question: '질문', brief: '브리프',
        experiment: '실험', route: '항로', source: '출처'
    };

    function notesToMarkdown(notes) {
        var lines = ['# 나의 탐구 노트북 — Protofelix × AstraHo', '',
            '내보낸 시각: ' + fmtDate(new Date()), '항목 수: ' + notes.length, ''];
        notes.forEach(function (n) {
            lines.push('## ' + (n.title || '(제목 없음)'));
            lines.push('');
            lines.push('- 유형: ' + (TYPE_NAMES[n.type] || n.type) + ' | 페이지: ' + n.page + ' | 갱신: ' + fmtDate(new Date(n.updatedAt)));
            if (n.tags && n.tags.length) lines.push('- 태그: ' + n.tags.map(function (t) { return '#' + t; }).join(' '));
            lines.push('');
            lines.push(String(n.body || ''));
            lines.push('');
            lines.push('---');
            lines.push('');
        });
        return lines.join('\n');
    }

    function exportMarkdown() {
        return notebook.list().then(function (notes) {
            if (!notes.length) { toast('노트북이 비어 있습니다.'); return null; }
            var d = new Date();
            var name = 'pf-notebook-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '.md';
            download(name, notesToMarkdown(notes), 'text/markdown;charset=utf-8');
            toast('Markdown으로 내보냈습니다: ' + name);
            return name;
        });
    }

    function exportJSON() {
        return notebook.list().then(function (notes) {
            if (!notes.length) { toast('노트북이 비어 있습니다.'); return null; }
            var payload = { schema: 'pf-notebook', schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), items: notes };
            var d = new Date();
            var name = 'pf-notebook-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '.json';
            download(name, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
            toast('JSON으로 내보냈습니다: ' + name);
            return name;
        });
    }

    /* 가져오기: 버전 확인 → 항목 검증 → id 기준 중복 병합(갱신일 최신 유지) */
    function importJSON(text) {
        return Promise.resolve().then(function () {
            var data;
            try { data = JSON.parse(text); }
            catch (e) { throw new Error('JSON 형식이 올바르지 않습니다.'); }
            if (!data || !Array.isArray(data.items)) {
                throw new Error('노트북 JSON 스키마가 아닙니다. 내보내기 파일을 사용해 주세요.');
            }
            var MAX_ITEMS = 2000;
            var MAX_LEN = 100000;
            if (data.items.length > MAX_ITEMS) throw new Error('항목 수가 너무 많습니다(최대 ' + MAX_ITEMS + ').');
            var valid = [];
            var skipped = 0;
            data.items.forEach(function (it) {
                if (!it || typeof it !== 'object') { skipped++; return; }
                if (!it.id || typeof it.id !== 'string') { skipped++; return; }
                if (typeof it.title !== 'string' && typeof it.body !== 'string') { skipped++; return; }
                if (JSON.stringify(it).length > MAX_LEN) { skipped++; return; }
                valid.push({
                    id: String(it.id).slice(0, 80),
                    type: TYPE_NAMES[it.type] ? it.type : 'note',
                    title: String(it.title || '').slice(0, 500),
                    body: String(it.body || '').slice(0, 50000),
                    tags: Array.isArray(it.tags) ? it.tags.map(String).slice(0, 20) : [],
                    page: String(it.page || 'import'),
                    schemaVersion: SCHEMA_VERSION,
                    createdAt: it.createdAt || new Date().toISOString(),
                    updatedAt: it.updatedAt || new Date().toISOString()
                });
            });
            return notebook.list().then(function (existing) {
                var byId = {};
                existing.forEach(function (n) { byId[n.id] = n; });
                var added = 0, merged = 0;
                var queue = Promise.resolve();
                valid.forEach(function (it) {
                    var old = byId[it.id];
                    if (!old) { added++; queue = queue.then(function () { return notebook.add(it); }); }
                    else if ((old.updatedAt || '') < (it.updatedAt || '')) {
                        merged++;
                        queue = queue.then(function () { return notebook.add(Object.assign({}, old, it, { id: old.id, createdAt: old.createdAt })); });
                    } else { skipped++; }
                });
                return queue.then(function () {
                    return { added: added, merged: merged, skipped: skipped, total: valid.length };
                });
            });
        });
    }

    /* ---------- 공개 ---------- */
    window.PF = {
        kbBadge: kbBadge,
        modeBadge: modeBadge,
        pjBadge: pjBadge,
        KB_LABELS: KB_LABELS,
        MODE_LABELS: MODE_LABELS,
        toast: toast,
        fmtDate: fmtDate,
        uid: uid,
        mulberry32: mulberry32,
        download: download,
        esc: esc,
        csvSafe: csvSafe,
        notebook: notebook,
        exportMarkdown: exportMarkdown,
        exportJSON: exportJSON,
        importJSON: importJSON,
        notesToMarkdown: notesToMarkdown
    };
})();
