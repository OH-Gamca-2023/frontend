import type { PageLoad } from "./$types"

export const prerender = false

export const load = (({ params }) => {
  return {
    postId: params.slug,
  }
}) satisfies PageLoad