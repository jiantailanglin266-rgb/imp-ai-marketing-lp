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
    // 同じ親を持つ .reveal 同士は少しずつ遅らせて「流れる」出現にする
    var groups = new Map();
    reveals.forEach(function (el) {
      var parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, 0);
      var index = groups.get(parent);
      el.style.setProperty('--delay', Math.min(index * 0.09, 0.45) + 's');
      groups.set(parent, index + 1);
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

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
