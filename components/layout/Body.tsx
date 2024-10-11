import React from "react";
import { SummaryCards } from "./SummaryCards";
import { RecentOrders } from "./RecentOrders";
import { OrderDetails } from "./OrderDetails";
import { DashboardBodyProps } from "@/types";


export const Body: React.FC<DashboardBodyProps> = ({
    summaryCards,
    recentOrders,
    selectedOrder,
}) => {
    return (
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
            {/* THEME 1 */}
            <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                {summaryCards && <SummaryCards cards={summaryCards} />}
                {recentOrders && <RecentOrders orders={recentOrders} />}
            </div>
            <div>
                {selectedOrder && <OrderDetails order={selectedOrder} />}
            </div>
        </main>
    );
};
