const { google } = require("googleapis");
const drive = google.drive("v3");
const { Readable } = require("stream");

async function listFiles(parentId) {
  const res = await drive.files.list({
    q: `'${parentId}' in parents and trashed=false`,
    fields: "files(id,name,mimeType,webViewLink)",
    key: process.env.GOOGLE_API_KEY
  });

  return res.data.files;
}

async function downloadFile(fileId) {
  const res = await drive.files.get(
    { fileId, alt: "media", key: process.env.GOOGLE_API_KEY },
    { responseType: "text" }
  );
  return res.data;
}

const auth = new google.auth.GoogleAuth({
  keyFile: "service-account.json",
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const driveAuth = google.drive({
  version: "v3",
  auth,
});

async function createFolder(name, parentId) {
  const res = await driveAuth.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentId ? [parentId] : [],
    },
    fields: "id,name",
  });

  return res.data;
}

async function uploadCsv({ folderId, filename, content }) {
  const stream = Readable.from(content);

  const res = await driveAuth.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: {
      mimeType: "text/csv",
      body: stream,
    },
    fields: "id,name,webViewLink",
  });

  return res.data;
}

async function uploadCsvToDrive(folderId, filename, csv) {
  const res = await drive.files.create({
    requestBody: {
      name: filename,
      mimeType: "text/csv",
      parents: [folderId],
    },
    media: {
      mimeType: "text/csv",
      body: csv,
    },
    fields: "id, name, webViewLink",
    key: process.env.GOOGLE_API_KEY,
  });

  return res.data
}


module.exports = {listFiles,downloadFile, createFolder,uploadCsv,uploadCsvToDrive};

