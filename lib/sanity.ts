import { createClient } from '@sanity/client';

// Read-only client. projectId/dataset are public, client-side values
// (they appear verbatim in the Studio's sanity.config.ts). No token, no writes.
export const sanityClient = createClient({
  projectId: 'fq4q2dq2',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2023-01-01',
});
