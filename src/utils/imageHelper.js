const BASE = "https://localhost:5150/images/recipes/"
const DEFAULT = BASE + "default.jpg"

export function getImageUrl(path) {
  if (!path || path === "null" || path.trim() === "") {
    return DEFAULT
  }

  const fileName = path.split(/[\\/]/).pop()
  return BASE + fileName
}

export function handleImageError(e) {
  if (!e.target.dataset.fallbackApplied) {
    e.target.dataset.fallbackApplied = "true"
    e.target.src = DEFAULT
  }
}