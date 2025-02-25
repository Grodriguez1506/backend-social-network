import { dirname, join } from "path";
import { fileURLToPath } from "url";

const getRootPath = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  return __dirname;
};

export default {
  getRootPath,
};
