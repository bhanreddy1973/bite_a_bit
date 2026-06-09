import { HeroSection } from '@/components/home/HeroSection';
import { BannerCarousel, type Banner } from '@/components/home/BannerCarousel';
import { LoginForm } from '@/components/home/LoginForm';

interface HomePageProps {
  searchParams: Promise<{ restaurant?: string }>;
}

// Sample placeholder banners – can be replaced with dynamic data later
const placeholderBanners: Banner[] = [
  {
    id: 'banner-1',
    imageUrl: '/banners/chef-special.jpg',
    altText: "Chef's special dish of the day",
  },
  {
    id: 'banner-2',
    imageUrl: '/banners/combo-offer.jpg',
    altText: 'Combo meal offer - save 20%',
  },
  {
    id: 'banner-3',
    imageUrl: '/banners/new-arrivals.jpg',
    altText: 'New dishes added to the menu',
  },
];

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const restaurantName = params.restaurant || undefined;

  return (
    <div className="home-page">
      <HeroSection restaurantName={restaurantName} />
      <BannerCarousel banners={placeholderBanners} />
      <LoginForm restaurantName={restaurantName} />
    </div>
  );
}
