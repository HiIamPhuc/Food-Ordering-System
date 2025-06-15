
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DishCard from '@/components/DishCard';
import { Button } from '@/components/ui/button';

// Sample menu data
const menuItems = [
  {
    id: '1',
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, tomato sauce, and basil on a crispy crust',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop',
    category: 'Pizza'
  },
  {
    id: '2',
    name: 'Grilled Salmon',
    description: 'Atlantic salmon with lemon herb butter and seasonal vegetables',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop',
    category: 'Seafood'
  },
  {
    id: '3',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce, parmesan cheese, croutons, and caesar dressing',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=300&fit=crop',
    category: 'Salads'
  },
  {
    id: '4',
    name: 'Beef Burger',
    description: 'Angus beef patty with lettuce, tomato, cheese, and fries',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=300&fit=crop',
    category: 'Burgers'
  },
  {
    id: '5',
    name: 'Chicken Alfredo',
    description: 'Grilled chicken breast over fettuccine with creamy alfredo sauce',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop',
    category: 'Pasta'
  },
  {
    id: '6',
    name: 'Fish Tacos',
    description: 'Grilled white fish with cabbage slaw and chipotle mayo',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop',
    category: 'Mexican'
  }
];

const categories = ['All', 'Pizza', 'Seafood', 'Salads', 'Burgers', 'Pasta', 'Mexican'];

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50">
        {/* Header Section */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Menu</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover our carefully crafted dishes made with the finest ingredients
              </p>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category 
                    ? "bg-orange-500 hover:bg-orange-600 text-white" 
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Menu Items Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <DishCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  image={item.image}
                  category={item.category}
                />
              ))}
            </div>
            
            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No items found in this category.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Menu;
