document.addEventListener('DOMContentLoaded', () => {
    const starfields = [];
    
    // --- Theme Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        const isLight = body.classList.contains('light-mode');
        themeToggle.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        
        const newColor = isLight ? 0x555555 : 0xaaaaaa;
        starfields.forEach(sf => {
            sf.material.color.setHex(newColor);
        });
    });

    // --- Active Nav Link on Scroll ---
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('nav a');
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.5 };
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${targetId}`);
                });
            }
        });
    }, observerOptions);
    sections.forEach(section => sectionObserver.observe(section));

    // --- Scroll-based Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    revealElements.forEach(el => revealObserver.observe(el));

    // --- Skill Bar Animation ---
    const skillBars = document.querySelectorAll('.skill-bar-inner');
    const skillBarObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                bar.style.width = bar.dataset.width;
                observer.unobserve(bar); // Animate only once
            }
        });
    }, { threshold: 0.5 });
    skillBars.forEach(bar => skillBarObserver.observe(bar));


    // --- Generic 3D Starfield Initializer ---
    function initStarfield(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 1;

        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const starGeo = new THREE.BufferGeometry();
        const starCount = 6000;
        const positions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 600;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const isLight = document.body.classList.contains('light-mode');
        const material = new THREE.PointsMaterial({
            color: isLight ? 0x555555 : 0xaaaaaa,
            size: 0.7,
            transparent: true,
            sizeAttenuation: true,
        });

        const stars = new THREE.Points(starGeo, material);
        scene.add(stars);
        
        starfields.push({ canvas, renderer, scene, camera, stars, material });
    }
    
    // --- Generic Carousel Initializer ---
    function setupCarousel(carouselId) {
        const carousel = document.getElementById(carouselId);
        if (!carousel) return;

        const track = carousel.querySelector('.carousel-track');
        const slides = Array.from(track.children);
        const nextButton = carousel.querySelector('.carousel-button.next');
        const prevButton = carousel.querySelector('.carousel-button.prev');
        
        let currentIndex = 0;

        function getSlidesPerPage() {
            if (window.innerWidth >= 1024) return 3;
            if (window.innerWidth >= 768) return 2;
            return 1;
        }

        function updateCarousel() {
            const slidesPerPage = getSlidesPerPage();
            const slideWidth = track.parentElement.clientWidth / slidesPerPage;

            slides.forEach(slide => {
                slide.style.width = `${slideWidth}px`;
            });

            track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
            
            prevButton.disabled = currentIndex === 0;
            nextButton.disabled = currentIndex >= slides.length - slidesPerPage;
        }

        nextButton.addEventListener('click', () => {
            const slidesPerPage = getSlidesPerPage();
            if (currentIndex < slides.length - slidesPerPage) {
                currentIndex++;
                updateCarousel();
            }
        });

        prevButton.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });

        window.addEventListener('resize', () => {
            currentIndex = 0;
            updateCarousel();
        });
        
        // Initial setup
        updateCarousel();
    }


    // --- Global Animation Loop ---
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
    });
    
    const clock = new THREE.Clock();
    function animate() {
        const elapsedTime = clock.getElapsedTime();
        
        starfields.forEach(sf => {
            sf.stars.rotation.y = -mouseX * 0.00005;
            sf.stars.rotation.x = -mouseY * 0.00005;
            sf.stars.position.z = Math.sin(elapsedTime * 0.1) * 50;
            sf.renderer.render(sf.scene, sf.camera);
        });
        
        requestAnimationFrame(animate);
    }

    // --- Global Resize Handler ---
    window.addEventListener('resize', () => {
        starfields.forEach(sf => {
            sf.camera.aspect = window.innerWidth / window.innerHeight;
            sf.camera.updateProjectionMatrix();
            sf.renderer.setSize(window.innerWidth, window.innerHeight);
            sf.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });
    }, false);

    // --- Initialize Everything ---
    initStarfield('hero-canvas');
    initStarfield('contact-canvas');
    setupCarousel('projects-carousel');
    setupCarousel('testimonials-carousel');
    setupCarousel('certificates-carousel');
    animate();
});
