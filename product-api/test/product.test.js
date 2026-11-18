process.env.NODE_ENV = "test";

const { describe, test, before, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const Product = require("../models/Product");
const Category = require("../models/Category");

const API_KEY = process.env.API_KEY;
const TEST_DB_URI =
  process.env.MONGO_URI_TEST || "mongodb://127.0.0.1:27017/product_db_test";

const sampleProduct = {
  name: "Laptop",
  price: 85000,
  category: "electronics",
  stock: 3,
  sku: "lap-001",
};

// ---- Helpers ----
const createProduct = (data = sampleProduct) =>
  request(app).post("/api/products").set("x-api-key", API_KEY).send(data);

const createCategory = (data) =>
  request(app).post("/api/categories").set("x-api-key", API_KEY).send(data);

// ---- Setup / Cleanup ----
before(async () => {
  if (!API_KEY) {
    throw new Error("API key .env me nahi mili, test file me process.env.API_KEY ka naam check karo");
  }
  if (!TEST_DB_URI.includes("test")) {
    throw new Error("Test database ke naam me 'test' hona chahiye, asli data bachane ke liye");
  }
  await mongoose.connect(TEST_DB_URI, { serverSelectionTimeoutMS: 10000 });
  await Product.init();
  await Category.init();
});

beforeEach(async () => {
  await Product.deleteMany({});
  await Category.deleteMany({});
});

after(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
  }
  await mongoose.disconnect();
});

// ---- Tests ----
describe("POST /api/products", () => {
  test("API key ke bagair 401 ya 403 aata hai", async () => {
    const res = await request(app).post("/api/products").send(sampleProduct);
    assert.ok([401, 403].includes(res.statusCode));
  });

  test("sahi data se product ban jata hai (201)", async () => {
    const res = await createProduct();
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.data.name, "Laptop");
    assert.equal(res.body.data.sku, "LAP-001");
    assert.equal(res.body.data.priceWithTax, 99450);
    assert.ok(res.body.data.createdAt);
  });

  test("ghalat data par 400 aur messages aate hain", async () => {
    const res = await createProduct({ price: -5, category: "toys" });
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.errors.length, 3);
  });

  test("duplicate sku par 409 aata hai", async () => {
    await createProduct();
    const res = await createProduct();
    assert.equal(res.statusCode, 409);
    assert.match(res.body.message, /pehle se maujood/);
  });

  test("ghalat categoryId par 400 aata hai", async () => {
    const res = await createProduct({ ...sampleProduct, categoryId: "000000000000000000000000" });
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, "Category nahi mili");
  });
});

describe("GET /api/products", () => {
  beforeEach(async () => {
    await createProduct();
    await createProduct({ name: "Mouse", price: 1500, sku: "mou-001" });
  });

  test("sab products wapas aate hain", async () => {
    const res = await request(app).get("/api/products");
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.count, 2);
  });

  test("naam se search chalta hai", async () => {
    const res = await request(app).get("/api/products?name=lap");
    assert.equal(res.body.count, 1);
    assert.equal(res.body.data[0].name, "Laptop");
  });

  test("price se sort chalta hai", async () => {
    const res = await request(app).get("/api/products?sort=price");
    assert.equal(res.body.data[0].name, "Mouse");
  });
});

describe("GET /api/products/:id", () => {
  test("sahi id par product milta hai", async () => {
    const created = await createProduct();
    const res = await request(app).get(`/api/products/${created.body.data._id}`);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.stockStatus, "low stock");
  });

  test("ghalat id format par 400 aata hai", async () => {
    const res = await request(app).get("/api/products/123");
    assert.equal(res.statusCode, 400);
  });

  test("maujood na hone par 404 aata hai", async () => {
    const res = await request(app).get("/api/products/000000000000000000000000");
    assert.equal(res.statusCode, 404);
  });
});

describe("PUT /api/products/:id", () => {
  test("price update ho jati hai", async () => {
    const created = await createProduct();
    const res = await request(app)
      .put(`/api/products/${created.body.data._id}`)
      .set("x-api-key", API_KEY)
      .send({ price: 80000 });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.price, 80000);
    assert.equal(res.body.data.name, "Laptop");
  });

  test("negative price par 400 aata hai", async () => {
    const created = await createProduct();
    const res = await request(app)
      .put(`/api/products/${created.body.data._id}`)
      .set("x-api-key", API_KEY)
      .send({ price: -5 });
    assert.equal(res.statusCode, 400);
  });

  test("NoSQL injection wali body par 400 aata hai aur price nahi badalti", async () => {
    const created = await createProduct();
    const id = created.body.data._id;
    const res = await request(app)
      .put(`/api/products/${id}`)
      .set("x-api-key", API_KEY)
      .send({ price: { $gt: 0 } });
    assert.equal(res.statusCode, 400);
    const check = await request(app).get(`/api/products/${id}`);
    assert.equal(check.body.data.price, 85000);
  });
});

describe("DELETE /api/products/:id", () => {
  test("delete hone ke baad product nahi milta", async () => {
    const created = await createProduct();
    const id = created.body.data._id;

    const del = await request(app).delete(`/api/products/${id}`).set("x-api-key", API_KEY);
    assert.equal(del.statusCode, 200);

    const res = await request(app).get(`/api/products/${id}`);
    assert.equal(res.statusCode, 404);
  });
});

describe("Category aur populate", () => {
  test("product ke saath category ka naam populate hota hai", async () => {
    const cat = await createCategory({ name: "Electronics", description: "Gadgets" });
    assert.equal(cat.statusCode, 201);

    const prod = await createProduct({ ...sampleProduct, categoryId: cat.body.data._id });
    const res = await request(app).get(`/api/products/${prod.body.data._id}`);

    assert.equal(res.body.data.categoryId.name, "Electronics");
  });

  test("duplicate category naam par 409 aata hai", async () => {
    await createCategory({ name: "Electronics" });
    const res = await createCategory({ name: "Electronics" });
    assert.equal(res.statusCode, 409);
  });
});

describe("Aam routes", () => {
  test("ghalat route par 404 aata hai", async () => {
    const res = await request(app).get("/api/product");
    assert.equal(res.statusCode, 404);
  });
});
