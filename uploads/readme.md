# Uploads

This folder stores files sent to the API upload endpoint.

## How it works

1. The client sends a file as `multipart/form-data` using the `file` field.
2. `express-fileupload` receives the file and temporarily stores it in `/tmp`.
3. `helpers/upload-file.ts` ensures that only one file was provided and validates its extension and MIME type.
4. The helper generates a unique UUID filename while preserving the original extension.
5. `file.mv()` moves the temporary file into a subfolder under `uploads`.

The `createParentPath: true` option from `express-fileupload` automatically creates missing destination folders.

Example:

```text
uploads/
├── imgs/
│   └── <uuid>.jpg
└── textos/
    └── <uuid>.md
```

## Using the helper

```ts
await uploadFile(req.files, ["jpg", "jpeg", "png"], "imgs");
await uploadFile(req.files, ["txt", "md"], "textos");
```

Do not trust filenames supplied by clients. Allowed extensions and MIME types must be declared in the helper before accepting a new file format.
