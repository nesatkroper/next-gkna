// Utility functions for soft delete operations
export const softDeleteWhere = {
  active: { status: "active" as const },
  all: {}, // For admin views to see all records
}

export const softDelete = {
  delete: { status: "inactive" as const },
  restore: { status: "active" as const },
}
