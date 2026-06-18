export async function getGigs() {
  const res = await fetch('/api/gigs');
  const json = await res.json();
  if (json.error) {
    throw new Error(json.error);
  }
  return json.data;
}
