"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Package } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Product {
  productId: string
  productName: string
  productCode?: string
  picture?: string
  sellPrice: number
  costPrice: number
  unit?: string
  capacity?: string
  status: string
  Category: {
    categoryName: string
  }
  Stock?: {
    quantity: number
  }
}

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          {/* Image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
            {product.picture ? (
              <img
                src={product.picture || "/placeholder.svg"}
                alt={product.productName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <div>
              <h3 className="font-semibold line-clamp-2">{product.productName}</h3>
              {product.productCode && <p className="text-sm text-muted-foreground">{product.productCode}</p>}
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {product.Category.categoryName}
              </Badge>
              <Badge
                variant={
                  (product.Stock?.quantity || 0) < 10
                    ? "destructive"
                    : (product.Stock?.quantity || 0) < 50
                      ? "secondary"
                      : "default"
                }
              >
                {product.Stock?.quantity || 0}
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cost:</span>
                <span>{formatCurrency(product.costPrice)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Price:</span>
                <span>{formatCurrency(product.sellPrice)}</span>
              </div>
            </div>

            {(product.unit || product.capacity) && (
              <p className="text-sm text-muted-foreground">
                {product.unit && product.capacity
                  ? `${product.capacity} ${product.unit}`
                  : product.unit || product.capacity}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(product)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onDelete(product.productId)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
