const express = require("express");
const multer = require("multer");

const { getAllLists, createList, getListById } = require("./controllers/list");
const { addUsers } = require("./controllers/user");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./temp");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.post("/lists", createList);

router.get("/lists", getAllLists);
router.get("/lists/:listId", getListById);

router.post("/lists/:listId/users", upload.single("users"), addUsers);

module.exports = router;
