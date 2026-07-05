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
})();
