const testimonials = document.querySelectorAll(".testimonial");
let index = 0;

function rotateTestimonials() {
    testimonials.forEach(t => t.classList.remove("active"));

    testimonials[index].classList.add("active");

    index = (index + 1) % testimonials.length;
}

setInterval(rotateTestimonials, 3000);