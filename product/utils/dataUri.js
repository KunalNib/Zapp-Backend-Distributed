import DataUriParser from 'datauri/parser.js';
import path from "path";

const parsor = new DataUriParser();

const getDataUri = (file) => {
  return parsor.format(path.extname(file.originalname).toLowerCase(), file.buffer).content;
};

export default getDataUri;