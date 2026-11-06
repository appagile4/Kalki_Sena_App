const express = require("express");
const router = express.Router();
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  updatePrimaryBook,
  deleteBook,
  createBookOrder,
  getAllBookOrders,
  updateOrderStatus,
  getBookStats,
  uploadBookCover,
  getClinics,
  updateClinics,
  addClinic,
  deleteClinic,
  updateSingleClinic,
  getPromoVideo,
  updatePromoVideo,
} = require("../controllers/bookController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public Book Information & Stats
router.get("/", getBooks);
router.get("/stats", getBookStats);
// Clinics Management
router.get("/clinics", getClinics);
router.put("/clinics", updateClinics);
router.post("/clinics", addClinic);
router.delete("/clinics/:clinicId", deleteClinic);
router.patch("/clinics/:clinicId", updateSingleClinic);
router.get("/promo-video", getPromoVideo);
router.put("/promo-video", updatePromoVideo);
router.get("/:id", getBookById);

// Cover Image Upload
router.post("/upload-cover", upload.single("coverImage"), uploadBookCover);

// Book Ordering (Users / Public App Booking)
router.post("/orders", createBookOrder);

// Superadmin / Administrative Controls
router.get("/orders/all", getAllBookOrders);
router.patch("/orders/:id/status", updateOrderStatus);

// Book Management
router.put("/", updatePrimaryBook);
router.put("/:id", updateBook);
router.post("/", createBook);
router.delete("/:id", deleteBook);

module.exports = router;
