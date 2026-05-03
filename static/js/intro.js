// Wait until DOM is ready
window.addEventListener("DOMContentLoaded", () => {

    const canvas = document.getElementById("three-canvas");

    if (!canvas) {
        console.error("Canvas not found");
        return;
    }

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 🌟 PARTICLES
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;

    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: 0xffffff
    });

    const particles = new THREE.Points(
        particlesGeometry,
        particlesMaterial
    );

    scene.add(particles);

    // 🎥 Animation loop
    function animate() {
        requestAnimationFrame(animate);

        particles.rotation.y += 0.001;
        particles.rotation.x += 0.0005;

        renderer.render(scene, camera);
    }

    animate();

    // 📱 Responsive fix
    window.addEventListener("resize", () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    // ⏳ Fade out intro after 3 sec
    window.addEventListener("load", () => {
        setTimeout(() => {
            const intro = document.getElementById("intro");

            if (!intro) return;

             // 👇 fade text FIRST
            const text = document.querySelector(".intro-text");
            if (text) {
                text.style.transition = "opacity 0.8s ease";
                text.style.opacity = "0";
            }

            // 🎥 cinematic fade + slight zoom
            intro.style.opacity = "0";
            intro.style.transform = "scale(1.1)";

            setTimeout(() => {
                intro.style.display = "none";
            }, 500);

        }, 3500);
    });

    const title = document.querySelector(".intro-title");
    const tagline = document.querySelector(".intro-tagline");

    if (title) title.style.opacity = "0";

    setTimeout(() => {
        if (tagline) tagline.style.opacity = "0";
    }, 200);

    const aboutSection = document.querySelector(".about-section");

    if (!aboutSection) {
        console.log("about section not found");
        return;
    }

    function reveal() {
        const trigger = aboutSection.getBoundingClientRect().top;
        const screenHeight = window.innerHeight;

        if (trigger < screenHeight - 100) {
            aboutSection.classList.add("show");
        }
    }
    reveal();

    window.addEventListener("scroll", reveal);

    const first = document.querySelector(".solutions-stack li");
    if (first) first.classList.add("active");

    const section = document.querySelector(".solutions-right");
    const items = document.querySelectorAll(".solutions-stack li");

    items.forEach(item => {
        item.addEventListener("mouseenter", () => {
            items.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
        });
    });

    /* 👇 KEY PART */
    section.addEventListener("mouseleave", () => {
        items.forEach(i => i.classList.remove("active"));
    });


});