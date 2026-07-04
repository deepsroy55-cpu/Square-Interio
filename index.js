/* -------------------------------------------------------------
 * Square Interio - Client Logic & Interactions (Dual Page)
 * Features: Mobile Nav, Scroll Highlights, Advanced Grid Filters + Search, 
 *           Dynamic local Image Uploads + Persistence, Lightbox, Slider
 * ------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

    const isPortfolioPage = document.body.classList.contains('portfolio-page');
    const categoryNames = {
        'drawing': 'Drawing Hall',
        'tv': 'TV Unit',
        'bedroom': 'Bedroom',
        'kitchen': 'Kitchen',
        'bathroom': 'Bathroom'
    };

    // --- Shared Lightbox DOM elements ---
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');

    // --- 1. Sticky Header & Active Nav link highlighting ---
    const header = document.querySelector('.site-header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        // Sticky class
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            // Keep scrolled on portfolio page by default to ensure text contrast
            if (!isPortfolioPage) {
                header.classList.remove('scrolled');
            }
        }

        // Active link highlighting (Index page only)
        if (!isPortfolioPage) {
            let currentSectionId = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 120;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                    currentSectionId = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    link.classList.remove('active');
                    if (href === `#${currentSectionId}`) {
                        link.classList.add('active');
                    }
                }
            });
        }
    });

    // --- 1.1 Intercept hash links to scroll smoothly and keep URL bar clean without '#' ---
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#') && href !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    const headerHeight = header ? header.offsetHeight : 80;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // If it is a nav link, highlight it
                    if (link.classList.contains('nav-link')) {
                        navLinks.forEach(l => l.classList.remove('active'));
                        link.classList.add('active');
                    }
                }
            }
        });
    });

    // Clean URL hash on load if present (e.g. when coming from another page)
    if (window.location.hash) {
        const targetId = window.location.hash;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            setTimeout(() => {
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Remove hash from address bar cleanly
                history.replaceState(null, null, window.location.pathname);
            }, 100);
        }
    }

    // --- 1.2 Statistics Counter Animation ---
    const statsSection = document.getElementById('statsGrid');
    const counters = document.querySelectorAll('.stat-box .count');
    let countersAnimated = false;

    const animateCounters = () => {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const increment = target / 80;

            const updateCount = () => {
                const current = +counter.innerText.replace('+', '');
                if (current < target) {
                    counter.innerText = Math.ceil(current + increment);
                    setTimeout(updateCount, 15);
                } else {
                    counter.innerText = target + "+";
                }
            };
            updateCount();
        });
    };

    if (statsSection && counters.length > 0) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersAnimated) {
                    animateCounters();
                    countersAnimated = true;
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        statsObserver.observe(statsSection);
    }

    // --- 1.3 Interactive Before/After Transformations Slider ---
    const beforeAfterSlider = document.getElementById('beforeAfterSlider');
    const afterImage = document.getElementById('afterImage');
    const sliderBar = document.getElementById('sliderBar');
    
    if (beforeAfterSlider && afterImage && sliderBar) {
        const slide = (x) => {
            const rect = beforeAfterSlider.getBoundingClientRect();
            let position = ((x - rect.left) / rect.width) * 100;
            if (position < 0) position = 0;
            if (position > 100) position = 100;
            
            afterImage.style.clipPath = `inset(0 0 0 ${position}%)`;
            sliderBar.style.left = `${position}%`;
        };
        
        const onMouseMove = (e) => {
            slide(e.clientX);
        };
        
        const onTouchMove = (e) => {
            if (e.touches && e.touches[0]) {
                slide(e.touches[0].clientX);
            }
        };
        
        const startDrag = () => {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('touchmove', onTouchMove);
        };
        
        const stopDrag = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onTouchMove);
        };
        
        sliderBar.addEventListener('mousedown', startDrag);
        window.addEventListener('mouseup', stopDrag);
        
        sliderBar.addEventListener('touchstart', startDrag);
        window.addEventListener('touchend', stopDrag);
    }

    // Before After Tab Toggles
    const baTabs = document.querySelectorAll('#baTabs .ba-tab-btn');
    const beforeImg = document.querySelector('#beforeAfterSlider .img-before');
    const baDescription = document.getElementById('baDescription');

    if (baTabs.length > 0 && beforeImg && afterImage && baDescription) {
        baTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                baTabs.forEach(btn => btn.classList.remove('active'));
                tab.classList.add('active');
                
                const srcBefore = tab.getAttribute('data-source-before');
                const srcAfter = tab.getAttribute('data-source-after');
                const desc = tab.getAttribute('data-desc');
                
                beforeImg.setAttribute('src', srcBefore);
                afterImage.setAttribute('src', srcAfter);
                baDescription.innerText = desc;
                
                // Reset slider split
                afterImage.style.clipPath = 'inset(0 0 0 50%)';
                if (sliderBar) sliderBar.style.left = '50%';
            });
        });
    }

    // --- 1.4 Video Showcase Modal Controls ---
    const videoThumbnails = document.querySelectorAll('.video-thumb-container');
    const videoModal = document.getElementById('videoModal');
    const videoModalClose = document.getElementById('videoModalClose');
    const videoIframe = document.getElementById('videoIframe');

    if (videoThumbnails.length > 0 && videoModal && videoIframe) {
        videoThumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                const videoUrl = thumb.getAttribute('data-video-url');
                if (videoUrl) {
                    videoIframe.setAttribute('src', videoUrl);
                    videoModal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
            });
        });
    }

    if (videoModalClose && videoModal && videoIframe) {
        const closeVideo = () => {
            videoModal.style.display = 'none';
            videoIframe.setAttribute('src', '');
            document.body.style.overflow = 'auto';
        };
        videoModalClose.addEventListener('click', closeVideo);
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) closeVideo();
        });
    }

    // --- 1.5 Inspiration Gallery Filter & Lightbox ---
    const galleryFilterButtons = document.querySelectorAll('#galleryFilterContainer .ba-tab-btn');
    const galleryItems = document.querySelectorAll('#galleryGrid .portfolio-item');

    if (galleryFilterButtons.length > 0) {
        galleryFilterButtons.forEach(button => {
            button.addEventListener('click', () => {
                galleryFilterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const filter = button.getAttribute('data-gallery-filter');
                galleryItems.forEach(item => {
                    if (filter === 'all' || item.classList.contains(filter)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    const galleryImages = document.querySelectorAll('#galleryGrid .gallery-img');

    if (galleryImages.length > 0 && lightboxModal && lightboxImg && lightboxCaption) {
        galleryImages.forEach(img => {
            img.addEventListener('click', () => {
                const parent = img.closest('.portfolio-item');
                if (parent) {
                    const src = parent.getAttribute('data-src');
                    const caption = img.getAttribute('alt');
                    
                    lightboxImg.setAttribute('src', src);
                    lightboxCaption.innerHTML = caption;
                    lightboxModal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
            });
        });
    }

    // --- 1.6 Index Page Portfolio Filters ---
    const homeFilterButtons = document.querySelectorAll('#portfolioFilterContainer .ba-tab-btn');
    if (homeFilterButtons.length > 0) {
        homeFilterButtons.forEach(button => {
            button.addEventListener('click', () => {
                homeFilterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentFilter = button.getAttribute('data-filter');
                applyFilters();
            });
        });
    }

    // --- 2. Mobile Nav Toggle ---
    const navToggleBtn = document.getElementById('navToggleBtn');
    const navMenu = document.getElementById('navMenu');

    if (navToggleBtn && navMenu) {
        navToggleBtn.addEventListener('click', () => {
            navToggleBtn.classList.toggle('open');
            navMenu.classList.toggle('open');
        });

        // Close mobile nav when link clicked (except if it has a dropdown on mobile)
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const parentLi = link.parentElement;
                const hasDropdown = parentLi.querySelector('.dropdown-menu');
                if (hasDropdown && window.innerWidth <= 768) {
                    return; // Handled by dropdown click logic
                }
                navToggleBtn.classList.remove('open');
                navMenu.classList.remove('open');
            });
        });
    }

    // Mobile dropdown toggle logic
    document.querySelectorAll('.nav-menu ul li > a').forEach(link => {
        link.addEventListener('click', (e) => {
            const parentLi = link.parentElement;
            const hasDropdown = parentLi.querySelector('.dropdown-menu');
            if (hasDropdown && window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                
                // Toggle active class on this item, remove from others
                document.querySelectorAll('.nav-menu ul li').forEach(li => {
                    if (li !== parentLi) li.classList.remove('dropdown-active');
                });
                parentLi.classList.toggle('dropdown-active');
            }
        });
    });


    // --- 3. Dynamic LocalStorage Loader & Appender (Portfolio page only) ---
    const portfolioGrid = document.getElementById('portfolioGrid');
    
    // Function to append item HTML element to portfolio grid
    const appendPortfolioItem = (item) => {
        if (!portfolioGrid) return;

        const itemDiv = document.createElement('div');
        itemDiv.className = `portfolio-item ${item.category}`;
        itemDiv.setAttribute('data-src', item.imgSrc);
        itemDiv.setAttribute('data-tags', item.tags.toLowerCase());
        
        itemDiv.innerHTML = `
            <div class="portfolio-img-container">
                <img src="${item.imgSrc}" alt="${item.title}">
                <div class="portfolio-overlay">
                    <div class="overlay-content">
                        <span class="item-category">${categoryNames[item.category] || item.category}</span>
                        <h4>${item.title}</h4>
                        <span class="zoom-icon"><i class="fa fa-expand"></i></span>
                    </div>
                </div>
            </div>
        `;

        // Bind Lightbox click to newly created dynamic item
        itemDiv.querySelector('.portfolio-img-container').addEventListener('click', () => {
            const visibleItems = getVisibleItems();
            const index = visibleItems.indexOf(itemDiv);
            openLightbox(index);
        });

        portfolioGrid.appendChild(itemDiv);
    };

    // Load custom uploads from storage
    if (isPortfolioPage && portfolioGrid) {
        const storedItems = JSON.parse(localStorage.getItem('square_interio_portfolio') || '[]');
        storedItems.forEach(item => {
            appendPortfolioItem(item);
        });
    }


    // --- 4. Combined Portfolio Filters & Search ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioSearch = document.getElementById('portfolioSearch');

    let currentFilter = 'all';
    let currentSearchQuery = '';

    const applyFilters = () => {
        // Query items dynamically so newly uploaded items are matched
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        
        portfolioItems.forEach(item => {
            const categoryMatch = currentFilter === 'all' || item.classList.contains(currentFilter);
            
            // Search text check
            const tags = (item.getAttribute('data-tags') || '').toLowerCase();
            const title = (item.querySelector('h4') ? item.querySelector('h4').textContent : '').toLowerCase();
            const searchMatch = !currentSearchQuery || 
                                tags.includes(currentSearchQuery) || 
                                title.includes(currentSearchQuery);

            if (categoryMatch && searchMatch) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 50);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    };

    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentFilter = button.getAttribute('data-filter');
                applyFilters();
            });
        });
    }

    if (portfolioSearch) {
        portfolioSearch.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value.toLowerCase().trim();
            applyFilters();
        });

        // Parse query parameter for search if present on load (fully enables SearchAction schema)
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('q');
        if (searchParam) {
            portfolioSearch.value = searchParam;
            currentSearchQuery = searchParam.toLowerCase().trim();
            // Apply category filter 'all' to ensure wide search matching
            const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
            if (allBtn) {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                allBtn.classList.add('active');
                currentFilter = 'all';
            }
            applyFilters();
        }
    }


    // --- 5. Portfolio Lightbox ---
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    let currentItemIndex = 0;
    
    // Get visible portfolio items dynamically based on current filters/search
    const getVisibleItems = () => {
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        return Array.from(portfolioItems).filter(item => item.style.display !== 'none');
    };

    const openLightbox = (index) => {
        const visibleItems = getVisibleItems();
        if (visibleItems.length === 0 || index < 0 || index >= visibleItems.length) return;
        
        currentItemIndex = index;
        const currentItem = visibleItems[currentItemIndex];
        
        if (!currentItem) return;

        const imgSrc = currentItem.getAttribute('data-src');
        const imgAlt = currentItem.querySelector('img').getAttribute('alt');
        const captionText = currentItem.querySelector('h4').textContent;

        lightboxImg.setAttribute('src', imgSrc);
        lightboxImg.setAttribute('alt', imgAlt);
        
        const catText = currentItem.querySelector('.item-category') ? currentItem.querySelector('.item-category').textContent : '';
        lightboxCaption.innerHTML = `<span class="category" style="color: var(--color-primary); font-weight:600; text-transform:uppercase; font-size:12px; display:block; margin-bottom:5px;">${catText}</span> ${captionText}`;
        
        lightboxModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; 
    };

    const closeLightbox = () => {
        if (lightboxModal) {
            lightboxModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };

    const navigateLightbox = (direction) => {
        const visibleItems = getVisibleItems();
        if (visibleItems.length <= 1) return;

        if (direction === 'next') {
            currentItemIndex = (currentItemIndex + 1) % visibleItems.length;
        } else {
            currentItemIndex = (currentItemIndex - 1 + visibleItems.length) % visibleItems.length;
        }
        
        // Trigger zoom animation reset
        lightboxImg.style.animation = 'none';
        void lightboxImg.offsetWidth; 
        lightboxImg.style.animation = 'zoomIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        
        openLightbox(currentItemIndex);
    };

    // Attach click listeners to default portfolio items
    const defaultItems = document.querySelectorAll('.portfolio-item');
    defaultItems.forEach(item => {
        const imgContainer = item.querySelector('.portfolio-img-container');
        if (imgContainer) {
            imgContainer.addEventListener('click', () => {
                const visibleItems = getVisibleItems();
                const index = visibleItems.indexOf(item);
                openLightbox(index);
            });
        }
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', () => navigateLightbox('prev'));
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', () => navigateLightbox('next'));
    }

    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (lightboxModal && lightboxModal.style.display === 'flex') {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') navigateLightbox('next');
            if (e.key === 'ArrowLeft') navigateLightbox('prev');
        }
    });


    // --- 6. Upload Modal Operations (Portfolio page only) ---
    const openUploadModalBtn = document.getElementById('openUploadModalBtn');
    const uploadModal = document.getElementById('uploadModal');
    const closeUploadModalBtn = document.getElementById('closeUploadModalBtn');
    const uploadDesignForm = document.getElementById('uploadDesignForm');

    if (openUploadModalBtn && uploadModal) {
        openUploadModalBtn.addEventListener('click', () => {
            uploadModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }

    const closeUploadModal = () => {
        if (uploadModal) {
            uploadModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            uploadDesignForm.reset();
        }
    };

    if (closeUploadModalBtn) {
        closeUploadModalBtn.addEventListener('click', closeUploadModal);
    }

    if (uploadModal) {
        uploadModal.addEventListener('click', (e) => {
            if (e.target === uploadModal) {
                closeUploadModal();
            }
        });
    }

    // Form submit listener (process image upload & save locally)
    if (uploadDesignForm) {
        uploadDesignForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('uploadTitle').value.trim();
            const category = document.getElementById('uploadCategory').value;
            const tags = document.getElementById('uploadTags').value.trim();
            const imageFileInput = document.getElementById('uploadImageFile');

            if (!title || !category || !tags || !imageFileInput.files[0]) {
                alert('Please fill out all required fields and upload an image.');
                return;
            }

            const file = imageFileInput.files[0];
            const reader = new FileReader();

            reader.onload = () => {
                const base64Image = reader.result;
                
                const newDesign = {
                    title: title,
                    category: category,
                    tags: tags,
                    imgSrc: base64Image
                };

                // Add to LocalStorage
                const currentStored = JSON.parse(localStorage.getItem('square_interio_portfolio') || '[]');
                currentStored.push(newDesign);
                localStorage.setItem('square_interio_portfolio', JSON.stringify(currentStored));

                // Append to DOM
                appendPortfolioItem(newDesign);

                // Re-run filter and search matches
                applyFilters();

                // Close upload modal
                closeUploadModal();
            };

            reader.onerror = () => {
                alert('There was a problem reading the image file.');
            };

            reader.readAsDataURL(file);
        });
    }


    // --- 7. Testimonials Slider (Index page only) ---
    const slides = document.querySelectorAll('.testimonial-slide');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    let currentSlide = 0;
    let autoSlideInterval;

    const showSlide = (index) => {
        if (slides.length === 0) return;
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
        currentSlide = index;
    };

    const nextSlide = () => {
        if (slides.length === 0) return;
        const nextIdx = (currentSlide + 1) % slides.length;
        showSlide(nextIdx);
    };

    const prevSlide = () => {
        if (slides.length === 0) return;
        const prevIdx = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prevIdx);
    };

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoSlide();
        });

        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoSlide();
        });
    }

    const startAutoSlide = () => {
        if (slides.length === 0) return;
        autoSlideInterval = setInterval(nextSlide, 6000);
    };

    const resetAutoSlide = () => {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    };

    if (slides.length > 0) {
        startAutoSlide();
    }


    // --- 8. Scroll Entrance Animations ---
    const animateElements = document.querySelectorAll('.animate-fade-in, .animate-slide-left, .animate-slide-right');

    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    animateElements.forEach(element => {
        animationObserver.observe(element);
    });


    // --- 9. Contact Form Handling (Index page only) ---
    const form = document.getElementById('consultationForm');
    const formSubmitBtn = document.getElementById('formSubmitBtn');
    const formFeedback = document.getElementById('formFeedback');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const originalBtnContent = formSubmitBtn.innerHTML;
            formSubmitBtn.disabled = true;
            formSubmitBtn.innerHTML = `<span>Sending Inquiry...</span> <i class="fa fa-spinner fa-spin"></i>`;
            formFeedback.className = 'form-feedback';
            formFeedback.style.display = 'none';

            const name = document.getElementById('clientName').value.trim();
            const email = document.getElementById('clientEmail').value.trim();
            const phone = document.getElementById('clientPhone').value.trim();
            const projectType = document.getElementById('projectType').value;
            const message = document.getElementById('clientMessage').value.trim();

            if (!name || !email || !phone) {
                showFeedback('Please fill out all required fields marked with *.', 'error');
                restoreSubmitBtn();
                return;
            }

            try {
                const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                const isFileProtocol = window.location.protocol === 'file:';

                if (isFileProtocol) {
                    showFeedback(`[Preview Mode] Thank you ${name}! Your inquiry has been registered locally. (Real emails are sent when live on your domain).`, 'success');
                    form.reset();
                    restoreSubmitBtn();
                    return;
                }

                let response;

                if (isLocal) {
                    response = await fetch('/contact', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, phone, projectType, message })
                    });
                } else {
                    response = await fetch('https://formsubmit.co/ajax/admin@squareinterio.com', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            name: name,
                            email: email,
                            phone: phone,
                            "Project Type": projectType,
                            message: message,
                            _subject: "New Premium Inquiry from Square Interio Website",
                            _captcha: "false"
                        })
                    });
                }

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.message || `Unable to send inquiry. Server returned status ${response.status}`);
                }

                const result = await response.json().catch(() => ({}));

                if (isLocal) {
                    if (!result.success) {
                        throw new Error(result.message || 'Local server submission failed.');
                    }
                    showFeedback(`Thank you ${name}! Your premium inquiry has been successfully registered. We will contact you within 24 hours.`, 'success');
                } else {
                    let feedbackMsg = `Thank you ${name}! Your premium inquiry has been successfully registered. We will contact you within 24 hours.`;
                    if (result.message) {
                        const msgLower = result.message.toLowerCase();
                        if (msgLower.includes('activate') || msgLower.includes('confirm') || msgLower.includes('check your email')) {
                            feedbackMsg = `Action Required: An activation link has been sent to admin@squareinterio.com. Please click it to start receiving inquiries!`;
                        }
                    }
                    showFeedback(feedbackMsg, 'success');
                }
                form.reset();
            } catch (error) {
                showFeedback(error.message || 'Unable to send inquiry at this time. Please try again later.', 'error');
            }

            restoreSubmitBtn();
        });
    }

    function showFeedback(msg, type) {
        formFeedback.textContent = msg;
        formFeedback.className = `form-feedback ${type}`;
        formFeedback.style.display = 'block';
    }

    function restoreSubmitBtn() {
        formSubmitBtn.disabled = false;
        formSubmitBtn.innerHTML = originalBtnContent;
    }

    // --- 10. FAQ Accordion logic ---
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');

            // Close all items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                const ans = item.querySelector('.faq-answer');
                if (ans) ans.style.maxHeight = null;
            });

            // Toggle active state
            if (!isActive) {
                faqItem.classList.add('active');
                const ans = faqItem.querySelector('.faq-answer');
                if (ans) ans.style.maxHeight = ans.scrollHeight + "px";
            }
        });
    });

    // --- 11. Conversational Chatbot Concierge Injections & Logic ---
    injectChatbot();
    initializeChatbot();

    function injectChatbot() {
        // Create chat trigger button
        const chatBtn = document.createElement('button');
        chatBtn.className = 'chat-widget-btn';
        chatBtn.id = 'chatWidgetBtn';
        chatBtn.setAttribute('aria-label', 'Open design chat assistant');
        chatBtn.innerHTML = '<i class="fa fa-comments"></i>';
        document.body.appendChild(chatBtn);

        // Create chat panel container
        const chatPanel = document.createElement('div');
        chatPanel.className = 'chat-panel';
        chatPanel.id = 'chatPanel';
        chatPanel.innerHTML = `
            <div class="chat-header">
                <div class="chat-header-info">
                    <div class="chat-avatar">
                        <i class="fa fa-user-tie"></i>
                    </div>
                    <div class="chat-header-title">
                        <h4>Square Interio Concierge</h4>
                        <span>Online</span>
                    </div>
                </div>
                <button class="chat-close-btn" id="chatCloseBtn" aria-label="Close chat">&times;</button>
            </div>
            <div class="chat-history" id="chatHistory"></div>
            <div class="chat-quick-replies" id="chatQuickReplies"></div>
            <div class="chat-input-area" id="chatInputArea">
                <form class="chat-input-form" id="chatInputForm">
                    <input type="text" id="chatInputField" placeholder="Type your answer here..." required autocomplete="off">
                    <button type="submit" class="chat-send-btn" aria-label="Send message">
                        <i class="fa fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        `;
        document.body.appendChild(chatPanel);
    }

    function initializeChatbot() {
        const chatBtn = document.getElementById('chatWidgetBtn');
        const chatPanel = document.getElementById('chatPanel');
        const chatCloseBtn = document.getElementById('chatCloseBtn');
        const chatHistory = document.getElementById('chatHistory');
        const chatQuickReplies = document.getElementById('chatQuickReplies');
        const chatInputArea = document.getElementById('chatInputArea');
        const chatInputForm = document.getElementById('chatInputForm');
        const chatInputField = document.getElementById('chatInputField');

        let chatbotInitialized = false;
        let chatState = 'idle'; // 'idle', 'waiting_name', 'waiting_phone', 'waiting_email', 'waiting_state', 'submitting'
        let leadData = { name: '', phone: '', email: '', state: '' };

        // Toggle chat panel
        chatBtn.addEventListener('click', () => {
            const isOpen = chatPanel.classList.toggle('open');
            chatBtn.classList.toggle('active', isOpen);
            if (isOpen && !chatbotInitialized) {
                chatbotInitialized = true;
                startConversation();
            }
        });

        // Close button action
        chatCloseBtn.addEventListener('click', () => {
            promptClose();
        });

        // Submit form
        chatInputForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInputField.value.trim();
            if (!text) return;
            chatInputField.value = '';
            handleUserInput(text);
        });

        function startConversation() {
            chatHistory.innerHTML = '';
            chatState = 'idle';
            chatInputArea.classList.remove('visible');
            addBotMessage("Hello! I am your Square Interio design concierge. How can I help you design your dream space today?");
            showGreetingReplies();
        }

        function addBotMessage(text) {
            const msgDiv = document.createElement('div');
            msgDiv.className = 'chat-msg bot';
            msgDiv.textContent = text;
            chatHistory.appendChild(msgDiv);
            scrollToBottom();
        }

        function addUserMessage(text) {
            const msgDiv = document.createElement('div');
            msgDiv.className = 'chat-msg user';
            msgDiv.textContent = text;
            chatHistory.appendChild(msgDiv);
            scrollToBottom();
        }

        function showTypingIndicator() {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'chat-typing';
            typingDiv.id = 'chatTypingIndicator';
            typingDiv.innerHTML = '<span></span><span></span><span></span>';
            chatHistory.appendChild(typingDiv);
            scrollToBottom();
        }

        function removeTypingIndicator() {
            const indicator = document.getElementById('chatTypingIndicator');
            if (indicator) indicator.remove();
        }

        function scrollToBottom() {
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }

        function setQuickReplies(replies) {
            chatQuickReplies.innerHTML = '';
            chatQuickReplies.style.display = replies.length > 0 ? 'flex' : 'none';
            replies.forEach(reply => {
                const chip = document.createElement('button');
                chip.className = 'chat-reply-chip';
                chip.textContent = reply.label;
                chip.addEventListener('click', () => {
                    reply.onClick();
                });
                chatQuickReplies.appendChild(chip);
            });
        }

        function showGreetingReplies() {
            chatState = 'idle';
            chatInputArea.classList.remove('visible');
            setQuickReplies([
                { label: 'Modular Kitchens', onClick: () => selectService('Kitchen') },
                { label: 'Luxury Bedrooms', onClick: () => selectService('Bedroom') },
                { label: 'Drawing Halls', onClick: () => selectService('Drawing Hall') },
                { label: 'TV Units', onClick: () => selectService('TV Unit') },
                { label: 'Luxury Bathrooms', onClick: () => selectService('Bathroom') },
                { label: 'Office Interiors', onClick: () => selectService('Office') },
                { label: 'Get a Price Quote', onClick: () => startQuoteFlow() },
                { label: 'Office & Contact Info', onClick: () => showContactInfo() },
                { label: 'Close Assistant', onClick: () => promptClose() }
            ]);
        }

        function selectService(service) {
            addUserMessage(service + " Designs");
            showTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                let desc = '';
                let pageLink = '';
                
                const isSubpage = window.location.pathname.includes('/services/') || window.location.pathname.includes('/blog/');
                const prefix = isSubpage ? '../' : '';

                switch (service) {
                    case 'Kitchen':
                        desc = "We design premium modular kitchens (L-shape, straight, parallel) with termite-proof BWP plywood, soft-close cabinets, and high-gloss acrylic finishes.";
                        pageLink = prefix + 'services/modular-kitchen-patna.html';
                        break;
                    case 'Bedroom':
                        desc = "We design modern luxury bedrooms featuring custom velvet headboards, sliding wardrobe closets, and layered ambient profiles.";
                        pageLink = prefix + 'services/luxury-bedroom-design-patna.html';
                        break;
                    case 'Drawing Hall':
                        desc = "We design elegant drawing halls with wooden louvers, CNC cut dividers, custom lighting designs, and premium sofa layouts.";
                        pageLink = prefix + 'services/drawing-hall-design.html';
                        break;
                    case 'TV Unit':
                        desc = "We style contemporary floating TV units with backlit marble backdrops, hidden wiring, and glass display shelving.";
                        pageLink = prefix + 'services/tv-unit-design.html';
                        break;
                    case 'Bathroom':
                        desc = "We design spa-like bathroom configurations, dry & wet area segregations, wall-hung vanities, and premium Jaquar/Kohler fittings.";
                        pageLink = prefix + 'services/bathroom-design-patna.html';
                        break;
                    case 'Office':
                        desc = "We build productive corporate office interiors, acoustic boardroom panelings, glass partitions, and ergonomic workstations.";
                        pageLink = prefix + 'services/office-interior-design-patna.html';
                        break;
                }

                addBotMessage(desc + " Would you like to get a pricing estimate for your project?");
                setQuickReplies([
                    { label: 'Get a Price Quote', onClick: () => startQuoteFlow() },
                    { label: 'View Details Page', onClick: () => { window.location.href = pageLink; } },
                    { label: 'Back to Services', onClick: () => { addUserMessage("Back to Services"); startConversation(); } }
                ]);
            }, 1000);
        }

        function showContactInfo() {
            addUserMessage("Office & Contact Info");
            showTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                addBotMessage("Office Address: Mainpura, L. C. T. Ghat, Ram Janki Mandir, East Lane, Patna-800001, Bihar\nPhone: +91 84097 50111\nEmail: admin@squareinterio.com\n\nWould you like our concierge to call you back directly?");
                setQuickReplies([
                    { label: 'Get a Callback / Quote', onClick: () => startQuoteFlow() },
                    { label: 'Back to Services', onClick: () => { addUserMessage("Back to Services"); startConversation(); } }
                ]);
            }, 1000);
        }

        function startQuoteFlow() {
            addUserMessage("Get a Price Quote");
            chatState = 'waiting_name';
            leadData = { name: '', phone: '', email: '', state: '' };
            
            showTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                addBotMessage("Great! Let's collect some basic details so our design consultants can prepare a custom estimate. What is your Full Name?");
                setQuickReplies([]);
                chatInputArea.classList.add('visible');
                chatInputField.setAttribute('placeholder', 'Enter your full name...');
                chatInputField.setAttribute('type', 'text');
                chatInputField.focus();
            }, 1000);
        }

        function handleUserInput(text) {
            addUserMessage(text);
            showTypingIndicator();

            setTimeout(async () => {
                removeTypingIndicator();
                
                if (chatState === 'waiting_name') {
                    leadData.name = text;
                    chatState = 'waiting_phone';
                    addBotMessage(`Thanks ${leadData.name}! What is your Phone Number (preferably WhatsApp)?`);
                    chatInputField.setAttribute('placeholder', 'Enter your phone number...');
                    chatInputField.setAttribute('type', 'tel');
                    chatInputField.focus();
                } 
                else if (chatState === 'waiting_phone') {
                    leadData.phone = text;
                    chatState = 'waiting_email';
                    addBotMessage("Got it. What is your Email Address?");
                    chatInputField.setAttribute('placeholder', 'Enter your email address...');
                    chatInputField.setAttribute('type', 'email');
                    chatInputField.focus();
                } 
                else if (chatState === 'waiting_email') {
                    leadData.email = text;
                    chatState = 'waiting_state';
                    addBotMessage("Lastly, which State / City is your project located in?");
                    chatInputField.setAttribute('placeholder', 'Enter state (e.g. Bihar, Patna)...');
                    chatInputField.setAttribute('type', 'text');
                    chatInputField.focus();
                } 
                else if (chatState === 'waiting_state') {
                    leadData.state = text;
                    chatState = 'submitting';
                    chatInputArea.classList.remove('visible');
                    
                    addBotMessage("Registering your details... Please wait a moment.");
                    showTypingIndicator();

                    try {
                        const response = await fetch('https://formsubmit.co/ajax/admin@squareinterio.com', {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({
                                name: leadData.name,
                                email: leadData.email,
                                phone: leadData.phone,
                                "State / Location": leadData.state,
                                message: "Quote request details captured via website chat assistant panel.",
                                _subject: "New Chat Lead - Square Interio",
                                _captcha: "false"
                            })
                        });

                        removeTypingIndicator();

                        if (response.ok) {
                            addBotMessage(`Success! Thank you ${leadData.name}. I have successfully sent your design inquiry to our team. We will call or email you at ${leadData.phone} / ${leadData.email} within 24 hours.`);
                        } else {
                            addBotMessage(`Thank you ${leadData.name}. I have registered your details. Our concierge team will get back to you at ${leadData.phone} / ${leadData.email} shortly.`);
                        }
                    } catch (err) {
                        removeTypingIndicator();
                        addBotMessage(`Thank you ${leadData.name}. I have recorded your quote request. Our concierge team will contact you at ${leadData.phone} shortly.`);
                    }

                    setQuickReplies([
                        { label: 'Back to Services', onClick: () => { addUserMessage("Back to Services"); startConversation(); } },
                        { label: 'Close Assistant', onClick: () => promptClose() }
                    ]);
                }
            }, 1200);
        }

        function promptClose() {
            addUserMessage("Close Assistant");
            addBotMessage("Would you like to close or minimize the design assistant panel?");
            setQuickReplies([
                { label: 'Minimize Chat', onClick: () => {
                    chatPanel.classList.remove('open');
                    chatBtn.classList.remove('active');
                    chatbotInitialized = false;
                }},
                { label: 'Keep Chatting', onClick: () => {
                    addUserMessage("Keep Chatting");
                    startConversation();
                }}
            ]);
        }

        // -------------------------------------------------------------
        // Hero Fullscreen Slider Component
        // -------------------------------------------------------------
        const sliderContainer = document.getElementById('heroSlider');
        const slides = document.querySelectorAll('.slide');
        const prevBtn = document.getElementById('heroPrevBtn');
        const nextBtn = document.getElementById('heroNextBtn');
        const dotsContainer = document.getElementById('heroSliderDots');

        if (sliderContainer && slides.length > 0) {
            let currentIndex = 0;
            let slideInterval = null;
            const autoplaySpeed = 4500; // 4.5 seconds

            // Generate Pagination Dots
            slides.forEach((slide, index) => {
                const dot = document.createElement('button');
                dot.className = `slider-dot${index === 0 ? ' active' : ''}`;
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
                dot.setAttribute('aria-label', `Go to Slide ${index + 1}`);
                dot.addEventListener('click', () => {
                    goToSlide(index);
                });
                dotsContainer.appendChild(dot);
            });

            const dots = document.querySelectorAll('.slider-dot');

            // Lazy Load Images
            function lazyLoadSlide(index) {
                const slide = slides[index];
                if (!slide) return;
                const img = slide.querySelector('.lazy-slider-img');
                if (img && img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-slider-img');
                    img.removeAttribute('data-src');
                }
            }

            // Proactively load next/prev slide images
            function preloadAdjacentSlides(index) {
                const nextIndex = (index + 1) % slides.length;
                const prevIndex = (index - 1 + slides.length) % slides.length;
                lazyLoadSlide(nextIndex);
                lazyLoadSlide(prevIndex);
            }

            // Change Active Slide
            function goToSlide(index) {
                if (index === currentIndex) return;

                // Load active image if it is still lazy-loaded
                lazyLoadSlide(index);

                slides[currentIndex].classList.remove('active');
                dots[currentIndex].classList.remove('active');
                dots[currentIndex].setAttribute('aria-selected', 'false');

                currentIndex = index;

                slides[currentIndex].classList.add('active');
                dots[currentIndex].classList.add('active');
                dots[currentIndex].setAttribute('aria-selected', 'true');

                // Preload upcoming slides
                preloadAdjacentSlides(currentIndex);
            }

            function nextSlide() {
                const nextIndex = (currentIndex + 1) % slides.length;
                goToSlide(nextIndex);
            }

            function prevSlide() {
                const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
                goToSlide(prevIndex);
            }

            // Autoplay Controls
            function startAutoplay() {
                if (!slideInterval) {
                    slideInterval = setInterval(nextSlide, autoplaySpeed);
                }
            }

            function stopAutoplay() {
                if (slideInterval) {
                    clearInterval(slideInterval);
                    slideInterval = null;
                }
            }

            // Arrow Listeners
            if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); });
            if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); });

            // Pause on Hover
            const heroSectionEl = sliderContainer.closest('.hero-slider-section');
            if (heroSectionEl) {
                heroSectionEl.addEventListener('mouseenter', stopAutoplay);
                heroSectionEl.addEventListener('mouseleave', startAutoplay);

                // Keyboard Navigation Support
                heroSectionEl.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowRight') {
                        nextSlide();
                    } else if (e.key === 'ArrowLeft') {
                        prevSlide();
                    }
                });
                // Ensure section is focusable for keyboard navigation
                heroSectionEl.setAttribute('tabindex', '0');
            }

            // Mobile Swipe Gestures Support
            let startX = 0;
            let endX = 0;
            const threshold = 50; // Minimum swipe distance

            sliderContainer.addEventListener('touchstart', (e) => {
                startX = e.changedTouches[0].screenX;
            }, { passive: true });

            sliderContainer.addEventListener('touchend', (e) => {
                endX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });

            function handleSwipe() {
                const diff = startX - endX;
                if (Math.abs(diff) > threshold) {
                    if (diff > 0) {
                        nextSlide(); // Swiped left, show next
                    } else {
                        prevSlide(); // Swiped right, show prev
                    }
                }
            }

            // Initialize
            lazyLoadSlide(0); // Ensure first slide loads
            preloadAdjacentSlides(0); // Preload next slides immediately
            startAutoplay();
        }
    }
});
