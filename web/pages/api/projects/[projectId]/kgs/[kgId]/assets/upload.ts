import formidable from "formidable";
import fs from "fs/promises";
import { NextApiRequest, NextApiResponse } from "next";
import type { ApiRes } from "@/types/api";
import { createId } from "@paralleldrive/cuid2";
import { config as appConfig } from "@/config";

export const config = {
  api: {
    bodyParser: false,
  },
};

const saveFile = async (file: formidable.File[], directory: string) => {
  const data = await fs.readFile(file[0].filepath);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(`${directory}/${file[0].originalFilename}`, data);
  await fs.unlink(file[0].filepath);
};

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<string>>
) => {
  if (req.method === "POST") {
    const projectId = req.query.projectId as string;
    const kgId = req.query.kgId as string;
    const uploadId = createId();

    const filePath = `../.etc/${appConfig.assetUploadPath}/${projectId}/${kgId}/${uploadId}`;
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    if (!files.file) {
      return res.status(400).send({
        success: false,
        error: "No file in request",
      });
    }

    if (files.file && files.file.length > 0)
      await saveFile(files.file, filePath);
    return res.status(201).send({
      success: true,
      data: uploadId,
    });
  }
};
