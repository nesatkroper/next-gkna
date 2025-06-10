import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for POST request
const createEntrySchema = z.object({
  productId: z.string().uuid(),
  supplierId: z.string().uuid(),
  branchId: z.string().uuid(),
  quantity: z.number().int().positive(),
  entryPrice: z.number().positive(),
  entryDate: z.string().datetime().optional(),
  invoice: z.string().optional(),
  memo: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const lowStock = searchParams.get("lowStock") === "true";

    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const where = {
      status: "active" as const,
      ...(search && {
        OR: [
          { product: { productName: { contains: search, mode: "insensitive" as const } } },
          { product: { productCode: { contains: search, mode: "insensitive" as const } } },
          { invoice: { contains: search, mode: "insensitive" as const } },
          { memo: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(lowStock && { quantity: { lt: 50 } }),
    };

    // Fetch entries with related data
    const [entries, total] = await Promise.all([
      prisma.entry.findMany({
        where,
        skip,
        take: limit,
        include: {
          Product: {
            select: {
              productId: true,
              productName: true,
              productCode: true,
              unit: true,
              capacity: true,
              Category: { select: { categoryName: true } },
            },
          },
          Branch: {
            select: {
              branchId: true,
              branchName: true,
              branchCode: true,
            },
          },
          Supplier: {
            select: {
              supplierId: true,
              supplierName: true,
              companyName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.entry.count({ where }),
    ]);

    return NextResponse.json({
      stockEntries: entries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Stock entries fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const validatedData = createEntrySchema.safeParse(data);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid input data", details: validatedData.error.issues },
        { status: 400 }
      );
    }


    const stockEntry = await prisma.$transaction(async (tx) => {
      let branchId: string;
      if (data.branchInput?.connect) {
        branchId = data.branchInput.connect.branchId;
      } else if (data.branchInput?.create) {
        const newBranch = await tx.branch.create({
          data: data.branchInput.create
        });
        branchId = newBranch.branchId;
      } else {
        throw new Error("Invalid branch input");
      }

      const [product, branch, supplier] = await Promise.all([
        tx.product.findUnique({ where: { productId: data.productId } }),
        tx.branch.findUnique({ where: { branchId: data.branchId } }),
        tx.supplier.findUnique({ where: { supplierId: data.supplierId } }),
      ]);

      if (!product || !branch || !supplier) {
        throw new Error("Invalid product, branch, or supplier ID");
      }

      // Create stock entry
      const entry = await tx.entry.create({
        data: {
          productId: data.productId,
          supplierId: data.supplierId,
          branchId: data.branchId,
          quantity: data.quantity,
          entryPrice: data.entryPrice,
          entryDate: data.entryDate ? new Date(data.entryDate) : new Date(),
          invoice: data.invoice,
          memo: data.memo,
          status: data.status,
        },
        // include: {
        //   Product: {
        //     select: {
        //       productId: true,
        //       productName: true,
        //       productCode: true,
        //       unit: true,
        //       capacity: true,
        //       Category: { select: { categoryName: true } },
        //     },
        //   },
        //   Branch: {
        //     select: {
        //       branchId: true,
        //       branchName: true,
        //       branchCode: true,
        //     },
        //   },
        //   Supplier: {
        //     select: {
        //       supplierId: true,
        //       supplierName: true,
        //       companyName: true,
        //     },
        //   },
        // },
      });

      // Update or create stock
      const existingStock = await tx.stock.findFirst({
        where: {
          productId: data.productId,
          branchId: data.branchId,
        },
      });

      if (existingStock) {
        await tx.stock.update({
          where: { stockId: existingStock.stockId },
          data: {
            quantity: existingStock.quantity + data.quantity,
            updatedAt: new Date(),
          },
        });
      } else {
        await tx.stock.create({
          data: {
            productId: data.productId,
            branchId: data.branchId,
            quantity: data.quantity,
            unit: product.unit || "unit",
            memo: data.memo || "",
          },
        });
      }

      return entry;
    });

    return NextResponse.json(stockEntry, { status: 201 });
  } catch (error) {
    console.error("Stock entry creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create stock entry" },
      { status: 500 }
    );
  }
}

// Include the previously provided PUT and DELETE handlers
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

// import { type NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const page = Number.parseInt(searchParams.get("page") || "1")
//     const limit = Number.parseInt(searchParams.get("limit") || "10")
//     const search = searchParams.get("search") || ""
//     const lowStock = searchParams.get("lowStock") === "true"

//     const skip = (page - 1) * limit

//     const where = {
//       product: {
//         status: "active" as const,
//         ...(search && {
//           OR: [
//             { productName: { contains: search, mode: "insensitive" as const } },
//             { productCode: { contains: search, mode: "insensitive" as const } },
//           ],
//         }),
//       },
//       ...(lowStock && { quantity: { lt: 50 } }),
//     }

//     return NextResponse.json({

//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     })
//   } catch (error) {
//     console.error("Inventory fetch error:", error)
//     return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const data = await request.json()

//     const stockEntry = await prisma.$transaction(async (tx) => {
//       // Create stock entry
//       const entry = await tx.entry.create({
//         data: {
//           productId: data.productId,
//           supplierId: data.supplierId,
//           branchId: data.branchId,
//           quantity: data.quantity,
//           entryPrice: data.entryPrice,
//           entryDate: data.entryDate ? new Date(data.entryDate) : new Date(),
//           invoice: data.invoice,
//           memo: data.memo,
//         },
//       })

//       // Update stock quantity
//       const existingStock = await tx.stock.findUnique({
//         where: { productId: data.productId, branchId: data.branchId },
//       })

//       if (existingStock) {
//         await tx.stock.update({
//           where: { productId: data.productId },
//           data: { quantity: existingStock.quantity + data.quantity },
//         })
//       } else {
//         await tx.stock.create({
//           data: {
//             productId: data.productId,
//             quantity: data.quantity,
//           },
//         })
//       }

//       return entry
//     })

//     return NextResponse.json(stockEntry, { status: 201 })
//   } catch (error) {
//     console.error("Stock entry creation error:", error)
//     return NextResponse.json({ error: "Failed to create stock entry" }, { status: 500 })
//   }
// }
