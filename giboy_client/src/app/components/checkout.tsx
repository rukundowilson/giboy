'use client';

import { useState } from 'react';

interface CheckoutModalProps {
    totalAmount: number;
    isOpen: boolean;
    onClose: () => void;
    paymentCode: number | string
}

export default function CheckoutModal({ totalAmount, isOpen, onClose, paymentCode }: CheckoutModalProps) {
    const [shippingAddress, setShippingAddress] = useState('');

    const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setShippingAddress(e.target.value);
    };

    const handleCheckout = () => {
        if (!shippingAddress.trim()) {
            alert('Please provide a shipping address.');
            return;
        }
        // You can now send shippingAddress to your backend if needed
        console.log('Shipping Address:', shippingAddress);
        alert('Order placed successfully!');
    };

    return (
        <>
            <button
                className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
                Proceed to Checkout
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50"
                >
                    <div className="relative w-full max-w-md p-4">
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                            <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Checkout Summary
                                </h3>
                                <button
                                    onClick={onClose}
                                    type="button"
                                    className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="p-4 space-y-4">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <strong>Total Amount:</strong> ${totalAmount.toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <strong>Payment Code:</strong> {paymentCode}
                                </p>

                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Shipping Address
                                    </label>
                                    <textarea
                                        value={shippingAddress}
                                        onChange={handleAddressChange}
                                        placeholder="Enter your shipping address here..."
                                        className="block w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    <p>Shipping fees and delivery time may vary based on your location.</p>
                                </div>

                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    <p>If you experience any issues, please contact us at: <strong>+250790080450</strong> or <strong>support@giboy.com</strong></p>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                >
                                    Confirm and Pay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
