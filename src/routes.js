const express = require("express");
const multer = require("multer");

const { getAllLists, createList, getListById } = require("./controllers/list");
const { addUsers } = require("./controllers/user");
const { sendMailToList } = require("./controllers/mail");
const { authorize } = require("./middlewares/auth");

const router = express.Router();

// Save CSV files temporarily to /temp. File will not get deleted automatically
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

router.post("/lists/:listId/mail", authorize, sendMailToList);

module.exports = router;
