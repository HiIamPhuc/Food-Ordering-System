import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import { API_ENDPOINTS } from '@/config/api';

const Orders = () => {
  const { state, updateQuantity, removeItem, clearCart, setCart } = useCart();
  const [orderStatus, setOrderStatus] = useState<string>('pending');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId') || null);
  const token = localStorage.getItem('token') || '';

  // Fetch user ID from user service
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.USER.PROFILE, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = response.data;
        localStorage.setItem('userId', user.id);
        setUserId(user.id);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Unable to fetch user profile. Please log in again.',
          variant: 'destructive'
        });
      }
    };

    if (token && !userId) {
      fetchUserProfile();
    }
  }, [token, userId]);

  // Fetch pending orders
  useEffect(() => {
    if (!userId) return;

    const fetchPendingOrders = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.ORDER.USER(userId), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.data.success) {
          throw new Error(response.data.error);
        }
        const orders = response.data.data.filter(order => order.status === 'pending');
        
        const cartItems = await Promise.all(
          orders.map(async (order) => {
            const menuResponse = await axios.get(API_ENDPOINTS.MENU.ITEM(order.menu_item_id), {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (!menuResponse.data.success) {
              throw new Error(menuResponse.data.error);
            }
            const menuItem = menuResponse.data.data;
            return {
              id: order.id,
              menu_item_id: order.menu_item_id,
              name: menuItem.name,
              price: menuItem.price,
              image: menuItem.image,
              quantity: order.quantity
            };
          })
        );

        setCart(cartItems);
      } catch (error) {
        toast({
          title: 'Error',
          description: error.message || 'Unable to load orders. Please try again.',
          variant: 'destructive'
        });
      }
    };

    fetchPendingOrders();
  }, [setCart, userId, token]);

  // Track order status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (orderId) {
      interval = setInterval(async () => {
        try {
          const response = await axios.get(API_ENDPOINTS.ORDER.ITEM(orderId), {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!response.data.success) {
            throw new Error(response.data.error);
          }
          const status = response.data.data.status;
          setOrderStatus(status);
          if (status === 'delivered') {
            clearInterval(interval);
          }
        } catch (error) {
          toast({
            title: 'Error',
            description: error.message || 'Unable to update order status.',
            variant: 'destructive'
          });
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [orderId, token]);

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    try {
      await updateQuantity(id, newQuantity);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Unable to update quantity.',
        variant: 'destructive'
      });
    }
  };

  const handleCheckout = async () => {
    if (state.items.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add items to your cart before checking out.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const orderPromises = state.items.map(item =>
        axios.post(
          API_ENDPOINTS.ORDER.BASE,
          {
            user_id: userId,
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            total_price: item.price * item.quantity
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      const responses = await Promise.all(orderPromises);
      const newOrderId = responses[0].data.data.id;
      setOrderId(newOrderId);

      toast({
        title: 'Order placed successfully!',
        description: `Order total: $${state.total.toFixed(2)}. We'll prepare it right away!`
      });

      setOrderStatus('confirmed');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Unable to place order. Please try again.',
        variant: 'destructive'
      });
    }
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
      case 'ready': return 'Ready for Delivery';
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
                  {orderStatus === 'preparing' && "Our chefs are preparing your meal."}
                  {orderStatus === 'ready' && "Your order is ready! It's on its way to you."}
                  {orderStatus === 'delivered' && "Your order has been delivered. Enjoy your meal!"}
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Cart ({state.items.length} items)</CardTitle>
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
                    disabled={orderStatus !== 'pending' || !userId}
                  >
                    {orderStatus === 'pending' ? 'Place Order' : 'Order Placed'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="px-6"
                    disabled={orderStatus !== 'pending' || !userId}
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