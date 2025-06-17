import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DishCard from '@/components/DishCard';
import { Button } from '@/components/ui/button';
import { menuService, type MenuItem } from '@/services/menuService';
import { useToast } from '@/components/ui/use-toast';

const categories = ['All', 'Pizza', 'Seafood', 'Salads', 'Burgers', 'Pasta', 'Mexican'];

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const response = await menuService.getAvailableMenuItems();
        if (response.success) {
          setMenuItems(response.data);
        } else {
          throw new Error('Failed to fetch menu items');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        toast({
          title: "Error",
          description: "Failed to load menu items. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [toast]);

  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.name.toLowerCase().includes(selectedCategory.toLowerCase()));

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading menu items...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
                  menu_item_id={item.id}
                  name={item.name}
                  description={item.name} // Using name as description since it's not in the API
                  price={item.price}
                  image={item.image_url}
                  category={selectedCategory}
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
