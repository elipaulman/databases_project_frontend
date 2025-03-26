export interface Book {
  ISBN: string;
  Title: string;
  Year: number;
  Price: number;
  CategoryID: string;
  CategoryName: string;
  PublisherName: string;
  Authors: string;
}

export interface Author {
  AuthorID: string;
  Name: string;
  Books?: Book[];
}

export interface Publisher {
  PublisherID: string;
  Name: string;
  Address: string;
  ContactInfo: string;
}

export interface Category {
  CategoryID: string;
  CategoryName: string;
}

export interface Customer {
  CustomerID: string;
  Name: string;
  Address: string;
  Email: string;
  PhoneNumber: string;
}

export interface Order {
  OrderID: string;
  CustomerID: string;
  OrderDate: string;
  OrderTotal: number;
  CustomerName: string;
}

export interface OrderItem {
  OrderItemID: string;
  OrderID: string;
  ISBN: string;
  Quantity: number;
  Price: number;
  BookTitle: string;
}

export interface Inventory {
  ISBN: string;
  StockQuantity: number;
  BookTitle: string;
}

export interface NewOrderItem {
  ISBN: string;
  Quantity: number;
  Price: number;
}

export interface NewOrder {
  CustomerID: string;
  items: NewOrderItem[];
}

export interface InventoryUpdate {
  ISBN: string;
  StockQuantity: number;
}

export interface BookDemand {
  ID: string;
  ISBN: string;
  Popularity: number;
  Book?: Book;
}

export interface ProfitMargin {
  ID: string;
  ISBN: string;
  SalesTotal: number;
  CostTotal: number;
  Book?: Book;
}

export interface CustomerOrder {
  OrderID: string;
  CustomerID: string;
  OrderDate: string;
  OrderTotal: number;
  CustomerName: string;
} 