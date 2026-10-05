/**
 * DRAFTSDATA.JS — Rosario Semoletta
 * ─────────────────────────────────
 * Managed by the Studio's Drafts tab: uploading there rewrites this file and keeps a backup
 * of the previous one, the same way assets/js/projects.js is managed.
 *
 * The Drafts panel of Work (#/drafts) reads this list. Leave it empty and the panel stays empty.
 *
 * Fields:
 *   type    → "image" | "video"
 *   src     → the file (e.g. "assets/img/draft-01-1600.webp" / "assets/video/draft-02.mp4")
 *   srcset  → optional. Responsive sizes for an image.
 *   avif    → optional. An AVIF srcset for an image.
 *   webm    → optional. A lighter WebM copy of a video file.
 *   poster  → optional. A preview image shown before a video plays.
 *   ratio   → optional, e.g. "16:9". The Studio fills this in automatically; without it the
 *             site measures the real file once the piece settles into the grid.
 *   alt     → optional description (accessibility label).
 */

var DRAFTS = [
  { type: "video", src: "assets/video/draft-love-u-4.mp4", poster: "assets/img/draft-love-u-4-poster.webp", ratio: "9:16" },
  { type: "video", src: "assets/video/draft-cloth.mp4", poster: "assets/img/draft-cloth-poster.webp", ratio: "9:16" },
  { type: "video", src: "assets/video/draft-chiratta.mp4", poster: "assets/img/draft-chiratta-poster.webp", ratio: "9:16" },
  { type: "video", src: "assets/video/draft-button-1.mp4", poster: "assets/img/draft-button-1-poster.webp", ratio: "1:1" },
  { type: "video", src: "assets/video/draft-guitar-sync-particles-touchdesigner.mp4", poster: "assets/img/draft-guitar-sync-particles-touchdesigner-poster.webp", ratio: "9:16" },
  { type: "video", src: "assets/video/draft-thermal.mp4", poster: "assets/img/draft-thermal-poster.webp", ratio: "9:16" },
  { type: "video", src: "assets/video/draft-you-can-rest.mp4", poster: "assets/img/draft-you-can-rest-poster.webp", ratio: "9:16" },
  { type: "video", src: "assets/video/draft-vibin.mp4", poster: "assets/img/draft-vibin-poster.webp", ratio: "9:16" },
  { type: "video", src: "assets/video/draft-organic.mp4", poster: "assets/img/draft-organic-poster.webp", ratio: "4:5" },
  { type: "video", src: "assets/video/draft-ancient-dream.mp4", poster: "assets/img/draft-ancient-dream-poster.webp", ratio: "4:5" },
  { type: "image", src: "assets/img/draft-abstract-1-1920.webp", srcset: "assets/img/draft-abstract-1-640.webp 640w, assets/img/draft-abstract-1-1280.webp 1280w, assets/img/draft-abstract-1-1920.webp 1920w", avif: "assets/img/draft-abstract-1-640.avif 640w, assets/img/draft-abstract-1-1280.avif 1280w, assets/img/draft-abstract-1-1920.avif 1920w", ratio: "16:9" },
  { type: "image", src: "assets/img/draft-polygons-1920.webp", srcset: "assets/img/draft-polygons-640.webp 640w, assets/img/draft-polygons-1280.webp 1280w, assets/img/draft-polygons-1920.webp 1920w", avif: "assets/img/draft-polygons-640.avif 640w, assets/img/draft-polygons-1280.avif 1280w, assets/img/draft-polygons-1920.avif 1920w", ratio: "4:5", alpha: true },
  { type: "image", src: "assets/img/draft-red-jewel-1920.webp", srcset: "assets/img/draft-red-jewel-640.webp 640w, assets/img/draft-red-jewel-1280.webp 1280w, assets/img/draft-red-jewel-1920.webp 1920w", avif: "assets/img/draft-red-jewel-640.avif 640w, assets/img/draft-red-jewel-1280.avif 1280w, assets/img/draft-red-jewel-1920.avif 1920w", ratio: "1:1" },
  { type: "image", src: "assets/img/draft-skull-1-1080.webp", srcset: "assets/img/draft-skull-1-640.webp 640w, assets/img/draft-skull-1-1080.webp 1080w", avif: "assets/img/draft-skull-1-640.avif 640w, assets/img/draft-skull-1-1080.avif 1080w", ratio: "9:16" },
  { type: "video", src: "assets/video/draft-anim-2.mp4", poster: "assets/img/draft-anim-2-poster.webp", ratio: "1:1" }
];
