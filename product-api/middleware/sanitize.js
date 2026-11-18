// Object ke andar se wo keys hata deta hai jo $ se shuru hon ya jinme . ho
const clean = (value) => {
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete value[key];
      } else {
        clean(value[key]);
      }
    }
  }
  return value;
};

const sanitizeInput = (req, res, next) => {
  if (req.body) clean(req.body);
  next();
};

module.exports = sanitizeInput;