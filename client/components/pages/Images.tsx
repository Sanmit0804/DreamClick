'use client';

import dynamic from 'next/dynamic';

// LightGallery uses heavy DOM manipulation — must be client-only
const LightGallery = dynamic(() => import('lightgallery/react'), {
  ssr: false,
  loading: () => (
    <div className="lg-react-element grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
      ))}
    </div>
  ),
});

// import styles
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/scss/lightgallery.scss';
import 'lightgallery/scss/lg-zoom.scss';

// import plugins if you need
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';

const images = [
  { href: "/ExploreImages/1.webp", thumbnail: "/ExploreImages/1.webp", alt: "Image" },
  { href: "/ExploreImages/2.webp", thumbnail: "/ExploreImages/2.webp", alt: "Image" },
  { href: "/ExploreImages/3.webp", thumbnail: "/ExploreImages/3.webp", alt: "Image" },
  { href: "/ExploreImages/4.webp", thumbnail: "/ExploreImages/4.webp", alt: "Image" },
  { href: "/ExploreImages/5.webp", thumbnail: "/ExploreImages/5.webp", alt: "Image" },
  { href: "/ExploreImages/6.webp", thumbnail: "/ExploreImages/6.webp", alt: "Image" },
  { href: "/ExploreImages/7.webp", thumbnail: "/ExploreImages/7.webp", alt: "Image" },
  { href: "/ExploreImages/8.webp", thumbnail: "/ExploreImages/8.webp", alt: "Image 8" },
  { href: "/ExploreImages/9.webp", thumbnail: "/ExploreImages/9.webp", alt: "Image" },
  { href: "/ExploreImages/10.webp", thumbnail: "/ExploreImages/10.webp", alt: "Image" },
  { href: "/ExploreImages/11.webp", thumbnail: "/ExploreImages/11.webp", alt: "Image" },
  { href: "/ExploreImages/12.webp", thumbnail: "/ExploreImages/12.webp", alt: "Image" },
  { href: "/ExploreImages/13.webp", thumbnail: "/ExploreImages/13.webp", alt: "Image" },
  { href: "/ExploreImages/14.webp", thumbnail: "/ExploreImages/14.webp", alt: "Image" },
  { href: "/ExploreImages/15.webp", thumbnail: "/ExploreImages/15.webp", alt: "Image" },
];

function Images() {
  return (
    <div className="App">
      <LightGallery
        elementClassNames="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4"
        speed={500}
        plugins={[lgThumbnail, lgZoom]}
      >
        {images.map((image, index) => (
          <a href={image.href} key={index} className="block aspect-square overflow-hidden rounded-lg group">
            <img 
              alt={image.alt} 
              src={image.thumbnail} 
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105 bg-muted" 
              loading="lazy" 
            />
          </a>
        ))}
      </LightGallery>
    </div>
  );
}

export default Images;