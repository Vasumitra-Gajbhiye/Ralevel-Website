# Google Drive

**Tier 3. Ask the owner first, and you can probably skip it.** Right now the only code that uses Google Drive is the test route `/api/test-drive`. Nothing on the site breaks without it.

If a task does need it:

1. In the [Google Cloud console](https://console.cloud.google.com), create a project and enable the **Google Drive API**.
2. **IAM & Admin → Service Accounts → Create service account.** Then **Keys → Add key → JSON** downloads a key file. Treat it like a password: never put it in the repo folder, and never commit it.
3. In Google Drive, create a folder and **share it with the service account's email** (it ends in `iam.gserviceaccount.com`) as an Editor. The folder ID is the last part of the folder's URL.
4. In `apps/website/.env.local`, put the **whole JSON key on one line**, then restart `pnpm dev`:

   ```bash
   GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...",...}
   DRIVE_ROOT_FOLDER_ID=...
   ```

✅ **You should now see** `/api/test-drive` list the files in your shared folder instead of returning an error.
