import path from "node:path";
import { FileArray } from "express-fileupload";
import { v4 as uuidV4 } from "uuid";

const defaultExtensions = [".jpg", ".jpeg", ".png"];

const mimeTypesByExtension: Record<string, string[]> = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".txt": ["text/plain"],
  ".md": ["text/markdown", "text/x-markdown", "text/plain"],
  ".pdf": ["application/pdf"],
};

const formatExtensions = (extensions: string[]) => {
  const names = extensions.map((extension) =>
    extension.replace(/^\./, "").toUpperCase(),
  );
  const last = names.pop();

  return names.length ? `${names.join(", ")} or ${last}` : last;
};

export const uploadFile = async (
  files: FileArray | null | undefined,
  validExtensions: string[] = defaultExtensions,
  folder = "",
): Promise<string> => {
  const uploaded = files?.file;

  if (!uploaded) {
    throw new Error("No file was uploaded");
  }

  if (Array.isArray(uploaded)) {
    throw new Error("Only one file is allowed");
  }

  const normalizedExtensions = validExtensions.map(
    (extension) => `.${extension.replace(/^\./, "").toLowerCase()}`,
  );
  const extension = path.extname(uploaded.name).toLowerCase();
  const validMimeTypes = mimeTypesByExtension[extension] ?? [];

  if (
    !normalizedExtensions.includes(extension) ||
    !validMimeTypes.includes(uploaded.mimetype)
  ) {
    throw new Error(
      `Only ${formatExtensions(normalizedExtensions)} files are allowed.`,
    );
  }

  const fileName = `${uuidV4()}${extension}`;
  const uploadsRoot = path.resolve("uploads");
  const uploadsDirectory = path.resolve(uploadsRoot, folder);

  if (
    uploadsDirectory !== uploadsRoot &&
    !uploadsDirectory.startsWith(`${uploadsRoot}${path.sep}`)
  ) {
    throw new Error("Invalid upload folder");
  }

  await uploaded.mv(path.join(uploadsDirectory, fileName));

  return fileName;
};
