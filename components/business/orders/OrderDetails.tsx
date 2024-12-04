import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface OrderDetail {
    id: string;
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    type: string;
    status: string;
    date: string;
    amount: string;
    items: Array<{
        name: string;
        quantity: number;
        price: string;
    }>;
    shipping: {
        address: string;
        city: string;
        postalCode: string;
        cost: string;
    };
    payment: {
        method: string;
        cardLastFour: string;
    };
}

interface OrderDetailsProps {
    order: OrderDetail;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
    return (
        <Card className="p-4">
            <CardHeader>
                <CardTitle>Order Details - {order.id}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <h3 className="font-semibold">Customer Information</h3>
                    <p>Name: {order.customer.name}</p>
                    <p>Email: {order.customer.email}</p>
                    <p>Phone: {order.customer.phone}</p>
                </div>
                <div className="mb-4">
                    <h3 className="font-semibold">Order Information</h3>
                    <p>Type: {order.type}</p>
                    <p>Status: {order.status}</p>
                    <p>Date: {order.date}</p>
                    <p>Amount: {order.amount}</p>
                </div>
                <div className="mb-4">
                    <h3 className="font-semibold">Items</h3>
                    <ul className="list-disc list-inside">
                        {order.items.map((item, index) => (
                            <li key={index}>
                                {item.name} - Quantity: {item.quantity} - Price: {item.price}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mb-4">
                    <h3 className="font-semibold">Shipping Information</h3>
                    <p>Address: {order.shipping.address}</p>
                    <p>City: {order.shipping.city}</p>
                    <p>Postal Code: {order.shipping.postalCode}</p>
                    <p>Cost: {order.shipping.cost}</p>
                </div>
                <div className="mb-4">
                    <h3 className="font-semibold">Payment Information</h3>
                    <p>Method: {order.payment.method}</p>
                    <p>Card Last Four: {order.payment.cardLastFour}</p>
                </div>
            </CardContent>
        </Card>
    );
};
