import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ArrowLeft, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2,
  Sun,
  Flame,
  Snowflake,
  Building2,
  BedDouble,
  Save,
  Copy,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRates, type Rate, type RateInput } from '@/hooks/useRates';
import { useBackendProperties } from '@/hooks/useBackendProperties';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  isToday,
  isWithinInterval,
  parseISO
} from 'date-fns';
import { toast } from 'sonner';

const SEASON_COLORS = {
  low: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', icon: Snowflake },
  high: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', icon: Sun },
  peak: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: Flame },
};

const MEAL_PLANS = [
  { value: 'room-only', label: 'Room Only' },
  { value: 'bed-breakfast', label: 'Bed & Breakfast' },
  { value: 'half-board', label: 'Half Board' },
  { value: 'full-board', label: 'Full Board' },
  { value: 'all-inclusive', label: 'All Inclusive' },
];

export default function AdminRatesCalendar() {
  const { properties, loading: propertiesLoading } = useBackendProperties();
  const { rates, loading: ratesLoading, error: ratesError, createRate, updateRate, deleteRate, fetchRates } = useRates();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<Rate | null>(null);
  const [deletingRate, setDeletingRate] = useState<Rate | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  
  // Form state
  const [formData, setFormData] = useState<RateInput>({
    property: '',
    room: '',
    seasonType: 'low',
    seasonName: '',
    startDate: '',
    endDate: '',
    ratePerNight: 0,
    currency: 'USD',
    minimumStay: 1,
    isActive: true,
    notes: '',
    mealPlan: 'full-board',
    singleOccupancySupplement: 0,
    childRate: 0,
    childAgeLimit: 12,
    extraAdultRate: 0,
  });

  // Get rooms for selected property
  const availableRooms = useMemo(() => {
    if (!selectedProperty) return [];
    const property = properties.find(p => (p._id || p.id) === selectedProperty);
    return property?.rooms || [];
  }, [selectedProperty, properties]);

  // Filter rates by selected property and room
  const filteredRates = useMemo(() => {
    return rates.filter(rate => {
      if (!rate?.property || !rate?.room) return false; // Skip rates with missing property or room
      if (selectedProperty && rate.property._id !== selectedProperty) return false;
      if (selectedRoom && selectedRoom !== 'all' && rate.room._id !== selectedRoom) return false;
      return true;
    });
  }, [rates, selectedProperty, selectedRoom]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  // Get rates for a specific date
  const getRatesForDate = (date: Date) => {
    return filteredRates.filter(rate => {
      const start = parseISO(rate.startDate);
      const end = parseISO(rate.endDate);
      return isWithinInterval(date, { start, end });
    });
  };

  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const handleToday = () => setCurrentDate(new Date());

  const openCreateDialog = (date?: Date) => {
    setEditingRate(null);
    setFormData({
      property: selectedProperty || '',
      room: selectedRoom || '',
      seasonType: 'low',
      seasonName: '',
      startDate: date ? format(date, 'yyyy-MM-dd') : '',
      endDate: date ? format(date, 'yyyy-MM-dd') : '',
      ratePerNight: 0,
      currency: 'USD',
      minimumStay: 1,
      isActive: true,
      notes: '',
      mealPlan: 'full-board',
      singleOccupancySupplement: 0,
      childRate: 0,
      childAgeLimit: 12,
      extraAdultRate: 0,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (rate: Rate) => {
    setEditingRate(rate);
    setFormData({
      property: rate.property._id,
      room: rate.room._id,
      seasonType: rate.seasonType,
      seasonName: rate.seasonName,
      startDate: format(parseISO(rate.startDate), 'yyyy-MM-dd'),
      endDate: format(parseISO(rate.endDate), 'yyyy-MM-dd'),
      ratePerNight: rate.ratePerNight,
      currency: rate.currency,
      minimumStay: rate.minimumStay,
      isActive: rate.isActive,
      notes: rate.notes || '',
      mealPlan: rate.mealPlan,
      singleOccupancySupplement: rate.singleOccupancySupplement,
      childRate: rate.childRate,
      childAgeLimit: rate.childAgeLimit,
      extraAdultRate: rate.extraAdultRate,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.property || !formData.room) {
        toast.error('Please select a property and room');
        return;
      }
      if (!formData.startDate || !formData.endDate) {
        toast.error('Please select start and end dates');
        return;
      }
      if (!formData.seasonName) {
        toast.error('Please enter a season name');
        return;
      }
      if (formData.ratePerNight <= 0) {
        toast.error('Please enter a valid rate per night');
        return;
      }

      if (editingRate) {
        await updateRate(editingRate._id, formData);
        toast.success('Rate updated successfully');
      } else {
        await createRate(formData);
        toast.success('Rate created successfully');
      }
      
      setIsDialogOpen(false);
      fetchRates();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save rate');
    }
  };

  const handleDelete = async () => {
    if (!deletingRate) return;
    try {
      await deleteRate(deletingRate._id);
      toast.success('Rate deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingRate(null);
    } catch (error) {
      toast.error('Failed to delete rate');
    }
  };

  const handleDuplicateRate = (rate: Rate) => {
    setEditingRate(null);
    setFormData({
      property: rate.property._id,
      room: rate.room._id,
      seasonType: rate.seasonType,
      seasonName: `${rate.seasonName} (Copy)`,
      startDate: '',
      endDate: '',
      ratePerNight: rate.ratePerNight,
      currency: rate.currency,
      minimumStay: rate.minimumStay,
      isActive: true,
      notes: rate.notes || '',
      mealPlan: rate.mealPlan,
      singleOccupancySupplement: rate.singleOccupancySupplement,
      childRate: rate.childRate,
      childAgeLimit: rate.childAgeLimit,
      extraAdultRate: rate.extraAdultRate,
    });
    setIsDialogOpen(true);
    toast.info('Please select new dates for the duplicated rate');
  };

  // Set default property when properties load
  useEffect(() => {
    if (properties.length > 0 && !selectedProperty) {
      setSelectedProperty(properties[0]._id || properties[0].id || '');
    }
  }, [properties, selectedProperty]);

  const loading = propertiesLoading || ratesLoading;

  // Show error toast if rates failed to load
  useEffect(() => {
    if (ratesError) {
      toast.error(`Error loading rates: ${ratesError}`);
    }
  }, [ratesError]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#749DD0] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading rates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-[#749DD0]" />
                  Rates Management
                </h1>
                <p className="text-sm text-slate-500">Manage seasonal rates for all properties and rooms</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className={viewMode === 'calendar' ? 'bg-white shadow-sm' : ''}
                >
                  Calendar
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-white shadow-sm' : ''}
                >
                  List
                </Button>
              </div>
              <Button onClick={() => openCreateDialog()} className="bg-[#749DD0] hover:bg-[#5a8ac4] gap-2">
                <Plus className="h-4 w-4" />
                Add Rate
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">Property</Label>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.filter(p => p._id || p.id).map(property => {
                      const propertyId = property._id || property.id;
                      return (
                        <SelectItem key={propertyId} value={propertyId!}>
                          {property.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700">Room</Label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rooms</SelectItem>
                    {availableRooms.filter((room: any) => room._id || room.id).map((room: any) => {
                      const roomId = room._id || room.id;
                      return (
                        <SelectItem key={roomId} value={roomId}>
                          {room.name} ({room.roomType || room.type})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-sm font-medium text-slate-700">Season Legend</Label>
                <div className="flex gap-4 mt-2">
                  {Object.entries(SEASON_COLORS).map(([key, value]) => {
                    const IconComponent = value.icon;
                    return (
                      <div key={key} className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${value.bg} ${value.text}`}>
                        <IconComponent className="h-4 w-4" />
                        <span className="text-sm font-medium capitalize">{key} Season</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#749DD0] border-t-transparent" />
          </div>
        ) : viewMode === 'calendar' ? (
          /* Calendar View */
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-semibold">
                {format(currentDate, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleToday}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-t-lg overflow-hidden">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="bg-slate-50 py-3 text-center text-sm font-semibold text-slate-600">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-b-lg overflow-hidden">
                {calendarDays.map((day, index) => {
                  const dayRates = getRatesForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isCurrentDay = isToday(day);
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[120px] bg-white p-2 ${
                        !isCurrentMonth ? 'bg-slate-50/50' : ''
                      } ${isCurrentDay ? 'ring-2 ring-[#749DD0] ring-inset' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${
                          !isCurrentMonth ? 'text-slate-400' : isCurrentDay ? 'text-[#749DD0]' : 'text-slate-700'
                        }`}>
                          {format(day, 'd')}
                        </span>
                        {isCurrentMonth && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 opacity-0 hover:opacity-100 transition-opacity"
                            onClick={() => openCreateDialog(day)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="space-y-1 overflow-y-auto max-h-[80px]">
                        {dayRates.map(rate => {
                          const colors = SEASON_COLORS[rate.seasonType];
                          return (
                            <div
                              key={rate._id}
                              className={`px-2 py-1 rounded text-xs cursor-pointer truncate ${colors.bg} ${colors.text} ${colors.border} border hover:opacity-80 transition-opacity`}
                              onClick={() => openEditDialog(rate)}
                              title={`${rate.seasonName} - $${rate.ratePerNight}/night`}
                            >
                              <div className="font-medium truncate">{rate.room.name}</div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {rate.ratePerNight}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* List View */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#749DD0]" />
                All Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRates.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No rates found</h3>
                  <p className="text-slate-500 mb-4">Create seasonal rates to manage pricing.</p>
                  <Button onClick={() => openCreateDialog()} className="bg-[#749DD0] hover:bg-[#5a8ac4]">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Rate
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Season</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead className="text-right">Rate/Night</TableHead>
                      <TableHead>Meal Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRates.map(rate => {
                      const colors = SEASON_COLORS[rate.seasonType];
                      const SeasonIcon = colors.icon;
                      return (
                        <TableRow key={rate._id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-slate-400" />
                              {rate.property.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <BedDouble className="h-4 w-4 text-slate-400" />
                              {rate.room.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${colors.bg} ${colors.text} border-0`}>
                              <SeasonIcon className="h-3 w-3 mr-1" />
                              {rate.seasonName}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {format(parseISO(rate.startDate), 'MMM d, yyyy')} - {format(parseISO(rate.endDate), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ${rate.ratePerNight.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm capitalize">
                            {rate.mealPlan.replace('-', ' ')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={rate.isActive ? 'default' : 'secondary'}>
                              {rate.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleDuplicateRate(rate)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(rate)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => { setDeletingRate(rate); setIsDeleteDialogOpen(true); }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Rate Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#749DD0]" />
              {editingRate ? 'Edit Rate' : 'Create New Rate'}
            </DialogTitle>
            <DialogDescription>
              Set seasonal pricing for a specific room and date range
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Property & Room Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Property *</Label>
                <Select 
                  value={formData.property} 
                  onValueChange={(value) => {
                    setFormData({ ...formData, property: value, room: '' });
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.filter(p => p._id || p.id).map(property => {
                      const propertyId = property._id || property.id;
                      return (
                        <SelectItem key={propertyId} value={propertyId!}>
                          {property.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Room *</Label>
                <Select 
                  value={formData.room} 
                  onValueChange={(value) => setFormData({ ...formData, room: value })}
                  disabled={!formData.property}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {(properties.find(p => (p._id || p.id) === formData.property)?.rooms || [])
                      .filter((room: any) => room._id || room.id)
                      .map((room: any) => {
                        const roomId = room._id || room.id;
                        return (
                          <SelectItem key={roomId} value={roomId}>
                            {room.name} ({room.roomType || room.type})
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Season Type & Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Season Type *</Label>
                <Select 
                  value={formData.seasonType} 
                  onValueChange={(value: 'low' | 'high' | 'peak') => setFormData({ ...formData, seasonType: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <Snowflake className="h-4 w-4 text-blue-500" />
                        Low Season
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-amber-500" />
                        High Season
                      </div>
                    </SelectItem>
                    <SelectItem value="peak">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-red-500" />
                        Peak Season
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Season Name *</Label>
                <Input
                  className="mt-1"
                  placeholder="e.g., Christmas Peak 2024"
                  value={formData.seasonName}
                  onChange={(e) => setFormData({ ...formData, seasonName: e.target.value })}
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date *</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Rate Per Night *</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="number"
                    className="pl-9"
                    placeholder="0"
                    value={formData.ratePerNight || ''}
                    onChange={(e) => setFormData({ ...formData, ratePerNight: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label>Currency</Label>
                <Select 
                  value={formData.currency} 
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="KES">KES (KSh)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Minimum Stay</Label>
                <Input
                  type="number"
                  className="mt-1"
                  min="1"
                  value={formData.minimumStay || 1}
                  onChange={(e) => setFormData({ ...formData, minimumStay: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Meal Plan */}
            <div>
              <Label>Meal Plan</Label>
              <Select 
                value={formData.mealPlan} 
                onValueChange={(value) => setFormData({ ...formData, mealPlan: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_PLANS.map(plan => (
                    <SelectItem key={plan.value} value={plan.value}>
                      {plan.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Additional Charges */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-700">Additional Charges (Optional)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Single Occupancy Supplement</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="number"
                      className="pl-9"
                      value={formData.singleOccupancySupplement || ''}
                      onChange={(e) => setFormData({ ...formData, singleOccupancySupplement: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Extra Adult Rate</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="number"
                      className="pl-9"
                      value={formData.extraAdultRate || ''}
                      onChange={(e) => setFormData({ ...formData, extraAdultRate: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Child Rate</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="number"
                      className="pl-9"
                      value={formData.childRate || ''}
                      onChange={(e) => setFormData({ ...formData, childRate: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Child Age Limit</Label>
                  <Input
                    type="number"
                    className="mt-1"
                    value={formData.childAgeLimit || 12}
                    onChange={(e) => setFormData({ ...formData, childAgeLimit: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>Notes</Label>
              <Textarea
                className="mt-1"
                placeholder="Additional notes about this rate..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-slate-300 text-[#749DD0] focus:ring-[#749DD0]"
              />
              <Label htmlFor="isActive">Rate is active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-[#749DD0] hover:bg-[#5a8ac4]">
              <Save className="h-4 w-4 mr-2" />
              {editingRate ? 'Update Rate' : 'Create Rate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Rate
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this rate? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingRate && (
            <div className="py-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="font-medium">{deletingRate.seasonName}</p>
                <p className="text-sm text-slate-600">
                  {deletingRate.room.name} - ${deletingRate.ratePerNight}/night
                </p>
                <p className="text-sm text-slate-500">
                  {format(parseISO(deletingRate.startDate), 'MMM d, yyyy')} - {format(parseISO(deletingRate.endDate), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
