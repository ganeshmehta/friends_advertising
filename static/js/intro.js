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
            }, 1500);

        }, 3000);
    });

});