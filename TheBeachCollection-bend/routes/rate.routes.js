import express from "express";
import {
  getRates,
  getRate,
  createRate,
  updateRate,
  deleteRate,
  getRateForDate,
  calculateBookingRate,
  bulkCreateRates
} from "../controllers/rate.controller.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Rate:
 *       type: object
 *       required:
 *         - property
 *         - room
 *         - seasonType
 *         - seasonName
 *         - startDate
 *         - endDate
 *         - ratePerNight
 *       properties:
 *         property:
 *           type: string
 *           description: Property ID
 *         room:
 *           type: string
 *           description: Room ID
 *         seasonType:
 *           type: string
 *           enum: [low, high, peak]
 *         seasonName:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         ratePerNight:
 *           type: number
 *         currency:
 *           type: string
 *           default: USD
 *         minimumStay:
 *           type: number
 *           default: 1
 *         isActive:
 *           type: boolean
 *           default: true
 *         mealPlan:
 *           type: string
 *           enum: [room-only, bed-breakfast, half-board, full-board, all-inclusive]
 *         singleOccupancySupplement:
 *           type: number
 *         childRate:
 *           type: number
 *         childAgeLimit:
 *           type: number
 *         extraAdultRate:
 *           type: number
 */

/**
 * @swagger
 * /rates:
 *   get:
 *     summary: Get all rates with optional filters
 *     tags: [Rates]
 *     parameters:
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *       - in: query
 *         name: roomId
 *         schema:
 *           type: string
 *       - in: query
 *         name: seasonType
 *         schema:
 *           type: string
 *           enum: [low, high, peak]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of rates
 */
router.get("/", getRates);

/**
 * @swagger
 * /rates/for-date:
 *   get:
 *     summary: Get applicable rate for a specific date
 *     tags: [Rates]
 *     parameters:
 *       - in: query
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Rate for the specified date
 */
router.get("/for-date", getRateForDate);

/**
 * @swagger
 * /rates/calculate:
 *   post:
 *     summary: Calculate total booking rate for date range
 *     tags: [Rates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *               - startDate
 *               - endDate
 *             properties:
 *               roomId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               adults:
 *                 type: number
 *               children:
 *                 type: number
 *     responses:
 *       200:
 *         description: Calculated booking rate with breakdown
 */
router.post("/calculate", calculateBookingRate);

/**
 * @swagger
 * /rates/{id}:
 *   get:
 *     summary: Get a single rate by ID
 *     tags: [Rates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rate details
 */
router.get("/:id", getRate);

// Protected admin routes
/**
 * @swagger
 * /rates/admin:
 *   post:
 *     summary: Create a new rate
 *     tags: [Rates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Rate'
 *     responses:
 *       201:
 *         description: Rate created successfully
 */
router.post("/admin", protectAdmin, createRate);

/**
 * @swagger
 * /rates/admin/bulk:
 *   post:
 *     summary: Bulk create rates
 *     tags: [Rates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rates:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Rate'
 *     responses:
 *       201:
 *         description: Rates created successfully
 */
router.post("/admin/bulk", protectAdmin, bulkCreateRates);

/**
 * @swagger
 * /rates/admin/{id}:
 *   put:
 *     summary: Update a rate
 *     tags: [Rates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Rate'
 *     responses:
 *       200:
 *         description: Rate updated successfully
 */
router.put("/admin/:id", protectAdmin, updateRate);

/**
 * @swagger
 * /rates/admin/{id}:
 *   delete:
 *     summary: Delete a rate
 *     tags: [Rates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rate deleted successfully
 */
router.delete("/admin/:id", protectAdmin, deleteRate);

export default router;
