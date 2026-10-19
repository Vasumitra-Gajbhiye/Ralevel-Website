# Cloudinary (image uploads)

**Tier 2.** You need this to upload images in the admin pages: blog hero images, writer avatars, team photos, scholarship logos, resource thumbnails and certificates. **Displaying** images already works without it.

## Set up

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. In the Cloudinary console, open **Settings → API Keys** (or the dashboard home) and copy your **cloud name**, **API key** and **API secret**.
3. Add them to `apps/website/.env.local`:

   ```bash
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```

4. Restart `pnpm dev`.

## Two cloud names: why

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (Tier 1) is where the site **reads** images from. Keep it as `doqsecks2`, the production site's public image account, so the seeded content shows its images.
- `CLOUDINARY_*` (this page) is where **your uploads** go: your own account.

Uploads save an image path, and the site builds the URL from `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`. So with the default setting, **an image you upload won't display**: the site looks for it in `doqsecks2`. To check an upload end to end:

1. Temporarily set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` to **your** cloud name and restart `pnpm dev`.
2. Upload and check your image. While you do, seeded images won't load. That's expected.
3. Set it back to `doqsecks2` when you're done.

✅ **You should now see** an upload in the admin panel (for example a scholarship logo) succeed, and the file appear in your Cloudinary **Media Library** under the `ralevel/` folder.
