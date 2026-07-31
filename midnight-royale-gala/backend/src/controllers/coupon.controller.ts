import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getCoupons = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.coupon.count(),
    ]);

    res.json({
      success: true,
      data: coupons,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      throw new ApiError(404, 'Coupon not found.');
    }
    res.json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, discountType, discountValue, maxUses, minAmount, expiresAt } = req.body;

    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      throw new ApiError(409, 'A coupon with this code already exists.');
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue,
        maxUses: maxUses || 100,
        minAmount: minAmount || 0,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    res.status(201).json({ success: true, message: 'Coupon created successfully.', data: coupon });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Coupon not found.');
    }

    const { code, discountType, discountValue, minPurchase, maxUses, expiresAt, isActive } = req.body;
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(code !== undefined && { code }),
        ...(discountType !== undefined && { discountType }),
        ...(discountValue !== undefined && { discountValue }),
        ...(minPurchase !== undefined && { minPurchase }),
        ...(maxUses !== undefined && { maxUses }),
        ...(expiresAt !== undefined && { expiresAt: new Date(expiresAt) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({ success: true, message: 'Coupon updated successfully.', data: coupon });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Coupon not found.');
    }

    await prisma.coupon.delete({ where: { id } });

    res.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const validateCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, amount } = req.body;

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.isActive) {
      throw new ApiError(400, 'Invalid or expired coupon code.');
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new ApiError(400, 'This coupon has expired.');
    }

    if (coupon.usedCount >= coupon.maxUses) {
      throw new ApiError(400, 'This coupon has reached its usage limit.');
    }

    if (amount < coupon.minAmount) {
      throw new ApiError(400, `Minimum order amount of $${coupon.minAmount.toFixed(2)} required.`);
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (amount * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    if (discountAmount > amount) {
      discountAmount = amount;
    }

    res.json({
      success: true,
      data: {
        valid: true,
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
