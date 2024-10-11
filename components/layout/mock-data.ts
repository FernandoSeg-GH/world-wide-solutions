// src/mock-data.ts

import { SummaryCard, Order, OrderDetail } from "@/types";
import {
  Home,
  ShoppingCart,
  Package,
  Users2,
  LineChart,
  Settings,
} from "lucide-react";

export const mockData = {
  sidebarItems: [
    { icon: Home, label: "Dashboard", href: "#", isActive: true },
    { icon: ShoppingCart, label: "Orders", href: "#", isActive: false },
    { icon: Package, label: "Products", href: "#", isActive: false },
    { icon: Users2, label: "Customers", href: "#", isActive: false },
    { icon: LineChart, label: "Analytics", href: "#", isActive: false },
    { icon: Settings, label: "Settings", href: "#", isActive: false },
  ],
  breadcrumbs: [
    { label: "Dashboard", href: "#" },
    { label: "Orders", href: "#" },
    { label: "Recent Orders" },
  ],
  user: {
    name: "John Doe",
    avatar: "/placeholder-user.jpg",
  },
  summaryCards: [
    {
      title: "This Week",
      value: "$1,329",
      change: "+25% from last week",
      changePercentage: 25,
    },
    {
      title: "This Month",
      value: "$5,329",
      change: "+10% from last month",
      changePercentage: 10,
    },
  ] as SummaryCard[],
  recentOrders: [
    {
      id: "ORD001",
      customer: { name: "Liam Johnson", email: "liam@example.com" },
      type: "Sale",
      status: "Fulfilled",
      date: "2023-06-23",
      amount: "$250.00",
    },
    {
      id: "ORD002",
      customer: { name: "Olivia Smith", email: "olivia@example.com" },
      type: "Refund",
      status: "Declined",
      date: "2023-06-24",
      amount: "$150.00",
    },
    {
      id: "ORD003",
      customer: { name: "Noah Williams", email: "noah@example.com" },
      type: "Subscription",
      status: "Fulfilled",
      date: "2023-06-25",
      amount: "$350.00",
    },
    {
      id: "ORD004",
      customer: { name: "Emma Brown", email: "emma@example.com" },
      type: "Sale",
      status: "Fulfilled",
      date: "2023-06-26",
      amount: "$450.00",
    },
  ] as Order[],
  selectedOrder: {
    id: "Oe31b70H",
    customer: {
      name: "Liam Johnson",
      email: "liam@acme.com",
      phone: "+1 234 567 890",
    },
    type: "Sale", // Added property
    status: "Fulfilled", // Added property
    amount: "$329.00", // Added property
    date: "November 23, 2023",
    items: [
      { name: "Glimmer Lamps", quantity: 2, price: "$250.00" },
      { name: "Aqua Filters", quantity: 1, price: "$49.00" },
    ],
    subtotal: "$299.00",
    shipping: {
      cost: "$5.00",
      address: "1234 Main St.",
      city: "Anytown",
      postalCode: "CA 12345",
    },
    tax: "$25.00",
    total: "$329.00",
    payment: {
      method: "Visa",
      cardLastFour: "4532",
    },
  } as OrderDetail,
};
