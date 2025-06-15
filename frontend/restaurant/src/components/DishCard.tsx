
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';

interface DishCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const DishCard = ({ id, name, description, price, image, category }: DishCardProps) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({ id, name, price, image });
    toast({
      title: "Added to cart!",
      description: `${name} has been added to your cart.`,
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            {category}
          </span>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">{name}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-orange-600">${price.toFixed(2)}</span>
          <Button 
            onClick={handleAddToCart}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DishCard;
