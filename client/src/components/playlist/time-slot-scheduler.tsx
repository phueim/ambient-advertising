import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X, Volume2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TimeSlotSchedulerProps {
  open: boolean;
  onClose: () => void;
  brandId: number;
  playlistId: number;
  playlistName: string;
  timeSlotId?: number;
}

export function TimeSlotScheduler({
  open,
  onClose,
  brandId,
  playlistId,
  playlistName,
  timeSlotId
}: TimeSlotSchedulerProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [allDay, setAllDay] = useState(true);
  const [startHour, setStartHour] = useState("09");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("17");
  const [endMinute, setEndMinute] = useState("00");
  const [repeatPattern, setRepeatPattern] = useState("custom");
  const [volume, setVolume] = useState(80);
  const [selectedDates, setSelectedDates] = useState<Date[]>([new Date("2025-06-24")]);
  const [newDate, setNewDate] = useState<Date>();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false);
  const [startDateMonth, setStartDateMonth] = useState<Date>(new Date());
  const [endDateMonth, setEndDateMonth] = useState<Date>(new Date());
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([1]);
  const [selectedDays, setSelectedDays] = useState<number[]>([1]);

  const handleSave = () => {
    // In a real app, this would save the time slot configuration
    console.log({
      startDate,
      endDate,
      allDay,
      startTime: `${startHour}${startMinute}`,
      endTime: `${endHour}${endMinute}`,
      repeatPattern,
      volume,
      playlistId,
      brandId,
      selectedWeekdays,
      selectedMonths,
      selectedDays,
      selectedDates: repeatPattern === "custom" ? selectedDates : undefined
    });
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const addSelectedDate = () => {
    if (newDate && !selectedDates.some(date => date.getTime() === newDate.getTime())) {
      setSelectedDates([...selectedDates, newDate]);
      setNewDate(undefined);
    }
  };

  const removeSelectedDate = (dateToRemove: Date) => {
    setSelectedDates(selectedDates.filter(date => date.getTime() !== dateToRemove.getTime()));
  };

  const clearAllDates = () => {
    setSelectedDates([]);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setNewDate(date);
    setDatePickerOpen(false);
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    setStartDatePickerOpen(false);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    setEndDatePickerOpen(false);
  };

  // Check if end date is earlier than start date
  const isEndDateEarlier = startDate && endDate && endDate < startDate;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0 overflow-hidden" aria-describedby="schedule-description">
        <div className="bg-primary text-white p-4 rounded-t-lg">
          <DialogTitle className="text-lg font-semibold text-center">Schedule Time Slot</DialogTitle>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="text-center">
            <p id="schedule-description" className="text-muted-foreground text-xs mb-1">Configure playback for</p>
            <h3 className="text-sm font-semibold">{playlistName}</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Start Date</Label>
              <Popover open={startDatePickerOpen} onOpenChange={setStartDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-7 text-xs px-2",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {startDate ? format(startDate, "EEE, d MMMM yyyy") : "Select"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3">
                    <div className="flex gap-2 mb-3">
                      <Select
                        value={startDateMonth.getFullYear().toString()}
                        onValueChange={(year) => {
                          const newDate = new Date(startDateMonth);
                          newDate.setFullYear(parseInt(year));
                          setStartDateMonth(newDate);
                        }}
                      >
                        <SelectTrigger className="w-20 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 21 }, (_, i) => 2020 + i).map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={startDateMonth.getMonth().toString()}
                        onValueChange={(month) => {
                          const newDate = new Date(startDateMonth);
                          newDate.setMonth(parseInt(month));
                          setStartDateMonth(newDate);
                        }}
                      >
                        <SelectTrigger className="w-24 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {format(new Date(2025, i, 1), "MMM")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateSelect}
                      month={startDateMonth}
                      onMonthChange={setStartDateMonth}
                      initialFocus
                      className="border-0"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">End Date <span className="text-muted-foreground">(Optional)</span></Label>
              <Popover open={endDatePickerOpen} onOpenChange={setEndDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-7 text-xs px-2",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {endDate ? format(endDate, "EEE, d MMMM yyyy") : "None"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3">
                    <div className="flex gap-2 mb-3">
                      <Select
                        value={endDateMonth.getFullYear().toString()}
                        onValueChange={(year) => {
                          const newDate = new Date(endDateMonth);
                          newDate.setFullYear(parseInt(year));
                          setEndDateMonth(newDate);
                        }}
                      >
                        <SelectTrigger className="w-20 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 21 }, (_, i) => 2020 + i).map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={endDateMonth.getMonth().toString()}
                        onValueChange={(month) => {
                          const newDate = new Date(endDateMonth);
                          newDate.setMonth(parseInt(month));
                          setEndDateMonth(newDate);
                        }}
                      >
                        <SelectTrigger className="w-24 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {format(new Date(2025, i, 1), "MMM")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateSelect}
                      month={endDateMonth}
                      onMonthChange={setEndDateMonth}
                      initialFocus
                      className="border-0"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {isEndDateEarlier && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <p className="text-red-700 text-xs font-medium">
                  End Date cannot be earlier than Start Date. Please select a valid date range.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="all-day" className="text-xs font-medium">
              All Day (24 hours)
            </Label>
            <Switch
              id="all-day"
              checked={allDay}
              onCheckedChange={setAllDay}
            />
          </div>

          {!allDay && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Start Time (HH:MM)</Label>
                <div className="flex gap-0.5">
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    className="w-12 h-6 px-0.5 text-xs border border-gray-300 rounded text-center"
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      );
                    })}
                  </select>
                  <span className="text-xs self-center">:</span>
                  <select
                    value={startMinute}
                    onChange={(e) => setStartMinute(e.target.value)}
                    className="w-12 h-6 px-0.5 text-xs border border-gray-300 rounded text-center"
                  >
                    {Array.from({ length: 60 }, (_, i) => {
                      const minute = i.toString().padStart(2, '0');
                      return (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">End Time (HH:MM)</Label>
                <div className="flex gap-0.5">
                  <select
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    className="w-12 h-6 px-0.5 text-xs border border-gray-300 rounded text-center"
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      );
                    })}
                  </select>
                  <span className="text-xs self-center">:</span>
                  <select
                    value={endMinute}
                    onChange={(e) => setEndMinute(e.target.value)}
                    className="w-12 h-6 px-0.5 text-xs border border-gray-300 rounded text-center"
                  >
                    {Array.from({ length: 60 }, (_, i) => {
                      const minute = i.toString().padStart(2, '0');
                      return (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-medium">Repeat Pattern</Label>
            <RadioGroup value={repeatPattern} onValueChange={setRepeatPattern}>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily" className="text-xs">Daily</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly" className="text-xs">Weekly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="text-xs">Monthly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="text-xs">Selected Dates</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {repeatPattern === "weekly" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Days</Label>
              <div className="grid grid-cols-7 gap-1">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                  <Button
                    key={day}
                    type="button"
                    variant={selectedWeekdays.includes(day) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (selectedWeekdays.includes(day)) {
                        setSelectedWeekdays(selectedWeekdays.filter(d => d !== day));
                      } else {
                        setSelectedWeekdays([...selectedWeekdays, day]);
                      }
                    }}
                    className={`text-xs h-8 p-0 ${selectedWeekdays.includes(day) ? 'bg-primary text-white' : ''}`}
                  >
                    {day}
                  </Button>
                ))}
              </div>
              {selectedWeekdays.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedWeekdays.join(", ")}
                </p>
              )}
            </div>
          )}

          {repeatPattern === "monthly" && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Monthly Schedule</Label>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Select Months (multi-select)</Label>
                <div className="grid grid-cols-4 gap-1">
                  {Array.from({ length: 12 }, (_, i) => {
                    const monthName = new Date(2025, i, 1).toLocaleString('default', { month: 'short' });
                    const monthNumber = i + 1;
                    const isSelected = selectedMonths.includes(monthNumber);
                    return (
                      <Button
                        key={monthNumber}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedMonths(selectedMonths.filter(m => m !== monthNumber));
                          } else {
                            setSelectedMonths([...selectedMonths, monthNumber]);
                          }
                        }}
                        className={`text-xs h-8 p-0 ${isSelected ? 'bg-primary text-white' : ''}`}
                      >
                        {monthName}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Select Days (multi-select)</Label>
                <div className="grid grid-cols-8 gap-1">
                  {Array.from({ length: 31 }, (_, i) => {
                    const day = i + 1;
                    const isSelected = selectedDays.includes(day);
                    return (
                      <Button
                        key={day}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedDays(selectedDays.filter(d => d !== day));
                          } else {
                            setSelectedDays([...selectedDays, day]);
                          }
                        }}
                        className={`text-xs h-7 w-7 p-0 ${isSelected ? 'bg-primary text-white' : ''}`}
                      >
                        {day}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gray-50 p-2 rounded text-xs">
                <p className="text-muted-foreground">
                  <strong>Selected:</strong> 
                  {selectedMonths.length > 0 && selectedDays.length > 0 ? (
                    <>
                      <br />Months: {selectedMonths.map(m => new Date(2025, m - 1, 1).toLocaleString('default', { month: 'short' })).join(', ')}
                      <br />Days: {selectedDays.join(', ')}
                    </>
                  ) : (
                    " None selected"
                  )}
                </p>
              </div>
            </div>
          )}

          {repeatPattern === "custom" && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Add Specific Dates</Label>
                <p className="text-xs text-muted-foreground mt-1">You can add up to 30 specific dates</p>
              </div>
              
              <div className="flex gap-2">
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal h-7 text-xs px-2",
                        !newDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {newDate ? format(newDate, "EEE, d MMMM yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newDate}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button 
                  onClick={addSelectedDate}
                  disabled={!newDate || selectedDates.length >= 30}
                  className="bg-primary/10 text-primary hover:bg-primary/20 h-7 text-xs px-2"
                  size="sm"
                >
                  Add
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs">Selected: {selectedDates.length}/30</span>
                {selectedDates.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllDates}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 text-xs px-2"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {selectedDates.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedDates.map((date, index) => (
                    <div key={index} className="flex items-center gap-1 bg-gray-100 rounded-md px-2 py-1 text-xs">
                      <span>{format(date, "EEE, d MMMM yyyy")}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSelectedDate(date)}
                        className="h-3 w-3 p-0 hover:bg-gray-200"
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Volume2 className="h-3 w-3" />
              <Label className="text-xs font-medium">Volume</Label>
              <span className="ml-auto text-xs font-medium">{volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${volume}%, #e5e7eb ${volume}%, #e5e7eb 100%)`
              }}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3">
            <Button variant="outline" onClick={handleCancel} size="sm">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="bg-primary hover:bg-primary/90" 
              size="sm"
              disabled={isEndDateEarlier}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}