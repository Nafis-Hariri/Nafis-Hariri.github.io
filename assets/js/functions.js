// Portfolio section navigation, touch gestures, work slider and form helpers.
// Hammer.js is intentionally NOT used anymore: touch handling relies on passive
// native listeners so vertical scrolling inside a section is never blocked on phones.

$(document).ready(function () {

  // Breakpoint where the side navigation is hidden and the compact mobile nav shows.
  var COMPACT_MAX = 1180;

  // Throttle flag shared by wheel / keyboard / touch section transitions.
  var canScroll = true,
      scrollController = null;

  // Detected once: passive listener support (avoids scroll-blocking warnings).
  var supportsPassive = false;
  try {
    var passiveTest = Object.defineProperty({}, 'passive', {
      get: function () {
        supportsPassive = true;
        return true;
      }
    });
    window.addEventListener('passive-test', null, passiveTest);
    window.removeEventListener('passive-test', null, passiveTest);
  } catch (err) {
    supportsPassive = false;
  }

  /* ------------------------------------------------------------------ helpers */

  function menuIsOpen() {
    return $('.outer-nav').hasClass('is-vis');
  }

  function isCompactViewport() {
    return window.innerWidth <= COMPACT_MAX;
  }

  // The <li class="l-section"> which is currently on screen.
  function activeSectionElement() {
    var el = $('.main-content').children('.section--is-active').get(0);
    return el || $('.main-content').children().get(0) || null;
  }

  // True when the section holds more content than the viewport can show.
  function isSectionScrollable(el) {
    return !!el && (el.scrollHeight - el.clientHeight) > 4;
  }

  // Boundary check: can the section still be scrolled in this direction?
  // direction  1 = finger/wheel moves down  (content scrolls up)
  // direction -1 = finger/wheel moves up
  function canScrollInside(el, direction) {
    if (!isSectionScrollable(el)) {
      return false;
    }
    if (direction > 0) {
      return (el.scrollTop + el.clientHeight) < (el.scrollHeight - 2);
    }
    return el.scrollTop > 2;
  }

  // Every section returns to its own top when navigation happens.
  function resetSectionScroll() {
    $('.main-content').children().each(function () {
      this.scrollTop = 0;
    });
  }

  // Inputs must never lose their caret because of a section transition.
  function isFormField(el) {
    if (!el || !el.tagName) {
      return false;
    }
    var tag = el.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' ||
           tag === 'button' || el.isContentEditable === true;
  }

  // Taps on links / form controls should not be turned into a swipe transition.
  function isInteractiveTarget(el) {
    if (isFormField(el)) {
      return true;
    }
    return !!$(el).closest('a').length;
  }

  function currentPosition() {
    var $active = $('.side-nav').find('.is-active');
    var pos = $('.side-nav').children().index($active);
    return pos < 0 ? 0 : pos;
  }

  function lastPosition() {
    return $('.side-nav').children().length - 1;
  }

  /* --------------------------------------------------------- navigation core */

  function updateNavs(nextPos) {

    $('.side-nav, .outer-nav').children().removeClass('is-active');
    $('.side-nav').children().eq(nextPos).addClass('is-active');
    $('.outer-nav').children().eq(nextPos).addClass('is-active');

  }

  function updateContent(curPos, nextPos, lastItem) {

    $('.main-content').children().removeClass('section--is-active');
    $('.main-content').children().eq(nextPos).addClass('section--is-active');
    $('.main-content .section').children().removeClass('section--next section--prev');

    if (curPos === lastItem && nextPos === 0 || curPos === 0 && nextPos === lastItem) {
      $('.main-content .section').children().removeClass('section--next section--prev');
    }
    else if (curPos < nextPos) {
      $('.main-content').children().eq(curPos).children().addClass('section--next');
    }
    else {
      $('.main-content').children().eq(curPos).children().addClass('section--prev');
    }

    if (nextPos !== 0 && nextPos !== lastItem) {
      $('.header--cta').addClass('is-active');
    }
    else {
      $('.header--cta').removeClass('is-active');
    }

  }

  // Jump to an explicit section index (from side nav / outer nav clicks).
  function goToSection(nextPos) {

    var curPos = currentPosition(),
        lastItem = lastPosition();

    if (nextPos === curPos) {
      return;
    }

    if (nextPos < 0) {
      nextPos = lastItem;
    }
    else if (nextPos > lastItem) {
      nextPos = 0;
    }

    updateNavs(nextPos);
    updateContent(curPos, nextPos, lastItem);
    resetSectionScroll();
    syncMobileNav();

  }

  // Move one section in a direction: 1 = next, -1 = previous (wraps around).
  function stepSection(direction) {

    var curPos = currentPosition(),
        lastItem = lastPosition(),
        nextPos;

    if (direction > 0) {
      nextPos = (curPos === lastItem) ? 0 : curPos + 1;
    }
    else {
      nextPos = (curPos === 0) ? lastItem : curPos - 1;
    }

    updateNavs(nextPos);
    updateContent(curPos, nextPos, lastItem);
    resetSectionScroll();
    syncMobileNav();

  }

  // Shared throttle so one gesture only ever triggers one transition.
  function throttledStep(direction) {

    if (!canScroll) {
      return;
    }

    canScroll = false;
    clearTimeout(scrollController);
    scrollController = setTimeout(function () {
      canScroll = true;
    }, 800);

    stepSection(direction);

  }

  /* -------------------------------------------------------- mouse wheel (desktop) */

  function wheelDirection(e) {

    var oe = e.originalEvent || e,
        delta = (oe.wheelDelta) ? -oe.wheelDelta : (oe.detail || 0) * 20;

    if (delta > 50) {
      return 1;
    }
    if (delta < -50) {
      return -1;
    }
    return 0;

  }

  $(window).on('mousewheel DOMMouseScroll', function (e) {

    if (menuIsOpen()) {
      return;
    }

    var direction = wheelDirection(e);

    if (!direction) {
      return;
    }

    // Long section on screen: let the browser scroll its own content first.
    if (canScrollInside(activeSectionElement(), direction)) {
      return;
    }

    e.preventDefault();
    throttledStep(direction);

  });

  /* ------------------------------------------------- touch gestures (mobile / tablet) */

  var touchStart = null;

  function onTouchStart(e) {

    // Ignore multi finger gestures (pinch / zoom) and taps on controls.
    if (e.touches.length !== 1 || isInteractiveTarget(e.target)) {
      touchStart = null;
      return;
    }

    touchStart = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };

  }

  function onTouchEnd(e) {

    var start = touchStart;
    touchStart = null;

    if (!start || menuIsOpen()) {
      return;
    }

    // Another finger is still down: not a clean vertical swipe.
    if (e.touches && e.touches.length) {
      return;
    }

    var point = e.changedTouches && e.changedTouches[0];

    if (!point) {
      return;
    }

    var deltaX = point.clientX - start.x,
        deltaY = point.clientY - start.y,
        elapsed = Date.now() - start.time;

    // Too short, too slow, or mostly horizontal: keep the native behaviour.
    if (Math.abs(deltaY) < 45 || elapsed > 800) {
      return;
    }
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return;
    }

    var direction = deltaY < 0 ? 1 : -1;

    // Boundary check: if the section still has hidden content in that
    // direction, the finger gesture was pure scrolling - stay in place.
    if (canScrollInside(activeSectionElement(), direction)) {
      return;
    }

    throttledStep(direction);

  }

  function onTouchCancel() {
    touchStart = null;
  }

  function bindTouchNavigation() {

    var target = document.getElementById('viewport');

    if (!target || !target.addEventListener) {
      return;
    }

    var options = supportsPassive ? { passive: true } : false;

    target.addEventListener('touchstart', onTouchStart, options);
    target.addEventListener('touchend', onTouchEnd, options);
    target.addEventListener('touchcancel', onTouchCancel, options);

  }

  bindTouchNavigation();

  /* ------------------------------------------------- keyboard navigation (desktop) */

  $(document).on('keyup', function (e) {

    if (menuIsOpen() || isFormField(e.target)) {
      return;
    }

    var direction = 0;

    if (e.keyCode === 40 || e.keyCode === 34) {
      direction = 1;
    }
    else if (e.keyCode === 38 || e.keyCode === 33) {
      direction = -1;
    }
    else {
      return;
    }

    // Arrow keys scroll a long section before they change section.
    if (canScrollInside(activeSectionElement(), direction)) {
      return;
    }

    e.preventDefault();
    throttledStep(direction);

  });

  /* ------------------------------------------------------------ nav click handlers */

  $('.side-nav li, .outer-nav li').click(function () {

    if (!($(this).hasClass('is-active'))) {
      goToSection($(this).parent().children().index($(this)));
    }

  });

  $('.cta').click(function () {

    var curPos = currentPosition(),
        lastItem = lastPosition();

    updateNavs(lastItem);
    updateContent(curPos, lastItem, lastItem);
    resetSectionScroll();
    syncMobileNav();

  });

  /* --------------------------------------------------- compact mobile navigation */

  function padIndex(value) {
    return (value < 10 ? '0' : '') + value;
  }

  function syncMobileNav() {

    var $nav = $('.mobile-nav');

    if (!$nav.length) {
      return;
    }

    $nav.find('.mobile-nav--current').text(padIndex(currentPosition() + 1));
    $nav.find('.mobile-nav--total').text(padIndex($('.side-nav').children().length));

  }

  $('.mobile-nav--prev').on('click', function (e) {
    e.preventDefault();
    stepSection(-1);
  });

  $('.mobile-nav--next').on('click', function (e) {
    e.preventDefault();
    stepSection(1);
  });

  syncMobileNav();

  var resizeTimer = null;

  $(window).on('resize orientationchange', function () {

    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resetSectionScroll();
      syncMobileNav();
    }, 200);

  });

  /* -------------------------------------------------------------- outer 3D nav */

  function outerNav() {

    $('.header--nav-toggle').click(function () {

      $('.perspective').addClass('perspective--modalview');
      setTimeout(function () {
        $('.perspective').addClass('effect-rotate-left--animate');
      }, 25);
      $('.outer-nav, .outer-nav li, .outer-nav--return').addClass('is-vis');

    });

    $('.outer-nav--return, .outer-nav li').click(function () {

      $('.perspective').removeClass('effect-rotate-left--animate');
      setTimeout(function () {
        $('.perspective').removeClass('perspective--modalview');
      }, 400);
      $('.outer-nav, .outer-nav li, .outer-nav--return').removeClass('is-vis');

    });

  }

  /* ----------------------------------------------------------------- work slider */

  function workSlider() {

    $('.slider--prev, .slider--next').click(function () {

      var $this = $(this),
          curLeft = $('.slider').find('.slider--item-left'),
          curLeftPos = $('.slider').children().index(curLeft),
          curCenter = $('.slider').find('.slider--item-center'),
          curCenterPos = $('.slider').children().index(curCenter),
          curRight = $('.slider').find('.slider--item-right'),
          curRightPos = $('.slider').children().index(curRight),
          totalWorks = $('.slider').children().length,
          $left = $('.slider--item-left'),
          $center = $('.slider--item-center'),
          $right = $('.slider--item-right'),
          $item = $('.slider--item');

      $('.slider').animate({ opacity: 0 }, 400);

      setTimeout(function () {

        if ($this.hasClass('slider--next')) {
          if (curLeftPos < totalWorks - 1 && curCenterPos < totalWorks - 1 && curRightPos < totalWorks - 1) {
            $left.removeClass('slider--item-left').next().addClass('slider--item-left');
            $center.removeClass('slider--item-center').next().addClass('slider--item-center');
            $right.removeClass('slider--item-right').next().addClass('slider--item-right');
          }
          else {
            if (curLeftPos === totalWorks - 1) {
              $item.removeClass('slider--item-left').first().addClass('slider--item-left');
              $center.removeClass('slider--item-center').next().addClass('slider--item-center');
              $right.removeClass('slider--item-right').next().addClass('slider--item-right');
            }
            else if (curCenterPos === totalWorks - 1) {
              $left.removeClass('slider--item-left').next().addClass('slider--item-left');
              $item.removeClass('slider--item-center').first().addClass('slider--item-center');
              $right.removeClass('slider--item-right').next().addClass('slider--item-right');
            }
            else {
              $left.removeClass('slider--item-left').next().addClass('slider--item-left');
              $center.removeClass('slider--item-center').next().addClass('slider--item-center');
              $item.removeClass('slider--item-right').first().addClass('slider--item-right');
            }
          }
        }
        else {
          if (curLeftPos !== 0 && curCenterPos !== 0 && curRightPos !== 0) {
            $left.removeClass('slider--item-left').prev().addClass('slider--item-left');
            $center.removeClass('slider--item-center').prev().addClass('slider--item-center');
            $right.removeClass('slider--item-right').prev().addClass('slider--item-right');
          }
          else {
            if (curLeftPos === 0) {
              $item.removeClass('slider--item-left').last().addClass('slider--item-left');
              $center.removeClass('slider--item-center').prev().addClass('slider--item-center');
              $right.removeClass('slider--item-right').prev().addClass('slider--item-right');
            }
            else if (curCenterPos === 0) {
              $left.removeClass('slider--item-left').prev().addClass('slider--item-left');
              $item.removeClass('slider--item-center').last().addClass('slider--item-center');
              $right.removeClass('slider--item-right').prev().addClass('slider--item-right');
            }
            else {
              $left.removeClass('slider--item-left').prev().addClass('slider--item-left');
              $center.removeClass('slider--item-center').prev().addClass('slider--item-center');
              $item.removeClass('slider--item-right').last().addClass('slider--item-right');
            }
          }
        }

      }, 400);

      $('.slider').animate({ opacity: 1 }, 400);

    });

  }

  /* ------------------------------------------------------ floating form labels */

  function transitionLabels() {

    $('.work-request--information input').focusout(function () {

      var textVal = $(this).val();

      if (textVal === "") {
        $(this).removeClass('has-value');
      }
      else {
        $(this).addClass('has-value');
      }

      // The section scrolls internally now, only the keyboard offset is reset.
      if (isCompactViewport() && window.pageYOffset) {
        window.scrollTo(0, 0);
      }

    });

  }

  /* --------------------------------------------------------------- initialise */

  outerNav();
  workSlider();
  transitionLabels();

});
