import { useEffect, useState } from "react";

const banners = [
  {
    image: "/banner1.jpg",
    title: "Garlic Naan",
    subtitle: "30% off on Tuesdays",
  },
  {
    image: "/banner2.jpg",
    title: "Chicken Biryani",
    subtitle: "Chef's Special",
  },
  {
    image: "/banner3.jpg",
    title: "Paneer Tikka",
    subtitle: "Try our new recipe!",
  },
];

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: 384,
        height: 204,
        borderRadius: 20,
        position: 'relative',
        margin: '1px auto 0 auto',
        overflow: 'hidden',
        background: '#F3F4F6',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {banners.map((banner, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 384,
            height: 204,
            opacity: idx === current ? 1 : 0,
            zIndex: idx === current ? 10 : 0,
            transition: 'opacity 0.7s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 384,
              height: 172,
              borderRadius: 20,
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#000',
            }}
          >
            <img
              src={banner.image}
              alt={banner.title}
              style={{
                objectFit: 'cover',
                width: '100%',
                height: '100%',
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                borderRadius: 20,
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'flex-start',
                padding: '12px 20px 24px 20px',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 2, textAlign: 'left' }}>Restaurant top #1</div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 32, lineHeight: 1.1, textAlign: 'left' }}>{banner.title}</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 20, marginBottom: 8, textAlign: 'left' }}>{banner.subtitle}</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                {banners.map((_, dotIdx) => (
                  <span
                    key={dotIdx}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#fff',
                      opacity: dotIdx === current ? 0.8 : 0.4,
                      display: 'inline-block',
                    }}
                  ></span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 