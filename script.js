/*
 * script.js — Main JavaScript for the Food Landing Page
 * Features:
 *  - Mobile nav / burger toggle (defensive selectors)
 *  - Smooth scrolling for internal anchor links
 *  - Simple, accessible carousel (optional markup)
 *  - Basic form validation for forms with `data-validate`
 *  - Lazy-load images using `data-src`
 */

(function () {
	'use strict';

	document.addEventListener('DOMContentLoaded', function () {
		// Mobile nav toggle (uses [data-burger] and [data-nav] if present)
		var burger = document.querySelector('[data-burger], .burger');
		var nav = document.querySelector('[data-nav], .nav');
		if (burger && nav) {
			burger.addEventListener('click', function () {
				burger.classList.toggle('open');
				nav.classList.toggle('open');
				// Prevent background scroll when menu open
				document.documentElement.classList.toggle('no-scroll');
			});

			// Close nav when clicking a nav link (delegation)
			nav.addEventListener('click', function (e) {
				if (e.target && e.target.matches('a')) {
					nav.classList.remove('open');
					burger.classList.remove('open');
					document.documentElement.classList.remove('no-scroll');
				}
			});
		}

		// Smooth scroll for anchor links (internal links)
		var anchorLinks = document.querySelectorAll('a[href^="#"]');
		anchorLinks.forEach(function (link) {
			link.addEventListener('click', function (e) {
				var href = link.getAttribute('href');
				if (!href || href.length <= 1) return; // ignore '#' or empty
				var target = document.querySelector(href);
				if (!target) return; // nothing to scroll to

				e.preventDefault();
				target.scrollIntoView({ behavior: 'smooth', block: 'start' });

				// Accessibility: focus the target after scrolling
				try {
					target.focus({ preventScroll: true });
				} catch (err) {
					// Older browsers may not support options
					target.setAttribute('tabindex', '-1');
					target.focus();
				}

				// Close nav if open
				if (nav && nav.classList.contains('open')) {
					nav.classList.remove('open');
					burger && burger.classList.remove('open');
					document.documentElement.classList.remove('no-scroll');
				}
			});
		});

		// Simple carousel initializer
		(function initCarousel() {
			var carousels = document.querySelectorAll('.carousel[data-carousel], [data-carousel]');
			carousels.forEach(function (carousel) {
				var slidesWrap = carousel.querySelector('.slides');
				if (!slidesWrap) return;
				var slides = Array.prototype.slice.call(slidesWrap.children);
				if (slides.length <= 1) return;

				var idx = 0;
				var show = function (i) {
					slides.forEach(function (s, j) {
						s.hidden = j !== i;
						s.setAttribute('aria-hidden', j !== i);
					});
				};
				show(idx);

				var nextBtn = carousel.querySelector('.next');
				var prevBtn = carousel.querySelector('.prev');

				var go = function (delta) {
					idx = (idx + delta + slides.length) % slides.length;
					show(idx);
				};

				nextBtn && nextBtn.addEventListener('click', function () { go(1); });
				prevBtn && prevBtn.addEventListener('click', function () { go(-1); });

				// autoplay if data-autoplay is set (seconds)
				var autoplayAttr = carousel.getAttribute('data-autoplay');
				var autoplay = autoplayAttr ? parseFloat(autoplayAttr) : 0;
				var timer = null;
				if (autoplay && !isNaN(autoplay) && autoplay > 0) {
					timer = setInterval(function () { go(1); }, autoplay * 1000);
					carousel.addEventListener('mouseenter', function () { clearInterval(timer); });
					carousel.addEventListener('mouseleave', function () { timer = setInterval(function () { go(1); }, autoplay * 1000); });
				}
			});
		})();

		// Basic form validation for forms with data-validate
		var validatedForms = document.querySelectorAll('form[data-validate]');
		validatedForms.forEach(function (form) {
			form.addEventListener('submit', function (e) {
				var valid = true;
				var firstInvalid = null;
				var requireds = form.querySelectorAll('[required]');
				requireds.forEach(function (el) {
					var value = (el.value || '').trim();
					var parent = el.closest('.field') || el.parentElement;
					if (!value) {
						valid = false;
						el.classList.add('invalid');
						parent && parent.classList && parent.classList.add('invalid');
						el.setAttribute('aria-invalid', 'true');
						if (!firstInvalid) firstInvalid = el;
					} else {
						el.classList.remove('invalid');
						parent && parent.classList && parent.classList.remove('invalid');
						el.removeAttribute('aria-invalid');
					}
				});

				if (!valid) {
					e.preventDefault();
					firstInvalid && firstInvalid.focus();
				}
			}, { passive: false });
		});

		// Lazy-load images with data-src attribute
		(function lazyLoadImages() {
			var images = document.querySelectorAll('img[data-src]');
			if (!images.length) return;
			if ('IntersectionObserver' in window) {
				var io = new IntersectionObserver(function (entries, obs) {
					entries.forEach(function (entry) {
						if (entry.isIntersecting) {
							var img = entry.target;
							img.src = img.getAttribute('data-src');
							img.removeAttribute('data-src');
							obs.unobserve(img);
						}
					});
				}, { rootMargin: '200px 0px' });
				images.forEach(function (img) { io.observe(img); });
			} else {
				// fallback: load immediately
				images.forEach(function (img) {
					img.src = img.getAttribute('data-src');
					img.removeAttribute('data-src');
				});
			}
		})();

		// Close nav on Escape key
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' || e.key === 'Esc') {
				if (nav && nav.classList.contains('open')) {
					nav.classList.remove('open');
					burger && burger.classList.remove('open');
					document.documentElement.classList.remove('no-scroll');
					burger && burger.focus();
				}
			}
		});
	});
})();

