import DataUriParser from 'datauri/parser';
import path from "path";

const parsor = new DataUriParser();

const getDataUri = (file) => {
  return parsor.format(path.extname(file.originalname).toLowerCase(), file.buffer).content;
};

export default getDataUri;