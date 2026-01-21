import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { initAuthFromStorage } from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Banknote, Percent, AlertCircle } from "lucide-react";

export default function PaymentForm({ bookingDetails, customerDetails, onPaymentSuccess }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [embedSrc, setEmbedSrc] = useState<string | null>(null);
    const [orderTrackingId, setOrderTrackingId] = useState<string | null>(null);

    const getPaymentAmount = () => {
        if (bookingDetails.paymentTerm === 'deposit' && bookingDetails.paymentSchedule) {
            return bookingDetails.paymentSchedule.depositAmount;
        }
        return bookingDetails.totalAmount || bookingDetails.total || 0;
    };

    const generateBookingReference = () => {
        return 'BK' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
    };

    useEffect(() => {
        initAuthFromStorage();
    }, []);

    const handlePayment = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const paymentAmount = getPaymentAmount();

            // Ensure we have a persisted booking. If not, create one now.
            let bookingIdToUse = bookingDetails.bookingId || bookingDetails.id || null;
            if (!bookingIdToUse) {
                try {
                            // Build rooms payload if frontend provided only a single roomId
                            const derivedBookingType = bookingDetails.roomName === 'Package Booking' || bookingDetails.packageId ? 'package' : 'property';
                            let roomsPayload = bookingDetails.rooms || [];
                            if ((!roomsPayload || roomsPayload.length === 0) && bookingDetails.roomId) {
                                roomsPayload = [{
                                    roomId: bookingDetails.roomId,
                                    quantity: (bookingDetails.quantity || 1),
                                    guests: (bookingDetails.guests || 1),
                                    pricePerNightPerPerson: bookingDetails.roomPrice && bookingDetails.guests ? (bookingDetails.roomPrice / Math.max(1, bookingDetails.guests)) : (bookingDetails.roomPrice || 0)
                                }];
                            }

                            const createPayload = {
                                bookingType: derivedBookingType,
                                propertyId: bookingDetails.propertyId || bookingDetails.property_id || null,
                                packageId: bookingDetails.packageId || null,
                                rooms: roomsPayload,
                                checkInDate: bookingDetails.checkIn || null,
                                checkOutDate: bookingDetails.checkOut || null,
                                nights: bookingDetails.nights || 0,
                                totalGuests: bookingDetails.guests || bookingDetails.totalGuests || 1,
                                adults: bookingDetails.adults || 0,
                                children: bookingDetails.children || 0,
                                specialRequests: bookingDetails.specialRequests || '',
                                airportTransfer: bookingDetails.airportTransfer || null,
                                amenities: bookingDetails.selectedAmenities || bookingDetails.amenities || [],
                                costs: bookingDetails.costs || { total: bookingDetails.totalAmount || 0 },
                                paymentTerm: bookingDetails.paymentTerm || 'deposit',
                                paymentSchedule: bookingDetails.paymentSchedule || null,
                                amountPaid: 0,
                                customerName: customerDetails.name,
                                customerEmail: customerDetails.email,
                                customerPhone: customerDetails.phone,
                                customerCountryCode: (customerDetails.phone || '').split(' ')[0] || bookingDetails.countryCode || '+254'
                            };

                            console.log('[PesapalPaymentForm] createPayload:', createPayload);

                    const createRes = await api.post('/bookings/create', createPayload);
                    const createdBooking = createRes.data?.booking ?? createRes.data;
                    bookingIdToUse = createdBooking?._id || createdBooking?.id || createdBooking?.bookingId || null;
                    if (!bookingIdToUse) throw new Error('Failed to obtain created booking id');
                    toast.success('Booking created — proceeding to payment');
                } catch (createErr) {
                    console.error('Failed to create booking before payment:', createErr);
                    toast.error('Failed to create booking before initiating payment');
                    setIsProcessing(false);
                    return;
                }
            }

            // Use the frontend API client so requests go to the configured `API_BASE`.
            // const response = await api.post('/payments/initiate', {
            //     amount: paymentAmount,
            //     currency: 'KES',
            //     description: `Booking for ${bookingDetails.propertyName}`,
            //     email: customerDetails.email,
            //     firstName: customerDetails.name.split(' ')[0],
            //     lastName: customerDetails.name.split(' ').slice(1).join(' '),
            //     phoneNumber: customerDetails.phone,
            //     bookingId: bookingIdToUse,
            //     bookingReference: generateBookingReference(),
            //     // Include full booking payload for backend fallback (optional)
            //     bookingPayload: bookingDetails
            // });

            // if (response.data && response.data.success) {
            //     if (response.data.embedIframeSrc) {
            //         setEmbedSrc(response.data.embedIframeSrc);
            //         if (response.data.orderTrackingId) setOrderTrackingId(response.data.orderTrackingId);
            //         toast.success('Opening embedded PesaPal checkout');
            //     } else if (response.data.redirectUrl) {
            //         window.location.href = response.data.redirectUrl;
            //     } else {
            //         throw new Error('No redirect or embed URL returned from payment initiation');
            //     }
            // } else {
            //     throw new Error(response.data?.error || 'Failed to initialize payment');
            // }
            const response = await api.post("/payments/store", {
                amount: paymentAmount,
                description: `Booking for ${bookingDetails.propertyName}`,
                email: customerDetails.email,
                bookingId: bookingIdToUse,
                bookingReference: generateBookingReference(),
            });

            if (response.data?.success && response.data.redirectUrl) {
                window.location.href = response.data.redirectUrl;
                return;
            }

            throw new Error(response.data?.error || "Failed to initialize payment");


        } catch (error) {
            console.error('💥 Payment error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Payment processing failed';
            toast.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const paymentAmount = getPaymentAmount();
    const isDepositPayment = bookingDetails.paymentTerm === 'deposit';

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Banknote className="h-5 w-5 mr-2" />
                    Payment Details
                </CardTitle>
            </CardHeader>
            <CardContent>
                {embedSrc ? (
                    <div className="space-y-4">
                        <div className="text-sm text-gray-700">Complete your payment in the embedded checkout below. We will detect when the payment completes.</div>
                        <div className="w-full h-[600px] border rounded overflow-hidden">
                            <iframe
                                title="PesaPal Checkout"
                                src={embedSrc}
                                className="w-full h-full"
                                frameBorder={0}
                                allowFullScreen
                            />
                        </div>
                        <div className="text-xs text-gray-500">If payment does not complete automatically, you can close this window and try again.</div>
                    </div>
                ) : (
                    <form onSubmit={handlePayment} className="space-y-4">
                        {/* Payment Summary */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center mb-2">
                                {isDepositPayment ? (
                                    <Percent className="h-4 w-4 text-blue-600 mr-2" />
                                ) : (
                                    <Banknote className="h-4 w-4 text-green-600 mr-2" />
                                )}
                                <span className="font-semibold text-blue-900">
                                    {isDepositPayment ? 'Deposit Payment' : 'Full Payment'}
                                </span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-blue-800">Amount to Pay Now:</span>
                                    <span className="font-bold text-blue-900">
                                        USD {paymentAmount.toFixed(2)}
                                    </span>
                                </div>
                                {isDepositPayment && bookingDetails.paymentSchedule && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-blue-700">Balance Due Later:</span>
                                            <span className="text-blue-800">
                                                USD {bookingDetails.paymentSchedule.balanceAmount.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="text-xs text-blue-600">
                                            Balance due by: {new Date(bookingDetails.paymentSchedule.balanceDueDate).toLocaleDateString()}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isProcessing}
                            size="lg"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Processing Payment...
                                </>
                            ) : isDepositPayment ? (
                                `Pay usd ${paymentAmount.toFixed(2)} Deposit`
                            ) : (
                                `Pay USD ${paymentAmount.toFixed(2)}`
                            )}
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
