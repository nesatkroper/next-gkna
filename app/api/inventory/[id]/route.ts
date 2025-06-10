import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const data = await request.json();

    // Validate input data
    const updateEntrySchema = createEntrySchema.partial();
    const validatedData = updateEntrySchema.safeParse(data);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid input data", details: validatedData.error.issues },
        { status: 400 }
      );
    }

    const stockEntry = await prisma.$transaction(async (tx) => {
      // Verify entry exists
      const existingEntry = await tx.entry.findUnique({
        where: { entryId: id },
      });
      if (!existingEntry) {
        throw new Error("Stock entry not found");
      }

      // Verify referenced entities if provided
      const checks = [];
      if (data.productId) {
        checks.push(tx.product.findUnique({ where: { productId: data.productId } }));
      }
      if (data.branchId) {
        checks.push(tx.branch.findUnique({ where: { branchId: data.branchId } }));
      }
      if (data.supplierId) {
        checks.push(tx.supplier.findUnique({ where: { supplierId: data.supplierId } }));
      }
      const [product, branch, supplier] = await Promise.all(checks);

      if (
        (data.productId && !product) ||
        (data.branchId && !branch) ||
        (data.supplierId && !supplier)
      ) {
        throw new Error("Invalid product, branch, or supplier ID");
      }

      // Update stock entry
      const quantityDiff = data.quantity
        ? data.quantity - existingEntry.quantity
        : 0;
      const entry = await tx.entry.update({
        where: { entryId: id },
        data: {
          productId: data.productId,
          supplierId: data.supplierId,
          branchId: data.branchId,
          quantity: data.quantity,
          entryPrice: data.entryPrice,
          entryDate: data.entryDate ? new Date(data.entryDate) : undefined,
          invoice: data.invoice,
          memo: data.memo,
          status: data.status,
        },
        include: {
          product: {
            select: {
              productId: true,
              productName: true,
              productCode: true,
              unit: true,
              capacity: true,
              category: { select: { categoryName: true } },
            },
          },
          branch: {
            select: {
              branchId: true,
              branchName: true,
              branchCode: true,
            },
          },
          supplier: {
            select: {
              supplierId: true,
              supplierName: true,
              companyName: true,
            },
          },
        },
      });

      // Update stock if quantity changed
      if (quantityDiff !== 0) {
        const existingStock = await tx.stock.findFirst({
          where: {
            productId: entry.productId,
            branchId: entry.branchId,
          },
        });

        if (existingStock) {
          const newQuantity = existingStock.quantity + quantityDiff;
          if (newQuantity < 0) {
            throw new Error("Cannot reduce stock below zero");
          }
          await tx.stock.update({
            where: { stockId: existingStock.stockId },
            data: {
              quantity: newQuantity,
              updatedAt: new Date(),
            },
          });
        } else if (quantityDiff > 0) {
          await tx.stock.create({
            data: {
              productId: entry.productId,
              branchId: entry.branchId,
              quantity: quantityDiff,
              unit: product?.unit || "unit",
              memo: data.memo || "",
            },
          });
        }
      }

      return entry;
    });

    return NextResponse.json(stockEntry);
  } catch (error) {
    console.error("Stock entry update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update stock entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    const stockEntry = await prisma.$transaction(async (tx) => {
      // Verify entry exists
      const existingEntry = await tx.entry.findUnique({
        where: { entryId: id },
      });
      if (!existingEntry) {
        throw new Error("Stock entry not found");
      }

      // Delete entry
      await tx.entry.delete({
        where: { entryId: id },
      });

      // Update stock
      const existingStock = await tx.stock.findFirst({
        where: {
          productId: existingEntry.productId,
          branchId: existingEntry.branchId,
        },
      });

      if (existingStock) {
        const newQuantity = existingStock.quantity - existingEntry.quantity;
        if (newQuantity < 0) {
          throw new Error("Cannot reduce stock below zero");
        }
        await tx.stock.update({
          where: { stockId: existingStock.stockId },
          data: {
            quantity: newQuantity,
            updatedAt: new Date(),
          },
        });
      }

      return { entryId: id };
    });

    return NextResponse.json(stockEntry);
  } catch (error) {
    console.error("Stock entry deletion error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete stock entry" },
      { status: 500 }
    );
  }
}