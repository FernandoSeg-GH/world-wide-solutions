// SummaryCards.tsx

import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

interface SummaryCard {
    title: string;
    value: string;
    change: string;
    changePercentage: number;
}

interface SummaryCardsProps {
    cards: SummaryCard[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ cards }) => {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {cards.map((card) => (
                <Card key={card.title} className="p-4">
                    <CardHeader>
                        <CardTitle>{card.title}</CardTitle>
                        <CardDescription>{card.value}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className={`text-sm ${card.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                            {card.change}
                        </p>
                        <p className="text-xs text-gray-500">{card.changePercentage}%</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
