// Run after full page load
window.addEventListener("load", () => {

    const intro = document.getElementById("intro");

    // ✅ HOME PAGE (intro exists)
    if (intro) {

        const canvas = document.getElementById("three-canvas");
        if (!canvas) return;

        // Scene
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Particles
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

        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);

        function animate() {
            requestAnimationFrame(animate);
            particles.rotation.y += 0.001;
            particles.rotation.x += 0.0005;
            renderer.render(scene, camera);
        }
        animate();

        // Resize
        window.addEventListener("resize", () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        });

        // 🎬 Intro exit animation
        setTimeout(() => {

            const text = document.querySelector(".intro-text");
            if (text) text.style.opacity = "0";

            intro.style.opacity = "0";
            intro.style.transform = "scale(1.1)";

            setTimeout(() => {
                intro.style.display = "none";

                // ✅ SHOW PAGE AFTER INTRO
                document.body.classList.add("loaded");

            }, 500);

        }, 3500);

    }

    // ✅ OTHER PAGES (no intro)
    else {
        document.body.classList.add("loaded");
    }
});