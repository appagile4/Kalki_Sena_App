const Book = require("../models/Book");
const BookOrder = require("../models/BookOrder");
const { uploadBookCoverToCloudinary } = require("../services/cloudinaryService");

// Default initial book payload matching the frontend UI (Screens/E-Book/bookDetails.tsx)
const DEFAULT_BOOK = {
  title: "Economic Revolution to make Nepal A World Leader",
  subtitle: "Buy the Book. Build a Gen Z Wave.",
  author: "Jay Sah (MR. 666)",
  coAuthor: "Dr. Uma Shankar Prasad (Economist, T.V.)",
  price: 1000,
  currency: "NPR",
  coverImage: "/assets/images/bookcover.png",
  authorAvatar: "/assets/images/avatar.png",
  rating: 4.3,
  totalReviews: 248,
  totalSold: 12480,
  targetGoal: 1000000,
  stockQuantity: 50000,
  whyBuy: {
    title: "Why you will buy this Book?",
    leadText:
      "Buy the Book. Build a Gen Z Wave. If you live outside of valley, By buying this book, you help create a Gen Z wave of 1 lakh students who will receive free coaching in Kathmandu Valley.",
    points: [
      "100% of book profit will be donated to the coaching center",
      "1,000+ teachers will be employed to educate students for free",
      "The goal is free healthcare, education, and legal services for life",
      "After 10 lakh books are sold nationwide, within 30 days the Kalkiism Research and Training Center guarantees a central government that will implement economic policies to provide free health, education, and legal services to all 3 crore Nepalis.",
    ],
    highlight: "One book. One movement. One future.",
  },
  aboutText:
    "Economic Revolution to make Nepal A World Leader outlines systematic economic reforms, free universal healthcare, digital public infrastructure, and youth empowerment across Nepal.",
  summaryText:
    "After 10 lakh books are sold nationwide, within 30 days the Kalkiism Research and Training Center guarantees a central government that will implement economic policies to provide free health, education, and legal services to all 3 crore Nepalis.",
  appearances: ["physical", "digital"],
  pickupClinics: [
    {
      id: "clinic_1",
      name: "Kalki Clinic - Baneshwor Branch",
      branch: "New Baneshwor",
      distance: "1.2 Km away",
      timing: "9 AM - 6 PM",
      address: "New Baneshwor Chowk, Kathmandu",
      phone: "+977-1-4782101",
      city: "Kathmandu",
      latitude: 27.6915,
      longitude: 85.342,
    },
    {
      id: "clinic_2",
      name: "Kalki Sena Clinic - Old Baneshwor Branch",
      branch: "Old Baneshwor",
      distance: "1.8 Km away",
      timing: "9 AM - 6 PM",
      address: "Purano Baneshwor, Kathmandu",
      phone: "+977-1-4782102",
      city: "Kathmandu",
      latitude: 27.7011,
      longitude: 85.3444,
    },
    {
      id: "clinic_3",
      name: "Kalki Clinic - Maitighar Branch",
      branch: "Maitighar",
      distance: "2.5 Km away",
      timing: "9 AM - 6 PM",
      address: "Maitighar Mandala, Kathmandu",
      phone: "+977-1-4265432",
      city: "Kathmandu",
      latitude: 27.6938,
      longitude: 85.3206,
    },
    {
      id: "clinic_4",
      name: "Kalki Clinic - Putalisadak Branch",
      branch: "Putalisadak",
      distance: "3.2 Km away",
      timing: "9 AM - 6 PM",
      address: "Putalisadak Plaza, Kathmandu",
      phone: "+977-1-4228911",
      city: "Kathmandu",
      latitude: 27.705,
      longitude: 85.32,
    },
    {
      id: "clinic_5",
      name: "Kalki Clinic - Jawalakhel Branch",
      branch: "Jawalakhel",
      distance: "4.5 Km away",
      timing: "9 AM - 6 PM",
      address: "Jawalakhel Roundabout, Lalitpur",
      phone: "+977-1-5541234",
      city: "Lalitpur",
      latitude: 27.6727,
      longitude: 85.3142,
    },
  ],
  chapters: [
    {
      chapterNumber: 1,
      title: "Chapter 1 | The Hope",
      pageRange: "Page No: 12 - 50",
      excerpt:
        "The fundamental vision behind mobilization of youth and education reforms to foster nationwide innovation.",
    },
    {
      chapterNumber: 2,
      title: "Chapter 2 | The Vision & Policy",
      pageRange: "Page No: 51 - 98",
      excerpt:
        "Detailed framework on monetary policies, healthcare infrastructure, and employment generation for 1,000+ teachers.",
    },
    {
      chapterNumber: 3,
      title: "Chapter 3 | Economic Revolution",
      pageRange: "Page No: 99 - 145",
      excerpt:
        "The strategic roadmap towards making Nepal economically self-reliant and a global leader through Gen Z unity.",
    },
  ],
  reviews: [
    {
      reviewerName: "John Wattson",
      rating: 4.3,
      heading: "Amazing and Intellectual Book",
      comment:
        "A ground-breaking blueprint for education and public healthcare. Highly inspirational read for the youth.",
      createdAt: new Date(),
    },
    {
      reviewerName: "Rajesh Shrestha",
      rating: 5.0,
      heading: "A Visionary Path for Nepal's Future",
      comment:
        "Jay Sah has captured the exact economic requirements to transform our country. Must read for every Nepali citizen.",
      createdAt: new Date(),
    },
  ],
  promoVideo: {
    title: "Message form MR.666",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
    description:
      "Official revolutionary video message from Kalki Sena founder Jay Sah (MR. 666).",
  },
};

// GET /api/books
exports.getBooks = async (req, res, next) => {
  try {
    let books = await Book.find().sort({ createdAt: -1 });

    // Seed default book if database has none
    if (books.length === 0) {
      const created = await Book.create(DEFAULT_BOOK);
      books = [created];
    } else {
      const primary = books[0];
      let needsSave = false;

      // Ensure primary book has updated branches with coordinates
      if (
        !primary.pickupClinics ||
        primary.pickupClinics.length === 0 ||
        !primary.pickupClinics[0].latitude
      ) {
        primary.pickupClinics = DEFAULT_BOOK.pickupClinics;
        needsSave = true;
      }

      // Ensure primary book has promoVideo populated
      if (!primary.promoVideo || !primary.promoVideo.videoUrl) {
        primary.promoVideo = DEFAULT_BOOK.promoVideo;
        needsSave = true;
      }

      if (needsSave) {
        await primary.save();
        books[0] = primary;
      }
    }

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/books/promo-video
exports.getPromoVideo = async (req, res, next) => {
  try {
    const book = await Book.findOne();
    const promo =
      book && book.promoVideo && book.promoVideo.videoUrl
        ? book.promoVideo
        : DEFAULT_BOOK.promoVideo;

    res.status(200).json({
      success: true,
      data: promo,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/books/promo-video
exports.updatePromoVideo = async (req, res, next) => {
  try {
    const { title, videoUrl, thumbnailUrl, description } = req.body;
    let book = await Book.findOne();
    if (!book) {
      book = await Book.create({
        ...DEFAULT_BOOK,
        promoVideo: { title, videoUrl, thumbnailUrl, description },
      });
    } else {
      book.promoVideo = {
        title: title || book.promoVideo?.title || "Message form MR.666",
        videoUrl: videoUrl || book.promoVideo?.videoUrl,
        thumbnailUrl: thumbnailUrl || book.promoVideo?.thumbnailUrl,
        description: description || book.promoVideo?.description,
      };
      await book.save();
    }

    res.status(200).json({
      success: true,
      message: "Promo video updated successfully",
      data: book.promoVideo,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/books/clinics
exports.getClinics = async (req, res, next) => {
  try {
    const book = await Book.findOne();
    const clinics =
      book && book.pickupClinics && book.pickupClinics.length > 0
        ? book.pickupClinics
        : DEFAULT_BOOK.pickupClinics;

    res.status(200).json({
      success: true,
      count: clinics.length,
      data: clinics,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/books/clinics (Superadmin update clinics)
exports.updateClinics = async (req, res, next) => {
  try {
    const { clinics } = req.body;
    let book = await Book.findOne();
    if (!book) {
      book = await Book.create({ ...DEFAULT_BOOK, pickupClinics: clinics });
    } else {
      book.pickupClinics = clinics;
      await book.save();
    }

    res.status(200).json({
      success: true,
      message: "Branches updated successfully",
      data: book.pickupClinics,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/books/clinics (Superadmin add clinic)
exports.addClinic = async (req, res, next) => {
  try {
    const {
      name,
      branch,
      distance,
      timing,
      address,
      phone,
      city,
      latitude,
      longitude,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Clinic branch name is required",
      });
    }

    let book = await Book.findOne();
    if (!book) {
      book = await Book.create({ ...DEFAULT_BOOK });
    }

    const newClinic = {
      id: "clinic_" + Date.now(),
      name: name.trim(),
      branch: branch ? branch.trim() : "",
      distance: distance ? distance.trim() : "1.0 Km away",
      timing: timing ? timing.trim() : "9 AM - 6 PM",
      address: address ? address.trim() : "",
      phone: phone ? phone.trim() : "+977-1-4782000",
      city: city ? city.trim() : "Kathmandu",
      latitude: Number(latitude) || 27.6915,
      longitude: Number(longitude) || 85.342,
    };

    book.pickupClinics.push(newClinic);
    await book.save();

    res.status(201).json({
      success: true,
      message: "Pickup clinic branch added successfully",
      data: book.pickupClinics,
      addedClinic: newClinic,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/books/clinics/:clinicId (Superadmin delete clinic)
exports.deleteClinic = async (req, res, next) => {
  try {
    const { clinicId } = req.params;
    let book = await Book.findOne();
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "No book found",
      });
    }

    const initialCount = book.pickupClinics.length;
    book.pickupClinics = book.pickupClinics.filter((c) => {
      const matchId = c.id && c.id.toString() === clinicId.toString();
      const matchMongoId = c._id && c._id.toString() === clinicId.toString();
      return !matchId && !matchMongoId;
    });

    if (book.pickupClinics.length === initialCount) {
      return res.status(404).json({
        success: false,
        message: `Clinic with ID '${clinicId}' was not found`,
      });
    }

    await book.save();

    res.status(200).json({
      success: true,
      message: "Pickup clinic branch removed successfully",
      data: book.pickupClinics,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/books/clinics/:clinicId (Superadmin update single clinic)
exports.updateSingleClinic = async (req, res, next) => {
  try {
    const { clinicId } = req.params;
    const updates = req.body;

    let book = await Book.findOne();
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "No book found",
      });
    }

    const clinicIndex = book.pickupClinics.findIndex((c) => {
      const matchId = c.id && c.id.toString() === clinicId.toString();
      const matchMongoId = c._id && c._id.toString() === clinicId.toString();
      return matchId || matchMongoId;
    });

    if (clinicIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Clinic with ID '${clinicId}' was not found`,
      });
    }

    const current = book.pickupClinics[clinicIndex];
    if (updates.name !== undefined) current.name = updates.name.trim();
    if (updates.branch !== undefined) current.branch = updates.branch.trim();
    if (updates.distance !== undefined) current.distance = updates.distance.trim();
    if (updates.timing !== undefined) current.timing = updates.timing.trim();
    if (updates.address !== undefined) current.address = updates.address.trim();
    if (updates.phone !== undefined) current.phone = updates.phone.trim();
    if (updates.city !== undefined) current.city = updates.city.trim();
    if (updates.latitude !== undefined) current.latitude = Number(updates.latitude);
    if (updates.longitude !== undefined) current.longitude = Number(updates.longitude);

    book.pickupClinics[clinicIndex] = current;
    await book.save();

    res.status(200).json({
      success: true,
      message: "Clinic updated successfully",
      data: book.pickupClinics,
      updatedClinic: current,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/books/:id
exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }
    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/books (Superadmin/Admin create)
exports.createBook = async (req, res, next) => {
  try {
    const newBook = await Book.create(req.body);
    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: newBook,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/books (Update primary book or create if none exists)
exports.updatePrimaryBook = async (req, res, next) => {
  try {
    let book = await Book.findOne();
    if (!book) {
      book = await Book.create({ ...DEFAULT_BOOK, ...req.body });
    } else {
      book = await Book.findByIdAndUpdate(book._id, req.body, {
        new: true,
        runValidators: true,
      });
    }
    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/books/:id (Superadmin/Admin update)
exports.updateBook = async (req, res, next) => {
  try {
    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/books/:id (Superadmin delete)
exports.deleteBook = async (req, res, next) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/books/orders (Create a new book purchase / order)
exports.createBookOrder = async (req, res, next) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      bookId,
      bookAppearance,
      pickupLocation,
      deliveryAddress,
      paymentMethod,
      bankDetails,
      amount = 1000,
      currency = "NPR",
    } = req.body;

    if (!customerName) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    if (!bookAppearance || !["physical", "digital"].includes(bookAppearance)) {
      return res.status(400).json({
        success: false,
        message: "Book appearance must be either 'physical' or 'digital'",
      });
    }

    if (
      !paymentMethod ||
      !["esewa", "khalti", "qr", "bank"].includes(paymentMethod)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method. Choose esewa, khalti, qr, or bank",
      });
    }

    // Generate unique order ID: KB-YYYYMMDD-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const orderId = `KB-${dateStr}-${randomSuffix}`;

    let bookTitle = "Economic Revolution to make Nepal A World Leader";
    let targetBookId = bookId;

    if (bookId) {
      const foundBook = await Book.findById(bookId);
      if (foundBook) {
        bookTitle = foundBook.title;
      }
    } else {
      const defaultBook = await Book.findOne();
      if (defaultBook) {
        targetBookId = defaultBook._id;
        bookTitle = defaultBook.title;
      }
    }

    const newOrder = await BookOrder.create({
      orderId,
      user: req.user ? req.user._id : null,
      customerName,
      customerEmail: customerEmail || (req.user ? req.user.email : ""),
      customerPhone: customerPhone || (req.user ? req.user.phone : ""),
      book: targetBookId,
      bookTitle,
      bookAppearance,
      pickupLocation:
        bookAppearance === "physical"
          ? pickupLocation || "Kalki Clinic - Baneshwor Branch"
          : "Digital In-App Access",
      deliveryAddress: deliveryAddress || "",
      paymentMethod,
      bankDetails: paymentMethod === "bank" ? bankDetails : null,
      amount: Number(amount) || 1000,
      currency,
      paymentStatus: "completed",
      orderStatus:
        bookAppearance === "physical" ? "ready_for_pickup" : "delivered",
    });

    // Increment totalSold in book record
    if (targetBookId) {
      await Book.findByIdAndUpdate(targetBookId, {
        $inc: { totalSold: 1 },
      });
    }

    res.status(201).json({
      success: true,
      message: "Book ordered successfully",
      data: newOrder,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/books/orders (List all book orders)
exports.getAllBookOrders = async (req, res, next) => {
  try {
    const { appearance, paymentMethod, status } = req.query;
    const filter = {};

    if (appearance) filter.bookAppearance = appearance;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (status) filter.orderStatus = status;

    const orders = await BookOrder.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", "fullName email phone role");

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/books/orders/:id/status (Update order status)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const update = {};
    if (orderStatus) update.orderStatus = orderStatus;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const order = await BookOrder.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/books/stats (Aggregated analytics for Superadmin Dashboard)
exports.getBookStats = async (req, res, next) => {
  try {
    const book = await Book.findOne();
    const totalOrdersCount = await BookOrder.countDocuments();
    const physicalCount = await BookOrder.countDocuments({
      bookAppearance: "physical",
    });
    const digitalCount = await BookOrder.countDocuments({
      bookAppearance: "digital",
    });

    const revenueAggregation = await BookOrder.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    ]);

    const totalRevenue =
      revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;
    const totalSold = (book ? book.totalSold : 0) + totalOrdersCount;
    const targetGoal = book ? book.targetGoal : 1000000;
    const progressPercent = Math.min(
      100,
      parseFloat(((totalSold / targetGoal) * 100).toFixed(2))
    );

    res.status(200).json({
      success: true,
      data: {
        totalSold,
        targetGoal,
        progressPercent,
        totalOrdersCount,
        physicalCount,
        digitalCount,
        totalRevenueNPR: totalRevenue + totalSold * 1000,
        currency: "NPR",
        bookPrice: book ? book.price : 1000,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/books/upload-cover (Upload cover image via file or base64)
exports.uploadBookCover = async (req, res, next) => {
  try {
    let coverUrl = null;

    if (req.file) {
      try {
        const uploadResult = await uploadBookCoverToCloudinary(req.file.buffer);
        coverUrl = uploadResult.url;
      } catch (cloudErr) {
        console.warn(
          "Cloudinary upload failed, falling back to data URI:",
          cloudErr.message
        );
        coverUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
          "base64"
        )}`;
      }
    } else if (req.body.image) {
      try {
        const uploadResult = await uploadBookCoverToCloudinary(req.body.image);
        coverUrl = uploadResult.url;
      } catch (cloudErr) {
        console.warn(
          "Cloudinary upload failed, keeping provided image URL/base64:",
          cloudErr.message
        );
        coverUrl = req.body.image;
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Please provide an image file or base64 image data",
      });
    }

    let book = await Book.findOne();
    if (book) {
      book.coverImage = coverUrl;
      await book.save();
    }

    res.status(200).json({
      success: true,
      message: "Book cover uploaded successfully",
      coverUrl,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};
