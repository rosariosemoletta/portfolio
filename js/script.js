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
    setTimeout(hideLoader, 5500);
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

  // Observe all prism texts and cards
  const prismTexts = document.querySelectorAll(".prism-text");
  const cards = document.querySelectorAll(".card");

  prismTexts.forEach((text) => {
    observer.observe(text);
  });

  cards.forEach((card) => {
    observer.observe(card);
  });

  // Cards Navigation
  const cardsGroups = document.querySelectorAll(".cards-group");
  const prevButton = document.querySelector(".nav-arrow.prev");
  const nextButton = document.querySelector(".nav-arrow.next");
  let currentGroupIndex = 0;

  function updateCardsVisibility() {
    cardsGroups.forEach((group, index) => {
      if (index === currentGroupIndex) {
        group.classList.add("active");
      } else {
        group.classList.remove("active");
      }
    });

    // Update button states
    prevButton.style.opacity = currentGroupIndex === 0 ? "0.5" : "1";
    prevButton.style.pointerEvents = currentGroupIndex === 0 ? "none" : "auto";

    nextButton.style.opacity =
      currentGroupIndex === cardsGroups.length - 1 ? "0.5" : "1";
    nextButton.style.pointerEvents =
      currentGroupIndex === cardsGroups.length - 1 ? "none" : "auto";
  }

  prevButton.addEventListener("click", () => {
    if (currentGroupIndex > 0) {
      currentGroupIndex--;
      updateCardsVisibility();
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentGroupIndex < cardsGroups.length - 1) {
      currentGroupIndex++;
      updateCardsVisibility();
    }
  });

  // Initialize visibility
  updateCardsVisibility();

  // Modal functionality
  const modalOverlay = document.querySelector(".modal-overlay");
  const modalClose = document.querySelector(".modal-close");
  const viewDetailsButtons = document.querySelectorAll(".view-details");

  function openModal(projectData) {
    const modalTitle = document.querySelector(".modal-title");
    const modalDescription = document.querySelector(".modal-description");
    const modalMedia = document.querySelector(".modal-media");
    const modalDetails = document.querySelector(".modal-details");

    modalTitle.textContent = projectData.title;
    modalDescription.textContent = projectData.description;

    // Update media (image or video)
    modalMedia.innerHTML = projectData.isVideo
      ? `<video src="${projectData.mediaUrl}" controls></video>`
      : `<img src="${projectData.mediaUrl}" alt="${projectData.title}">`;

    // Update project details
    modalDetails.innerHTML = Object.entries(projectData.details)
      .map(
        ([label, value]) => `
        <div class="modal-detail-item">
          <div class="modal-detail-label">${label}</div>
          <div class="modal-detail-value">${value}</div>
        </div>
      `
      )
      .join("");

    modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modalOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  viewDetailsButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const card = button.closest(".card");
      const projectData = {
        title: card.querySelector(".card-title").textContent,
        description: card.dataset.description,
        mediaUrl:
          card.dataset.videoUrl || card.querySelector(".card-image").src,
        isVideo: !!card.dataset.videoUrl,
        details: {
          Client: card.dataset.client || "Project Client",
          Source: card.dataset.source || "Link",
          Role: card.dataset.role || "Lead Designer",
          Technologies: card.dataset.technologies || "Technology stack used",
          Year: card.dataset.year || "2023",
        },
      };
      openModal(projectData);
    });
  });

  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // Contact Modal functionality
  const contactButton = document.querySelector(".contact-button");
  const contactModal = document.querySelector(".contact-modal-overlay");
  const contactClose = contactModal.querySelector(".modal-close");

  function openContactModal() {
    contactModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeContactModal() {
    contactModal.classList.remove("active");
    document.body.style.overflow = "";
  }

  contactButton.addEventListener("click", openContactModal);
  contactClose.addEventListener("click", closeContactModal);
  contactModal.addEventListener("click", (e) => {
    if (e.target === contactModal) closeContactModal();
  });

  const menuButton = document.querySelector(".mobile-menu-button");

  menuButton.addEventListener("click", function () {
    // Mobile menu toggle functionality can be implemented here
    // when the mobile menu design is provided
  });
});
