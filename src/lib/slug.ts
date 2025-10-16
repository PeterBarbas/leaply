// src/lib/slug.ts
export function slugify(input: string) {
    return input
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 64);
  }
  
  export default slugify;
  