import fs from "node:fs";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { RequestHandler, Response } from "express";
import sharp from "sharp";
import { uploadFile } from "@helpers";
import { Product, User } from "@models";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const COLLECTIONS = ["users", "products"] as const;
type Collection = (typeof COLLECTIONS)[number];

const placeholderPath = path.resolve("public", "No_Image_Available.jpg");

const isCollection = (value: string): value is Collection =>
  COLLECTIONS.includes(value as Collection);

const getParam = (value: string | string[]) =>
  Array.isArray(value) ? (value[0] ?? "") : value;

const findModel = async (collection: Collection, id: string) => {
  switch (collection) {
    case "users":
      return User.findById(id);
    case "products":
      return Product.findById(id);
  }
};

const sendThumbnail = async (res: Response, imagePath: string) => {
  const thumbnail = await sharp(imagePath)
    .rotate()
    .resize({
      width: 200,
      height: 200,
      fit: "cover",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 75 })
    .toBuffer();

  return res.type("image/jpeg").send(thumbnail);
};

const getCloudinaryPublicId = (imageUrl: string) => {
  const parts = imageUrl.split("/");
  const fileName = parts[parts.length - 1];
  return fileName?.replace(/\.[^.]+$/, "");
};

const removeLocalImage = (
  collection: Collection,
  imageName?: string | null,
) => {
  if (!imageName) return;

  const imagePath = path.resolve(
    "uploads",
    collection,
    path.basename(imageName),
  );

  if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
};

export const loadFiles: RequestHandler = async (req, res) => {
  try {
    const name = await uploadFile(req.files, undefined, "imgs");

    return res.json({
      message: "File uploaded successfully",
      name,
    });
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : "File upload failed",
    });
  }
};

export const updateFiles: RequestHandler = async (req, res) => {
  const collection = getParam(req.params.collection);
  const id = getParam(req.params.id);

  if (!isCollection(collection)) {
    return res.status(400).json({ message: "Collection is not allowed" });
  }

  const model = await findModel(collection, id);

  if (!model) {
    return res.status(404).json({
      message: `${collection.slice(0, -1)} doesn't exist`,
      collection,
      id,
    });
  }

  const previousImage = model.image;
  model.image = await uploadFile(req.files, undefined, collection);
  await model.save();
  removeLocalImage(collection, previousImage);

  return res.json({
    message: "File uploaded successfully",
    model,
  });
};

export const updateImageCloudinary: RequestHandler = async (req, res) => {
  const collection = getParam(req.params.collection);
  const id = getParam(req.params.id);

  if (!isCollection(collection)) {
    return res.status(400).json({ message: "Collection is not allowed" });
  }

  const model = await findModel(collection, id);

  if (!model) {
    return res.status(404).json({
      message: `${collection.slice(0, -1)} doesn't exist`,
      collection,
      id,
    });
  }

  const file = req.files?.file;

  if (!file || Array.isArray(file)) {
    return res.status(400).json({
      message: "Debe subir exactamente un archivo",
    });
  }

  const previousPublicId = model.image
    ? getCloudinaryPublicId(model.image)
    : undefined;
  const uploadedImage = await cloudinary.uploader.upload(file.tempFilePath);

  model.image = uploadedImage.secure_url;
  await model.save();

  if (previousPublicId) {
    await cloudinary.uploader.destroy(previousPublicId);
  }

  return res.json({
    message: "File uploaded successfully",
    model,
  });
};

export const showImage: RequestHandler = async (req, res) => {
  const collection = getParam(req.params.collection);
  const id = getParam(req.params.id);

  if (!isCollection(collection)) {
    return res.status(400).json({ message: "Collection is not allowed" });
  }

  const model = await findModel(collection, id);

  if (model?.image) {
    const imagePath = path.resolve(
      "uploads",
      collection,
      path.basename(model.image),
    );

    if (fs.existsSync(imagePath)) {
      try {
        return await sendThumbnail(res, imagePath);
      } catch {
        // Fall through to the placeholder when the image is invalid.
      }
    }
  }

  return sendThumbnail(res, placeholderPath);
};

export const showImageByCloudinary: RequestHandler = async (req, res) => {
  const collection = getParam(req.params.collection);
  const id = getParam(req.params.id);

  if (!isCollection(collection)) {
    return res.status(400).json({ message: "Collection is not allowed" });
  }

  const model = await findModel(collection, id);

  if (!model) {
    return res.status(404).json({
      message: `${collection.slice(0, -1)} doesn't exist`,
      id,
    });
  }

  if (model.image) return res.redirect(model.image);

  return sendThumbnail(res, placeholderPath);
};
