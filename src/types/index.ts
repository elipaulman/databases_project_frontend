export interface Book {
  ISBN: string;
  Title: string;
  Year: number;
  Price: number;
  PublisherID: string;
  CategoryID: string;
  Publisher?: Publisher;
  Category?: Category;
  Authors?: string;
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
  Orders?: CustomerOrder[];
}

export interface CustomerOrder {
  OrderID: string;
  CustomerID: string;
  OrderDate: string;
  OrderTotal: number;
  Customer?: Customer;
  OrderItems?: OrderItem[];
}

export interface OrderItem {
  OrderItemID: string;
  OrderID: string;
  ISBN: string;
  Quantity: number;
  Price: number;
  Book?: Book;
  Order?: CustomerOrder;
}

export interface Inventory {
  ISBN: string;
  StockQuantity: number;
  Book?: Book;
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