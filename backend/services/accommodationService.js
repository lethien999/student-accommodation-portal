const {
  Accommodation,
  User,
  Favorite,
  Amenity,
  sequelize,
  Op,
} = require("../models");

/**
 * Service to handle complex accommodation logic.
 */
class AccommodationService {
  /**
   * Searches and filters accommodations with pagination.
   * @param {object} filters - The filter criteria (keyword, price, type, etc.).
   * @param {object} pagination - Pagination options (page, limit).
   * @param {object} sorting - Sorting options (sortBy).
   * @param {number|null} userId - The ID of the current user to check for favorites.
   * @returns {Promise<object>} - A promise that resolves to an object with accommodations and pagination info.
   */
  static async searchAccommodations({
    filters = {},
    pagination = {},
    sorting = {},
    userId = null,
  }) {
    const {
      keyword,
      minPrice,
      maxPrice,
      type,
      amenities,
      status = "available",
    } = filters;
    const { page = 1, limit = 10 } = pagination;
    const { sortBy = "createdAt_desc" } = sorting;

    const where = { status };
    const order = [];

    // Keyword search
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${keyword}%` } },
        { address: { [Op.iLike]: `%${keyword}%` } },
        { city: { [Op.iLike]: `%${keyword}%` } },
        { description: { [Op.iLike]: `%${keyword}%` } },
      ];
    }

    // Price filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }

    // Type filter
    if (type) {
      where.type = type;
    }

    // Amenities filter (fix lỗi truy cập undefined)
    if (Array.isArray(amenities) && amenities.length > 0) {
      // Nếu amenities là mảng, lọc các accommodation có đủ các tiện ích này
      where['$amenityList.name$'] = { [Op.in]: amenities };
    }

    // Sorting
    const [sortField, sortOrder] = sortBy.split("_");
    if (sortField === "price") {
      order.push(["price", sortOrder.toUpperCase()]);
    } else if (sortField === "rating") {
      order.push([
        sequelize.literal('"averageRating"'),
        sortOrder.toUpperCase(),
      ]);
    } else {
      order.push(["createdAt", "DESC"]); // Default sort
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Accommodation.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset,
      distinct: true,
      include: [
        {
          model: User,
          as: "accommodationOwner",
          attributes: ["id", "username", "email"],
        },
        {
          model: Amenity,
          as: "amenityList",
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
    });

    const accommodationIds = rows.map((acc) => acc.id);
    let favorites = new Set();

    if (userId && accommodationIds.length > 0) {
      const favoriteRecords = await Favorite.findAll({
        where: { userId, accommodationId: { [Op.in]: accommodationIds } },
        attributes: ["accommodationId"],
      });
      favorites = new Set(favoriteRecords.map((fav) => fav.accommodationId));
    }

    const results = rows.map((acc) =>
      this.normalize(acc, favorites.has(acc.id)),
    );

    return {
      accommodations: results,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    };
  }

  /**
   * Normalizes the accommodation object for consistent output.
   * @param {Accommodation} acc - The accommodation instance from Sequelize.
   * @param {boolean} isFavorite - Whether the accommodation is a favorite for the current user.
   * @returns {object} - The normalized accommodation object.
   */
  static normalize(acc, isFavorite = false) {
    const accJSON = acc.toJSON ? acc.toJSON() : acc;
    accJSON.isFavorite = isFavorite;
    accJSON.amenities =
      accJSON.amenityList?.map((a) => a.name) ||
      (Array.isArray(accJSON.amenities) ? accJSON.amenities : []);
    accJSON.images = Array.isArray(accJSON.images) ? accJSON.images : [];
    accJSON.roomType = Array.isArray(accJSON.roomType) ? accJSON.roomType : [];
    accJSON.rating = accJSON.averageRating;
    accJSON.reviewCount = accJSON.numberOfReviews;
    delete accJSON.amenityList; // Clean up
    return accJSON;
  }
}

module.exports = AccommodationService;
