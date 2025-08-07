const {
  Accommodation,
  User,
  Favorite,
  AccommodationPriceHistory,
  sequelize,
  RentalContract,
  Amenity,
  Review,
} = require("../models");
const { Op } = require("sequelize");
const asyncHandler = require("express-async-handler");
const AccommodationService = require("../services/accommodationService");

/**
 * @swagger
 * /api/accommodations:
 *   post:
 *     summary: Create new accommodation
 *     description: Creates a new accommodation listing. Only authenticated users can create.
 *     tags: [Accommodations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               price:
 *                 type: number
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [available, rented, pending, unavailable, under_maintenance]
 *     responses:
 *       201:
 *         description: Accommodation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Accommodation'
 *       400:
 *         description: Invalid input or error
 */
const createAccommodation = async (req, res) => {
  try {
    const accommodation = await Accommodation.create({
      ...req.body,
      ownerId: req.user.id,
    });

    res.status(201).json(accommodation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/accommodations:
 *   get:
 *     summary: Get all accommodations
 *     description: Retrieves a list of all accommodations, with optional filters.
 *     tags: [Accommodations]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *       - in: query
 *         name: amenities
 *         schema:
 *           type: string
 *         description: Comma-separated list of amenities
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, rented, pending, unavailable, under_maintenance]
 *         description: Accommodation status
 *     responses:
 *       200:
 *         description: List of accommodations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Accommodation'
 *       400:
 *         description: Error occurred
 */
const getAccommodations = asyncHandler(async (req, res) => {
  const { city, minPrice, maxPrice, amenities, status, page, limit } =
    req.query;

  const userId = req.user ? req.user.id : null;

  const result = await AccommodationService.searchAccommodations({
    filters: { city, minPrice, maxPrice, amenities, status },
    pagination: { page, limit },
    userId,
  });

  res.json(result);
});

/**
 * @swagger
 * /api/accommodations/{id}:
 *   get:
 *     summary: Get single accommodation
 *     description: Retrieves details of a specific accommodation by ID.
 *     tags: [Accommodations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Accommodation ID
 *     responses:
 *       200:
 *         description: Accommodation details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Accommodation'
 *       404:
 *         description: Accommodation not found
 *       400:
 *         description: Error occurred
 */
const getAccommodation = asyncHandler(async (req, res) => {
  const accommodation = await Accommodation.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: "accommodationOwner",
        attributes: ["id", "username", "email", "phone"],
      },
      {
        model: Amenity,
        as: "amenityList",
        attributes: ["name"],
        through: { attributes: [] },
      },
      {
        model: Review,
        as: "reviews",
        attributes: ["id", "rating", "comment", "createdAt"],
        include: {
          model: User,
          as: "reviewUser",
          attributes: ["id", "username"],
        },
      },
    ],
  });

  if (!accommodation) {
    return res.status(404).json({ error: "Accommodation not found" });
  }

  const accommodationData = accommodation.toJSON();

  let isFavorite = false;
  if (req.user) {
    const favorite = await Favorite.findOne({
      where: {
        userId: req.user.id,
        accommodationId: accommodation.id,
      },
    });
    isFavorite = !!favorite;
  }
  accommodationData.isFavorite = isFavorite;

  accommodationData.amenities = Array.isArray(accommodationData.amenities)
    ? accommodationData.amenities
    : [];
  accommodationData.images = Array.isArray(accommodationData.images)
    ? accommodationData.images
    : [];
  accommodationData.roomType = Array.isArray(accommodationData.roomType)
    ? accommodationData.roomType
    : [];

  accommodationData.rating = accommodationData.averageRating;
  accommodationData.reviewCount = accommodationData.numberOfReviews;

  res.json(accommodationData);
});

/**
 * @swagger
 * /api/accommodations/{id}:
 *   put:
 *     summary: Update accommodation
 *     description: Updates an existing accommodation. Only the owner or an admin can update.
 *     tags: [Accommodations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Accommodation ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               amenities:
 *                 type: string
 *               existingImages:
 *                 type: string
 *                 description: A JSON string array of existing image URLs to keep.
 *     responses:
 *       200:
 *         description: Accommodation updated successfully
 *       403:
 *         description: User not authorized to update
 *       404:
 *         description: Accommodation not found
 */
const updateAccommodation = asyncHandler(async (req, res) => {
  console.log("[DEBUG] Bắt đầu updateAccommodation", {
    params: req.params,
    body: req.body,
    files: req.files?.length,
  });
  const { id } = req.params;
  // Destructure all expected fields from the form
  const {
    title,
    description,
    price,
    roomType,
    address,
    city,
    state,
    zipCode,
    amenities,
    existingImages,
    latitude,
    longitude,
  } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  const accommodation = await Accommodation.findByPk(id);

  if (!accommodation) {
    return res.status(404).json({ message: "Không tìm thấy nhà trọ" });
  }

  // Check if user is the owner or an admin
  if (accommodation.ownerId !== userId && userRole !== "admin") {
    return res
      .status(403)
      .json({ message: "Bạn không có quyền chỉnh sửa nhà trọ này" });
  }

  // Handle image updates
  let updatedImages = [];
  if (existingImages) {
    try {
      // If existingImages is not an empty string, parse it.
      updatedImages = existingImages ? JSON.parse(existingImages) : [];
    } catch (e) {
      return res
        .status(400)
        .json({ message: "Định dạng existingImages không hợp lệ." });
    }
  }

  if (req.files && req.files.length > 0) {
    const newImageUrls = req.files.map((file) => file.path); // Assuming 'file.path' contains the URL from Cloudinary
    updatedImages.push(...newImageUrls);
  }

  // Prepare the data for update, ensuring not to pass undefined values for fields that might not be present
  let parsedRoomType = accommodation.roomType;
  if (roomType) {
    try {
      parsedRoomType = JSON.parse(roomType);
    } catch (e) {
      console.error("[ERROR] roomType không phải JSON hợp lệ:", roomType);
      return res
        .status(400)
        .json({ message: "Định dạng roomType không hợp lệ." });
    }
  }

  let parsedAmenities = accommodation.amenities;
  if (amenities) {
    try {
      parsedAmenities = JSON.parse(amenities);
    } catch (e) {
      console.error("[ERROR] amenities không phải JSON hợp lệ:", amenities);
      return res
        .status(400)
        .json({ message: "Định dạng amenities không hợp lệ." });
    }
  }

  const updatedData = {
    title,
    description,
    price: price === "null" ? null : price,
    roomType: parsedRoomType,
    address,
    city,
    state,
    zipCode,
    amenities: parsedAmenities,
    images: updatedImages,
    latitude: latitude === "null" ? null : latitude,
    longitude: longitude === "null" ? null : longitude,
  };
  console.log("[DEBUG] updatedData chuẩn bị update:", updatedData);

  // If there's a price change, log it
  if (price && parseFloat(price) !== parseFloat(accommodation.price)) {
    await AccommodationPriceHistory.create({
      accommodationId: accommodation.id,
      oldPrice: accommodation.price,
      newPrice: price,
      changedBy: userId,
    });
  }

  try {
    await accommodation.update(updatedData);
    console.log("[DEBUG] Đã cập nhật xong accommodation, trả về response", {
      id: accommodation.id,
    });
    res.status(200).json(accommodation);
  } catch (err) {
    console.error("[ERROR] Lỗi khi update accommodation:", err);
    res
      .status(400)
      .json({ message: "Lỗi khi cập nhật nhà trọ", error: err.message });
  }
});

/**
 * @swagger
 * /api/accommodations/{id}:
 *   delete:
 *     summary: Delete accommodation
 *     description: Deletes an accommodation. Only the owner or admin can delete.
 *     tags: [Accommodations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Accommodation ID
 *     responses:
 *       200:
 *         description: Accommodation removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Accommodation not found
 *       400:
 *         description: Error occurred
 */
const deleteAccommodation = asyncHandler(async (req, res) => {
  const accommodation = await Accommodation.findByPk(req.params.id);
  if (!accommodation) {
    return res.status(404).json({ error: "Accommodation not found" });
  }
  // Check ownership
  if (accommodation.ownerId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Not authorized" });
  }
  await accommodation.destroy();
  res.json({ message: "Accommodation removed" });
});

/**
 * @swagger
 * /api/accommodations/my-accommodations:
 *   get:
 *     summary: Get user's accommodations
 *     description: Retrieves a list of accommodations owned by the authenticated user.
 *     tags: [Accommodations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's accommodations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Accommodation'
 *       400:
 *         description: Error occurred
 */
const getMyAccommodations = asyncHandler(async (req, res) => {
  const accommodations = await Accommodation.findAll({
    where: { ownerId: req.user.id },
    order: [["createdAt", "DESC"]],
  });
  const normalized = accommodations.map(normalizeAccommodation);
  res.json(normalized);
});

/**
 * @swagger
 * /api/accommodations/search:
 *   get:
 *     summary: Search accommodations
 *     description: Search accommodations by various criteria.
 *     tags: [Accommodations]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Accommodation'
 *       400:
 *         description: Error occurred
 */
const searchAccommodations = asyncHandler(async (req, res) => {
  try {
    const {
      keyword,
      minPrice,
      maxPrice,
      type,
      amenities,
      status,
      sortBy,
      page,
      limit,
    } = req.query;

    const userId = req.user ? req.user.id : null;

    const result = await AccommodationService.searchAccommodations({
      filters: { keyword, minPrice, maxPrice, type, amenities, status },
      pagination: { page, limit },
      sorting: { sortBy },
      userId,
    });

    res.json(result);
  } catch (error) {
    console.error('Lỗi searchAccommodations:', error);
    res.status(500).json({ error: 'Lỗi server: ' + error.message });
  }
});

const getLandlordDashboardStats = asyncHandler(async (req, res) => {
  const landlordId = req.user.id;

  try {
    const [accommodationCount, tenantCount, activeContracts] =
      await Promise.all([
        // 1. Count total accommodations owned by the landlord
        Accommodation.count({
          where: { ownerId: landlordId },
        }),
        // 2. Count unique active tenants
        RentalContract.count({
          distinct: true,
          col: "tenantId",
          include: [
            {
              model: Accommodation,
              as: "accommodation",
              where: { ownerId: landlordId },
              attributes: [],
            },
          ],
          where: {
            status: "active",
          },
        }),
        // 3. Get all active contracts to calculate monthly revenue
        RentalContract.findAll({
          attributes: ["totalAmount"],
          include: [
            {
              model: Accommodation,
              as: "accommodation",
              where: { ownerId: landlordId },
              attributes: [],
            },
          ],
          where: {
            status: "active",
          },
        }),
      ]);

    // This is a simplified revenue calculation. It sums up the rent amount of all active contracts.
    // A more complex implementation would consider payment cycles and dates.
    const totalMonthlyRevenue = activeContracts.reduce(
      (sum, contract) => sum + parseFloat(contract.totalAmount),
      0,
    );

    res.json({
      accommodations: {
        count: accommodationCount,
      },
      revenue: {
        total: totalMonthlyRevenue,
      },
      tenants: {
        count: tenantCount,
      },
    });
  } catch (error) {
    console.error("Error fetching landlord dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics." });
  }
});

const getHeatmapData = asyncHandler(async (req, res) => {
  const accommodations = await Accommodation.findAll({
    attributes: ["latitude", "longitude", "price"],
    where: {
      status: "available",
      latitude: { [Op.ne]: null },
      longitude: { [Op.ne]: null },
    },
  });

  const heatmapData = accommodations.map((acc) => ({
    lat: acc.latitude,
    lng: acc.longitude,
    weight: acc.price,
  }));

  res.json(heatmapData);
});

const searchAccommodationsByArea = asyncHandler(async (req, res) => {
  const { area } = req.body;

  if (!area || !Array.isArray(area) || area.length < 3) {
    return res
      .status(400)
      .json({
        error:
          "Invalid area provided. It must be an array of at least 3 points.",
      });
  }

  const polygonPoints = area.map((p) => `${p.lng} ${p.lat}`).join(",");
  const polygonWKT = `POLYGON((${polygonPoints}, ${area[0].lng} ${area[0].lat}))`;

  const accommodations = await Accommodation.findAll({
    where: sequelize.where(
      sequelize.fn(
        "ST_CONTAINS",
        sequelize.fn("ST_GEOMFROMTEXT", polygonWKT),
        sequelize.fn(
          "POINT",
          sequelize.col("longitude"),
          sequelize.col("latitude"),
        ),
      ),
      true,
    ),
  });

  res.json({ accommodations: accommodations.map(normalizeAccommodation) });
});

// Hàm chuẩn hóa dữ liệu accommodation trả về cho frontend
function normalizeAccommodation(acc) {
  const accJSON = acc.toJSON ? acc.toJSON() : acc;
  accJSON.amenities = Array.isArray(accJSON.amenities) ? accJSON.amenities : [];
  accJSON.images = Array.isArray(accJSON.images) ? accJSON.images : [];
  accJSON.roomType = Array.isArray(accJSON.roomType) ? accJSON.roomType : [];
  return accJSON;
}

module.exports = {
  createAccommodation,
  getAccommodations,
  getAccommodation,
  updateAccommodation,
  deleteAccommodation,
  getMyAccommodations,
  searchAccommodations,
  getLandlordDashboardStats,
  getHeatmapData,
  searchAccommodationsByArea,
  normalizeAccommodation,
};
