/* ==============================
   FEATURED CAROUSEL
============================== */

let currentSlideIndex = 0;

function changeSlide(n) {
    showSlide(currentSlideIndex += n);
}

function currentSlide(n) {
    showSlide(currentSlideIndex = n);
}

function showSlide(n) {
    const slides = document.querySelectorAll('.carousel-image');
    const dots = document.querySelectorAll('.dot');

    if (slides.length === 0) return; // PREVENT errors on pages without carousel

    if (n >= slides.length) {
        currentSlideIndex = 0;
    }
    if (n < 0) {
        currentSlideIndex = slides.length - 1;
    }

    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    slides[currentSlideIndex].classList.add('active');
    dots[currentSlideIndex].classList.add('active');
}

/* ==============================
   PARTICLE BACKGROUND EFFECT
============================== */

function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    
    // Canvas
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 60; // more/less particles

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 1.5 + 0.5, // Small radius
            dx: (Math.random() - 0.5) * 0.4, // Slow drifting speed
            dy: (Math.random() - 0.5) * 0.4,
            opacity: Math.random() * 0.5 + 0.1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        particles.forEach(p => {
            // Move particles
            p.x += p.dx;
            p.y += p.dy;
            
            // Screen WRAP
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
}

/* ==============================
   IMAGE LIGHTBOX & DETAILS
============================== */

// DATABASE FOR IMAGE DETAILS (MAP FILE NAME HERE)
const imageDatabase = {
    "assets/index/chrysler_nyc.jpg": { title: "Chrysler Building at Night, New York", photographer: "Chalo Gallardo (@chalogallardo)", date: "December 13, 2021" },
    "assets/index/Grand_Canyon_view_from_Pima_Point_2010.png": { title: "Grand Canyon South Rim", photographer: "Photo from Luca Galuzzi", date: "May 30, 2008" },
    "assets/index/Lantern flies.webp": { title: "Lanternflies", photographer: "Khaichuin Sim", date: "February 2025" },
    "assets/index/Lapu Lapu.jpg": { title: "Lapu Lapu Statue", photographer: "Dianne Concha", date: "November 6, 2025" },
    "assets/index/man_top_shanghai.jpg": { title: "Man on Top of Shanghai Skyscraper", photographer: "Yiran Ding (@yiranding)", date: "April 23, 2018" },
    "assets/index/Manila City Hall Clock.jpg": { title: "Manila City Hall Clock", photographer: "Ramius Aquiler", date: "May 28, 2026" },
    "assets/index/Mayon Volcano.jpg": { title: "Mayon Volcano", photographer: "Alexis Ricardo Alaurin", date: "May 13, 2023" },
    "assets/index/Plitvice_Lakes_National_Park.png": { title: "Plitvice Lakes National Park", photographer: "Diego Delso", date: "July 18, 2014" },
    "assets/index/Quezon Monument.jpg": { title: "Quezon Monument", photographer: "Topi Satin", date: "May 10, 2025" },
    "assets/index/Rice Terraces.jpg": { title: "Philippine Rice Terraces", photographer: "John Renzo Aledia", date: "December 3, 2016" },
    "assets/index/Rizal Monument.jpg": { title: "RIzal Monument", photographer: "Ken Miranda", date: "February 3, 2026" },
    "assets/index/roppongi_tower.jpg": { title: "Roppongi Hills Tower at Night, Tokyo", photographer: "Mark LeeRei Yamazaki (@kryhd)", date: "January 23, 2022" },
    "assets/index/shibuya_crossing_above.jpg": { title: "Shibuya Street Neon, Tokyo", photographer: "ayumi kubo (@ayumikubo)", date: "February 23, 2026" },
    "assets/index/Street Vendor.jpg": { title: "Streetfood Vendor", photographer: "Airam Dato-on", date: "January 30, 2026" },
    "assets/index/UP Oblation.jpg": { title: "UP Oblation", photographer: "Mico Medel", date: "August 25, 2025" },
    "assets/index/Vigan City.jpg": { title: "Vigan City", photographer: "Tine Angeles", date: "Nov 2, 2019" }
};

function initLightbox() {
    // 1. Create Modal HTML
    const modal = document.createElement('div');
    modal.className = 'lightbox-modal';
    modal.innerHTML = `
        <div class="lightbox-content">
            <span class="lightbox-close">&times;</span>
            <div class="lightbox-body">
                <img class="lightbox-img" src="" alt="Expanded View">
                <div class="lightbox-info">
                    <h2 id="lb-title"></h2>
                    <div class="info-row">
                        <span class="info-label">Photographer</span>
                        <span id="lb-photographer" class="info-data"></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Date Shot</span>
                        <span id="lb-date" class="info-data"></span>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const galleryImages = document.querySelectorAll('.img-border img');
    
    // 2. GALLERY IMAGES FUNCTION 
    galleryImages.forEach(img => {
        img.addEventListener('click', (e) => {
            const src = e.target.getAttribute('src');
            
            // Fetch data
            const data = imageDatabase[src] || { title: "Unknown Shot", photographer: "Unknown", date: "Unknown Date" };

            // Populate Modal
            document.querySelector('.lightbox-img').src = src;
            document.getElementById('lb-title').innerText = data.title;
            document.getElementById('lb-photographer').innerText = data.photographer;
            document.getElementById('lb-date').innerText = data.date;

            // Show Modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // 3. CLOSING MODAL
    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('lightbox-modal') || e.target.classList.contains('lightbox-close')) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto'; // Re-enable scroll
        }
    });
}

/* ==============================
   INITIALIZATION
============================== */
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initLightbox();
});
