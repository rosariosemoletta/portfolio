// Loader functionality
function hideLoader() {
  const loader = document.querySelector(".loader");
  loader.classList.add("hidden");
  setTimeout(() => {
    loader.style.display = "none";
  }, 500);
}

// Wait for both DOM and Spline to load
document.addEventListener("DOMContentLoaded", function () {
  // Check if Spline iframe is loaded
  const splineIframe = document.querySelector(".spline-container iframe");
  splineIframe.addEventListener("load", function () {
    // Add longer delay before hiding loader
    setTimeout(hideLoader, 2500);
  });

  // Intersection Observer for fade effects
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      } else {
        entry.target.classList.remove("visible");
      }
    });
  }, observerOptions);

  // Observe all prism texts
  const prismTexts = document.querySelectorAll(".prism-text");
  prismTexts.forEach((text) => {
    observer.observe(text);
  });

  const menuButton = document.querySelector(".mobile-menu-button");

  menuButton.addEventListener("click", function () {
    // Mobile menu toggle functionality can be implemented here
    // when the mobile menu design is provided
  });
});
