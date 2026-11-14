/**
 * Enhanced Portfolio - Dynamic JavaScript
 * Features:
 * - Mobile-friendly smooth scrolling
 * - Form validation & submission
 * - Time-based greeting
 * - Project management
 * - Smooth animations
 */

$(document).ready(function() {
  console.log("🎨 Portfolio initialized successfully!");

  // ============================================================================
  // 1. DISABLE SCROLL BLOCKING ON MOBILE
  // ============================================================================
  function disableScrollBlockingOnMobile() {
    const isMobile = window.innerWidth <= 1024;
    
    if (isMobile) {
      // Remove fixed height constraints
      $('html, body').css({
        'height': 'auto',
        'overflow-y': 'auto'
      });

      $('#viewport').css({
        'height': 'auto',
        'position': 'relative',
        'transform': 'none'
      });

      $('.l-wrapper').css({
        'height': 'auto',
        'transform': 'none'
      });

      // Unbind mousewheel events if they exist
      $(window).off('mousewheel DOMMouseScroll');
      $('html, body').off('mousewheel DOMMouseScroll');
    }
  }

  disableScrollingBlockingOnMobile();
  $(window).on('resize', disableScrollBlockingOnMobile);

  // ============================================================================
  // 2. TIME-BASED GREETING
  // ============================================================================
  function showDynamicGreeting() {
    const hour = new Date().getHours();
    let greeting = '';

    if (hour >= 5 && hour < 11) {
      greeting = 'Selamat Pagi 🌅';
    } else if (hour >= 11 && hour < 15) {
      greeting = 'Selamat Siang ☀️';
    } else if (hour >= 15 && hour < 18) {
      greeting = 'Selamat Sore 🌇';
    } else {
      greeting = 'Selamat Malam 🌙';
    }

    console.log(`📢 ${greeting} - Welcome to Nafis Hariri's Portfolio`);
  }

  showDynamicGreeting();

  // ============================================================================
  // 3. FORM HANDLING - HIRE US / WORK REQUEST
  // ============================================================================
  const formConfig = {
    validateEmail: function(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    validateForm: function() {
      const name = $('#name').val().trim();
      const email = $('#email').val().trim();
      const services = $('.work-request input[type="checkbox"]:checked').length;

      if (!name) {
        alert('❌ Mohon masukkan nama Anda!');
        return false;
      }

      if (!email) {
        alert('❌ Mohon masukkan email Anda!');
        return false;
      }

      if (!this.validateEmail(email)) {
        alert('❌ Format email tidak valid!');
        return false;
      }

      if (services === 0) {
        alert('❌ Pilih minimal satu layanan!');
        return false;
      }

      return true;
    },

    submitForm: function(e) {
      e.preventDefault();

      if (!formConfig.validateForm()) {
        return;
      }

      const name = $('#name').val().trim();
      const email = $('#email').val().trim();
      const selectedServices = [];

      $('.work-request input[type="checkbox"]:checked').each(function() {
        selectedServices.push($(this).val());
      });

      const submitBtn = $('.work-request input[type="submit"]');
      const originalText = submitBtn.val();

      submitBtn.val('Mengirim...').prop('disabled', true);

      setTimeout(function() {
        // Success message
        alert(
          `✅ Terima kasih, ${name}!\n\n` +
          `Request Anda untuk layanan:\n` +
          selectedServices.join(', ') + '\n\n' +
          `telah berhasil dikirim.\n` +
          `Kami akan menghubungi Anda di: ${email}`
        );

        // Reset form
        $('.work-request')[0].reset();
        $('.work-request input').removeClass('has-value');
        submitBtn.val(originalText).prop('disabled', false);

        // Clear form inputs visually
        $('#name, #email').val('');
      }, 1000);
    }
  };

  // Bind form submission
  $('.work-request').on('submit', formConfig.submitForm);

  // Real-time input styling
  $('#name, #email').on('input', function() {
    $(this).toggleClass('has-value', this.value.trim().length > 0);
  });

  // ============================================================================
  // 4. SMOOTH SCROLL NAVIGATION
  // ============================================================================
  function smoothScrollToSection(index) {
    const $section = $('.l-section').eq(index);

    if ($section.length) {
      const targetPosition = $section.offset().top - 70;

      $('html, body').animate({
        scrollTop: targetPosition
      }, 800, 'easeInOutQuad');
    }
  }

  // Navigation clicks
  $('.outer-nav > li').on('click', function() {
    const index = $(this).index();
    smoothScrollToSection(index);

    // Update active state
    $('.outer-nav > li').removeClass('is-active');
    $(this).addClass('is-active');
  });

  // CTA buttons scroll to contact
  $('.cta, .header--cta').on('click', function(e) {
    e.preventDefault();
    const contactIndex = $('.l-section').length - 1;
    smoothScrollToSection(contactIndex);
  });

  // Logo click scrolls to top
  $('.header--logo, a.header--logo').on('click', function(e) {
    e.preventDefault();
    smoothScrollToSection(0);
  });

  // ============================================================================
  // 5. ACTIVE SECTION TRACKING
  // ============================================================================
  function updateActiveNavigation() {
    const $sections = $('.l-section');
    let activeIndex = 0;

    $sections.each(function(index) {
      const $section = $(this);
      const sectionTop = $section.offset().top;
      const sectionBottom = sectionTop + $section.outerHeight();
      const scrollTop = $(window).scrollTop() + 100;

      if (scrollTop >= sectionTop && scrollTop < sectionBottom) {
        activeIndex = index;
      }
    });

    $('.outer-nav > li').removeClass('is-active');
    $('.outer-nav > li').eq(activeIndex).addClass('is-active');
  }

  $(window).on('scroll', updateActiveNavigation);

  // ============================================================================
  // 6. LAZY LOADING IMAGES
  // ============================================================================
  function lazyLoadImages() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            const $img = $(entry.target);
            if ($img.data('src')) {
              $img.attr('src', $img.data('src')).removeData('src');
            }
            imageObserver.unobserve(entry.target);
          }
        });
      });

      $('img[data-src]').each(function() {
        imageObserver.observe(this);
      });
    }
  }

  lazyLoadImages();

  // ============================================================================
  // 7. SMOOTH PAGE LOAD ANIMATION
  // ============================================================================
  $(window).on('load', function() {
    $('body').addClass('loaded');
    console.log('✨ Page fully loaded and ready!');
  });

  // ============================================================================
  // 8. KEYBOARD NAVIGATION
  // ============================================================================
  $(document).on('keydown', function(e) {
    if (e.key === 'ArrowDown') {
      const currentIndex = $('.outer-nav > li.is-active').index();
      const nextIndex = Math.min(currentIndex + 1, $('.l-section').length - 1);
      smoothScrollToSection(nextIndex);
    }

    if (e.key === 'ArrowUp') {
      const currentIndex = $('.outer-nav > li.is-active').index();
      const prevIndex = Math.max(currentIndex - 1, 0);
      smoothScrollToSection(prevIndex);
    }
  });

  // ============================================================================
  // 9. MOBILE MENU TOGGLE
  // ============================================================================
  $('.header--nav-toggle').on('click', function() {
    $('.side-nav').toggleClass('is-active');
  });

  $('.side-nav > li').on('click', function() {
    const index = $(this).index();
    smoothScrollToSection(index);
    $('.side-nav').removeClass('is-active');
  });

  // ============================================================================
  // 10. PREVENT CONTEXT MENU ON PRODUCTION (Optional)
  // ============================================================================
  // Uncomment if you want to protect your work
  // $(document).on('contextmenu', function(e) {
  //   e.preventDefault();
  //   return false;
  // });

  // ============================================================================
  // 11. PERFORMANCE MONITORING
  // ============================================================================
  if (window.performance && window.performance.timing) {
    window.addEventListener('load', function() {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      console.log(`⏱️ Page Load Time: ${pageLoadTime}ms`);
    });
  }

  // ============================================================================
  // 12. PROJECTS DATA (Dynamic Management)
  // ============================================================================
  const projectsDatabase = [
    {
      id: 1,
      title: 'Familly 100',
      category: 'Web Game',
      description: 'Permainan interaktif yang terinspirasi dari TV show populer',
      url: 'https://Nafis-Hariri.github.io/Familly-100',
      image: 'assets/img/work-f100.jpg',
      tags: ['HTML', 'CSS', 'JavaScript', 'Game']
    },
    {
      id: 2,
      title: 'Metiew & Smith',
      category: 'Web Design',
      description: 'Desain portfolio profesional dengan layout modern',
      url: '#0',
      image: 'assets/img/work-metiew-smith.jpg',
      tags: ['Design', 'UI/UX', 'Responsive']
    },
    {
      id: 3,
      title: 'Alex Nowak',
      category: 'UI/UX Design',
      description: 'Aplikasi manajemen proyek dengan interface intuitif',
      url: '#0',
      image: 'assets/img/work-alex-nowak.jpg',
      tags: ['UI/UX', 'Design', 'App']
    }
  ];

  console.log(`📦 ${projectsDatabase.length} projects loaded successfully`);

  // ============================================================================
  // 13. ACCESSIBILITY IMPROVEMENTS
  // ============================================================================
  // Add ARIA labels where needed
  $('.cta').attr('role', 'button').attr('aria-label', 'Hire Us - Go to Contact Section');
  $('.header--nav-toggle').attr('role', 'button').attr('aria-label', 'Toggle Navigation Menu');

  // ============================================================================
  // INITIALIZATION COMPLETE
  // ============================================================================
  console.log('✅ All portfolio features initialized successfully!');
});

// Add easeInOutQuad animation if jQuery UI not loaded
if (!$.easing.easeInOutQuad) {
  $.easing.easeInOutQuad = function(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  };
}
