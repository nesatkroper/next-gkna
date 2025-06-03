import { Category, Product, Customer, Sale, Cart, Employee, Department, Position, Auth } from "@/lib/generated/prisma";

export type Status = 'active' | 'inactive' | 'pending' | 'deleted' | 'approved' | 'rejected' | 'paid';
export type AccountStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface EntityBase {
  [key: string]: any;
  createdAt: Date;
  updatedAt: Date;
  status: Status | AccountStatus;
}

export type EntityMap = {
  categories: Category;
  products: Product;
  customers: Customer;
  sales: Sale;
  carts: Cart;
  employees: Employee;
  departments: Department;
  positions: Position;
  auth: Auth;
};

export type EntityName = keyof EntityMap;

export type EntityIdFields = {
  [K in EntityName]: K extends 'categories' ? 'categoryId' :
  K extends 'products' ? 'productId' :
  K extends 'customers' ? 'customerId' :
  K extends 'sales' ? 'saleId' :
  K extends 'carts' ? 'cartId' :
  K extends 'employees' ? 'employeeId' :
  K extends 'departments' ? 'departmentId' :
  K extends 'positions' ? 'positionId' :
  K extends 'auth' ? 'authId' :
  never;
};

