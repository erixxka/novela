import { useQuery } from '@tanstack/react-query';
import { sanityClient } from '../sanity';

export type BlogPostSummary = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  author?: { name?: string; image?: { asset?: { url?: string } } };
  mainImage?: { asset?: { url?: string } };
  categories?: { _id: string; title: string }[];
};

export type PortableTextSpan = {
  _type: 'span';
  _key: string;
  text: string;
  marks?: string[];
};

export type PortableTextMarkDef = {
  _key: string;
  _type: string;
  href?: string;
};

export type PortableTextBlock = {
  _type: string;
  _key: string;
  style?: string;
  listItem?: string;
  level?: number;
  children?: PortableTextSpan[];
  markDefs?: PortableTextMarkDef[];
  // inline image members carry asset->url + alt
  asset?: { url?: string };
  alt?: string;
};

export type BlogPost = BlogPostSummary & {
  body: PortableTextBlock[];
  mainImage?: { asset?: { url?: string }; alt?: string };
  categories?: { _id: string; title: string }[];
};

export const blogKeys = {
  all: ['blog'] as const,
  detail: (slug: string) => ['blog', slug] as const,
};

const LIST_QUERY = `*[_type == "post"]{
  _id, title, slug, publishedAt,
  author->{ name, image{ asset->{url} } },
  mainImage{ asset->{url} },
  categories[]->{ _id, title }
} | order(publishedAt desc)`;

const DETAIL_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  _id, title, slug, publishedAt, body,
  author->{ name, image{ asset->{url} } },
  mainImage{ asset->{url}, alt },
  categories[]->{ _id, title }
}`;

export function useBlogPosts() {
  return useQuery({
    queryKey: blogKeys.all,
    queryFn: () => sanityClient.fetch<BlogPostSummary[]>(LIST_QUERY),
  });
}

export function useBlogPost(slug: string | undefined) {
  return useQuery({
    queryKey: blogKeys.detail(slug ?? ''),
    queryFn: () => sanityClient.fetch<BlogPost>(DETAIL_QUERY, { slug }),
    enabled: !!slug,
  });
}
