
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';

const Orders = () => {
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const [orderStatus, setOrderStatus] = useState<string>('pending');

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (state.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add some items to your cart before checking out.",
        variant: "destructive"
      });
      return;
    }
    
    setOrderStatus('confirmed');
    toast({
      title: "Order placed successfully!",
      description: `Your order total is $${state.total.toFixed(2)}. We'll prepare it right away!`,
    });
    
    // Simulate order progress
    setTimeout(() => setOrderStatus('preparing'), 2000);
    setTimeout(() => setOrderStatus('ready'), 5000);
    setTimeout(() => setOrderStatus('delivered'), 8000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500';
      case 'confirmed': return 'bg-blue-500';
      case 'preparing': return 'bg-yellow-500';
      case 'ready': return 'bg-orange-500';
      case 'delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Order Confirmed';
      case 'preparing': return 'Preparing Your Order';
      case 'ready': return 'Ready for Pickup/Delivery';
      case 'delivered': return 'Delivered';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Your Orders</h1>
          
          {/* Order Status */}
          {state.items.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order Status</span>
                  <Badge className={`${getStatusColor(orderStatus)} text-white`}>
                    {getStatusText(orderStatus)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getStatusColor(orderStatus)}`}
                        style={{ 
                          width: orderStatus === 'pending' ? '20%' : 
                                orderStatus === 'confirmed' ? '40%' : 
                                orderStatus === 'preparing' ? '60%' : 
                                orderStatus === 'ready' ? '80%' : '100%' 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {orderStatus === 'pending' && "Your order is pending confirmation."}
                  {orderStatus === 'confirmed' && "Your order has been confirmed and will be prepared soon."}
                  {orderStatus === 'preparing' && "Our chefs are preparing your delicious meal."}
                  {orderStatus === 'ready' && "Your order is ready! It's on the way to you."}
                  {orderStatus === 'delivered' && "Your order has been delivered. Enjoy your meal!"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Cart Items */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Cart ({state.items.length} items)</CardTitle>
            </CardHeader>
            <CardContent>
              {state.items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
                  <Button asChild className="bg-orange-500 hover:bg-orange-600">
                    <a href="/menu">Browse Menu</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg bg-white">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-orange-600 font-medium">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 p-0"
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0"
                        >
                          +
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary & Checkout */}
          {state.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${state.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span>$3.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${(state.total * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${(state.total + 3.99 + state.total * 0.1).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <Button
                    onClick={handleCheckout}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3"
                    disabled={orderStatus !== 'pending'}
                  >
                    {orderStatus === 'pending' ? 'Place Order' : 'Order Placed'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="px-6"
                    disabled={orderStatus !== 'pending'}
                  >
                    Clear Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Orders;
