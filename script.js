/* ============================================================
   IMP AI MARKETING LP - script.js
   依存ライブラリなし。以下を制御する：
   1. ヘッダーのスクロール縮小
   2. スマホメニューの開閉
   3. スクロール出現アニメーション（IntersectionObserver）
   4. FAQアコーディオンの高さアニメーション
   5. スマホ固定CTAバーの表示制御
   6. フォーム送信（ダミー）
   ============================================================ */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------
     1. ヘッダー：スクロールで縮小＋半透明ブラー
     ------------------------------------------------------------ */
  var header = document.getElementById('header');
  var onScrollHeader = function () {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ------------------------------------------------------------
     2. スマホメニュー開閉
     ------------------------------------------------------------ */
  var menuBtn = document.getElementById('menuBtn');
  var spMenu = document.getElementById('spMenu');

  menuBtn.addEventListener('click', function () {
    var isOpen = spMenu.classList.toggle('is-open');
    menuBtn.classList.toggle('is-open', isOpen);
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    menuBtn.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
  });

  // メニュー内リンクをタップしたら閉じる
  spMenu.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      spMenu.classList.remove('is-open');
      menuBtn.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  /* ------------------------------------------------------------
     3. スクロール出現アニメーション
        （reduced-motion 時は CSS 側で即時表示になる）
     ------------------------------------------------------------ */
  var reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    // 同じ親を持つ .reveal 同士は --i（連番）で時間差を付け、順に立ち上げる
    // 遅延量そのものは CSS変数 --stagger で一元調整できる
    var groups = new Map();
    reveals.forEach(function (el) {
      var parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, 0);
      var index = groups.get(parent);
      el.style.setProperty('--i', index);
      groups.set(parent, index + 1);
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target); // 一度出た要素は再度隠さない
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ------------------------------------------------------------
     4. FAQアコーディオン：max-height で滑らかに開閉
     ------------------------------------------------------------ */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var summary = item.querySelector('summary');
    var body = item.querySelector('.faq-item__body');
    var animating = false;

    summary.addEventListener('click', function (e) {
      e.preventDefault();
      if (animating) return; // 連打ガード

      if (prefersReducedMotion) {
        // アニメーションなしで即時開閉
        item.open = !item.open;
        body.style.maxHeight = item.open ? 'none' : '';
        return;
      }

      animating = true;

      if (item.open) {
        // 閉じる：現在の高さ→0 へ遷移させてから open を外す
        body.style.maxHeight = body.scrollHeight + 'px';
        requestAnimationFrame(function () {
          body.style.maxHeight = '0px';
        });
        body.addEventListener('transitionend', function onEnd() {
          item.open = false;
          body.style.maxHeight = '';
          body.removeEventListener('transitionend', onEnd);
          animating = false;
        });
      } else {
        // 開く：open を付けてから 0→scrollHeight へ遷移。
        // 遷移完了後は max-height を解除し、リサイズ時のクリップを防ぐ
        item.open = true;
        body.style.maxHeight = '0px';
        requestAnimationFrame(function () {
          body.style.maxHeight = body.scrollHeight + 'px';
        });
        body.addEventListener('transitionend', function onEnd() {
          body.style.maxHeight = 'none';
          body.removeEventListener('transitionend', onEnd);
          animating = false;
        });
      }
    });
  });

  /* ------------------------------------------------------------
     5. スマホ固定CTAバー：ヒーローを過ぎたら表示、
        フォーム到達で非表示（CTAの重複を避ける）
     ------------------------------------------------------------ */
  var ctaBar = document.getElementById('spCtaBar');
  var hero = document.getElementById('hero');
  var contact = document.getElementById('contact');

  var updateCtaBar = function () {
    var heroBottom = hero.getBoundingClientRect().bottom;
    var contactTop = contact.getBoundingClientRect().top;
    var show = heroBottom < 0 && contactTop > window.innerHeight * 0.5;
    ctaBar.classList.toggle('is-visible', show);
  };
  window.addEventListener('scroll', updateCtaBar, { passive: true });
  updateCtaBar();

  /* ------------------------------------------------------------
     6. フォーム送信（ダミー）
        TODO: 要確認（実際の送信先が決まったらこのハンドラを削除し、
        form の action にエンドポイントを設定する）
     ------------------------------------------------------------ */
  var form = document.getElementById('contactForm');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    alert('デモ用フォームです。送信先（action）が設定されると実際に送信されます。');
  });

  /* コピーライト年の自動更新 */
  var yearEl = document.getElementById('copyYear');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------
     8. スクロールプログレスバー
        ページ読了率を最上部の極細グラデバーで表示（rAFで間引き）
     ------------------------------------------------------------ */
  var progressBar = document.getElementById('scrollProgress');
  var progressTicking = false;
  var updateProgress = function () {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    progressBar.style.transform = 'scaleX(' + p + ')';
    progressTicking = false;
  };
  window.addEventListener('scroll', function () {
    if (!progressTicking) {
      progressTicking = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  updateProgress();

  /* ------------------------------------------------------------
     9. グローバルナビの現在地ハイライト
        表示中のセクションに対応するリンクへ .is-active を付与
     ------------------------------------------------------------ */
  var navLinks = document.querySelectorAll('.gnav__list a[href^="#"]');
  if ('IntersectionObserver' in window && navLinks.length) {
    var linkById = {};
    navLinks.forEach(function (a) { linkById[a.getAttribute('href').slice(1)] = a; });
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.remove('is-active'); });
          var link = linkById[entry.target.id];
          if (link) link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px' }); // 画面中央帯に入ったセクションを現在地とみなす
    Object.keys(linkById).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) navIo.observe(section);
    });
  }

  /* ------------------------------------------------------------
     10. CTAボタンのマグネティック効果
         カーソルに応じてわずかに引き寄せられる（PC・ファインポインタのみ）
         最大移動量は CSS変数 --magnet-range で調整
     ------------------------------------------------------------ */
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canHover && !prefersReducedMotion) {
    var magnetRange = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--magnet-range')
    ) || 8;
    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
      var rafId = null;
      btn.addEventListener('mousemove', function (e) {
        if (rafId) return;
        rafId = requestAnimationFrame(function () {
          var r = btn.getBoundingClientRect();
          var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
          var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
          btn.classList.add('is-magnet');
          btn.style.transform =
            'translate(' + (dx * magnetRange).toFixed(1) + 'px,' + (dy * magnetRange).toFixed(1) + 'px)';
          rafId = null;
        });
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
        btn.classList.remove('is-magnet');
      });
    });
  }

  /* ------------------------------------------------------------
     11. ヒーロー背景オーロラの視差
         マウス位置を -0.5〜0.5 に正規化して --mx/--my へ（強度はCSS側）
     ------------------------------------------------------------ */
  var heroBg = document.querySelector('.hero__bg');
  if (heroBg && canHover && !prefersReducedMotion) {
    var heroEl = document.getElementById('hero');
    var parallaxRaf = null;
    heroEl.addEventListener('mousemove', function (e) {
      if (parallaxRaf) return;
      parallaxRaf = requestAnimationFrame(function () {
        heroBg.style.setProperty('--mx', (e.clientX / window.innerWidth - 0.5).toFixed(3));
        heroBg.style.setProperty('--my', (e.clientY / window.innerHeight - 0.5).toFixed(3));
        parallaxRaf = null;
      });
    });
    heroEl.addEventListener('mouseleave', function () {
      heroBg.style.setProperty('--mx', 0);
      heroBg.style.setProperty('--my', 0);
    });
  }

  /* ------------------------------------------------------------
     12. 数値のカウントアップ（汎用）
         <span data-countup="8">8</span> のように使う。
         接頭・接尾の文字はHTML側に置き、数値だけを属性に入れる。
         実績数字が確定したら data-countup を振るだけで有効になる
     ------------------------------------------------------------ */
  var counters = document.querySelectorAll('[data-countup]');
  if (counters.length) {
    var runCount = function (el) {
      var target = parseFloat(el.getAttribute('data-countup'));
      if (isNaN(target)) return;
      // 桁区切り（9,800 のようなカンマ）を保って表示する
      var fmt = function (n) { return Math.round(n).toLocaleString('ja-JP'); };
      if (prefersReducedMotion) { el.textContent = fmt(target); return; }
      var start = null;
      var dur = 900;
      var step = function (ts) {
        if (!start) start = ts;
        var t = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        el.textContent = fmt(target * eased);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      var countIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCount(entry.target);
            countIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { countIo.observe(el); });
    } else {
      counters.forEach(function (el) { runCount(el); });
    }
  }

  /* ------------------------------------------------------------
     13. ブランドムービー制御
         - 画面外では自動停止（省電力・パフォーマンス）
         - 右下ボタンで音声ON/OFF
         - reduced-motion 時は自動再生せずネイティブコントロールを表示
     ------------------------------------------------------------ */
  var brandMovie = document.getElementById('brandMovie');
  if (brandMovie) {
    var movieSound = document.getElementById('movieSound');

    if (prefersReducedMotion) {
      brandMovie.removeAttribute('autoplay');
      brandMovie.pause();
      brandMovie.controls = true;
      if (movieSound) movieSound.hidden = true;
    } else {
      // 画面内に入ったら再生、外れたら停止
      if ('IntersectionObserver' in window) {
        var movieIo = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              brandMovie.play().catch(function () { /* 自動再生がブロックされても静かに続行 */ });
            } else {
              brandMovie.pause();
            }
          });
        }, { threshold: 0.25 });
        movieIo.observe(brandMovie);
      }
      // 音声トグル
      movieSound.addEventListener('click', function () {
        brandMovie.muted = !brandMovie.muted;
        var on = !brandMovie.muted;
        movieSound.setAttribute('aria-pressed', String(on));
        movieSound.setAttribute('aria-label', on ? '音声をオフにする' : '音声をオンにする');
      });
    }
  }

  /* ------------------------------------------------------------
     14. HOW改善ループの循環演出の起動
         セクション進入で .is-live を付与 → 発光がSTEP1→2→3と巡回
     ------------------------------------------------------------ */
  var howSteps = document.querySelector('#how .how-steps');
  if (howSteps && 'IntersectionObserver' in window && !prefersReducedMotion) {
    var howIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          howSteps.classList.add('is-live');
          howIo.unobserve(howSteps);
        }
      });
    }, { threshold: 0.3 });
    howIo.observe(howSteps);
  }

  /* ------------------------------------------------------------
     7. チャットボット（ルールベースの自動応答デモ）
        TODO: 要確認（本番のAIチャットボットに差し替える場合は
        このブロックを置き換える）
     ------------------------------------------------------------ */
  var chatbot = document.getElementById('chatbot');
  var chatLauncher = document.getElementById('chatLauncher');
  var chatPanel = document.getElementById('chatPanel');
  var chatClose = document.getElementById('chatClose');
  var chatLog = document.getElementById('chatLog');
  var chatQuick = document.getElementById('chatQuick');
  var chatForm = document.getElementById('chatForm');
  var chatInput = document.getElementById('chatInput');

  // よくある質問（クイックリプライ）
  var quickReplies = [
    '料金プランは？',
    'LLMOって何？',
    '公開までの流れは？',
    '無料相談したい'
  ];

  // キーワード → 応答のルール表。上から順に評価する
  var chatRules = [
    {
      pattern: /料金|価格|費用|いくら|プラン|予算/,
      reply: 'STARTER / GROWTH / FULL PACKAGE の3プランをご用意しています。ページ数や対応範囲によって変わるため、正式なお見積りは無料相談にてご案内します。<a href="#pricing">料金プランを見る</a>'
    },
    {
      pattern: /LLMO|生成AI|ChatGPT|チャットGPT|AI検索|AI最適化/i,
      reply: 'LLMOは、ChatGPTなどの生成AIの回答に自社が「引用・推薦されやすくする」ための最適化です。SEOと地続きの施策で、当社では両方をまとめて設計します。<a href="#llmo">LLMO特集を見る</a>'
    },
    {
      pattern: /SEO|検索|上位|集客/i,
      reply: '検索から“買う気のある人”を継続的に集めるための内部・外部SEO対策を行っています。プレスリリース配信による被リンク獲得と組み合わせて、集客の土台づくりを目指せます。<a href="#what">サービス一覧を見る</a>'
    },
    {
      pattern: /多言語|英語|中国語|翻訳|インバウンド|海外/,
      reply: '自動翻訳＋現地最適化による多言語対応が可能です。対応言語の詳細は無料相談時にご確認ください。<a href="#contact">無料相談はこちら</a>'
    },
    {
      pattern: /チャットボット|自動応答|ボット/,
      reply: 'まさに今ご利用いただいているようなAIチャットボットを、御社のサイトにも搭載できます。24時間の自動一次対応で、営業時間外の見込み客の取りこぼし防止を目指せます。'
    },
    {
      pattern: /GA4|Clarity|クラリティ|解析|ヒートマップ|分析|改善/i,
      reply: 'GA4とMicrosoft Clarityでデータを計測し、AIが改善案をご提案。お客様が承認したものだけを実装する「承認制の改善ループ」を毎月運用します。<a href="#how">仕組みを見る</a>'
    },
    {
      pattern: /納期|期間|どのくらい|何日|何週間|いつ|スケジュール|流れ|進め方|プロセス/,
      reply: '無料相談→戦略設計→制作→公開→AI改善運用の5ステップで進みます。期間は規模・内容により変動しますので、詳しいスケジュールは無料相談でご案内します。<a href="#process">制作の流れを見る</a>'
    },
    {
      pattern: /相談|問い合わせ|申し込み|連絡|話を聞き|依頼|お願いしたい/,
      reply: 'ありがとうございます！ページ下部のフォームから無料相談をお申し込みいただけます。オンラインで完結し、しつこい営業はいたしません。<a href="#contact">無料相談フォームへ</a>'
    },
    {
      pattern: /契約|解約|期間の縛り|縛り/,
      reply: '最低契約期間などの契約条件はプランにより異なります。詳細は無料相談時にご案内しますので、お気軽にお問い合わせください。<a href="#faq">よくある質問を見る</a>'
    },
    {
      pattern: /こんにちは|こんばんは|おはよう|はじめまして|やあ|ハロー|hello|hi/i,
      reply: 'こんにちは！IMP AIアシスタントです。サービス内容・料金・進め方など、お気軽にご質問ください。'
    },
    {
      pattern: /ありがとう|サンキュー|助かり/,
      reply: 'こちらこそありがとうございます！他にもご不明な点があればいつでもどうぞ。じっくり検討されたい場合は<a href="#contact">無料相談</a>もご利用ください。'
    }
  ];

  var fallbackReply = 'すみません、うまくお答えできませんでした。よろしければ下の候補からお選びいただくか、<a href="#contact">無料相談フォーム</a>から直接ご質問ください。';

  // メッセージをログに追加して最下部へスクロール
  function addMessage(text, who) {
    var msg = document.createElement('div');
    msg.className = 'chat-msg chat-msg--' + who;
    if (who === 'bot') {
      msg.innerHTML = text; // 応答はルール表内の固定文字列のみ（ユーザー入力は流し込まない）
    } else {
      msg.textContent = text;
    }
    chatLog.appendChild(msg);
    chatLog.scrollTop = chatLog.scrollHeight;
    return msg;
  }

  // クイックリプライを描画
  function renderQuickReplies() {
    chatQuick.innerHTML = '';
    quickReplies.forEach(function (label) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.addEventListener('click', function () { handleUserInput(label); });
      chatQuick.appendChild(b);
    });
  }

  // 入力に対する応答を返す
  function getReply(text) {
    for (var i = 0; i < chatRules.length; i++) {
      if (chatRules[i].pattern.test(text)) return chatRules[i].reply;
    }
    return fallbackReply;
  }

  var botBusy = false;

  function handleUserInput(text) {
    text = text.trim();
    if (!text || botBusy) return;

    addMessage(text, 'user');
    chatQuick.innerHTML = '';
    botBusy = true;

    var reply = getReply(text);

    if (prefersReducedMotion) {
      addMessage(reply, 'bot');
      renderQuickReplies();
      botBusy = false;
      return;
    }

    // 入力中インジケーターを見せてから応答（自然な間）
    var typing = document.createElement('div');
    typing.className = 'chat-msg chat-msg--bot chat-msg--typing';
    typing.innerHTML = '<i></i><i></i><i></i>';
    chatLog.appendChild(typing);
    chatLog.scrollTop = chatLog.scrollHeight;

    setTimeout(function () {
      typing.remove();
      addMessage(reply, 'bot');
      renderQuickReplies();
      botBusy = false;
    }, 700);
  }

  function openChat() {
    chatPanel.hidden = false;
    chatbot.classList.add('is-open');
    chatLauncher.setAttribute('aria-expanded', 'true');
    // 初回だけウェルカムメッセージ
    if (!chatLog.hasChildNodes()) {
      addMessage('こんにちは！IMP AIアシスタントです。<br>サービス・料金・進め方など、なんでもご質問ください。', 'bot');
      renderQuickReplies();
    }
    chatInput.focus();
  }

  function closeChat() {
    chatPanel.hidden = true;
    chatbot.classList.remove('is-open');
    chatLauncher.setAttribute('aria-expanded', 'false');
    chatLauncher.focus();
  }

  chatLauncher.addEventListener('click', openChat);
  chatClose.addEventListener('click', closeChat);

  // Escで閉じる
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !chatPanel.hidden) closeChat();
  });

  // ボット返信内のアンカーをタップしたらパネルを閉じてスクロール
  chatLog.addEventListener('click', function (e) {
    if (e.target.closest('a[href^="#"]')) closeChat();
  });

  chatForm.addEventListener('submit', function (e) {
    e.preventDefault();
    handleUserInput(chatInput.value);
    chatInput.value = '';
  });
})();
