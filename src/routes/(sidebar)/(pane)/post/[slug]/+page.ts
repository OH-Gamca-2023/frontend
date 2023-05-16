import type { PageLoad } from "./$types"

export const prerender = true

export const load = (({ params }) => {
  return {
    postId: params.slug,
  }
}) satisfies PageLoad