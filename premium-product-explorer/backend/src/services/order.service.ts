import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";

export interface OrderInput {
  items: { productId: string; quantity: number }[];
}

export async function createOrder(userId: string, input: OrderInput) {
  const ids = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { brand: true, category: true }
  });

  if (products.length !== ids.length) {
    throw ApiError.badRequest("One or more products do not exist");
  }

  const stockError = input.items.find((i) => {
    const p = products.find((x) => x.id === i.productId);
    return !p || p.stock < i.quantity;
  });
  if (stockError) throw ApiError.badRequest("Insufficient stock for one or more items");

  const total = input.items.reduce((sum, i) => {
    const p = products.find((x) => x.id === i.productId)!;
    const finalPrice = p.price - (p.price * p.discount) / 100;
    return sum + finalPrice * i.quantity;
  }, 0);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId,
        total: Math.round(total * 100) / 100,
        status: "PENDING",
        items: {
          create: input.items.map((i) => {
            const p = products.find((x) => x.id === i.productId)!;
            return {
              productId: p.id,
              quantity: i.quantity,
              price: Math.round((p.price - (p.price * p.discount) / 100) * 100) / 100
            };
          })
        }
      },
      include: { items: { include: { product: { include: { brand: true, category: true } } } } }
    });

    for (const item of input.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }

    return created;
  });

  return order;
}

export async function getOrders(userId: string, page = 1, limit = 10) {
  const where = { userId };
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: { include: { product: { include: { brand: true, category: true } } } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.order.count({ where })
  ]);

  return {
    orders,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
}

export async function getOrderById(userId: string, orderId: string, role: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: { include: { brand: true, category: true } } } } }
  });
  if (!order) throw ApiError.notFound("Order not found");
  if (order.userId !== userId && role !== "ADMIN") {
    throw ApiError.forbidden("You can only view your own orders");
  }
  return order;
}
