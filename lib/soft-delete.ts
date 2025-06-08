
export const softDeleteWhere = {
  active: { status: "active" as const },
  all: {},
}

export const softDelete = {
  delete: { status: "inactive" as const },
  restore: { status: "active" as const },
}
