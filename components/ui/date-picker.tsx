import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
    selectedDate: Date | string | null;
    onChange: (date: Date | null) => void;
}

export function DatePicker({ selectedDate, onChange }: DatePickerProps) {

    const isValidDate = selectedDate && !isNaN(new Date(selectedDate).getTime());
    const selectedDateAsDate = isValidDate ? new Date(selectedDate) : undefined;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {isValidDate
                        ? format(new Date(selectedDate as string), "P")
                        : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={selectedDateAsDate}
                    onSelect={(date) => {
                        onChange(date ?? null);
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}

export default DatePicker;