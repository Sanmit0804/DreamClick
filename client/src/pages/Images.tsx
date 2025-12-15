import LightGallery from 'lightgallery/react';

// import styles
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';

// If you want you can use SCSS instead of css
import 'lightgallery/scss/lightgallery.scss';
import 'lightgallery/scss/lg-zoom.scss';

// import plugins if you need
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';

function Images() {
  const Images = [
    {
      href: "/ExploreImages/1.webp",
      thumbnail: "/ExploreImages/1.webp",
      alt: "Image"
    },
    {
      href: "/ExploreImages/2.webp",
      thumbnail: "/ExploreImages/2.webp",
      alt: "Image"
    },
    {
      href: "/ExploreImages/3.webp",
      thumbnail: "/ExploreImages/3.webp",
      alt: "Image"
    },
    {
      href: "/ExploreImages/4.webp",
      thumbnail: "/ExploreImages/4.webp",
      alt: "Image"
    },
    {
      href: "/ExploreImages/5.webp",
      thumbnail: "/ExploreImages/5.webp",
      alt: "Image"
    },
    {
      href: "/ExploreImages/6.webp",
      thumbnail: "/ExploreImages/6.webp",
      alt: "Image"
    },
    {
      href: "/ExploreImages/7.webp",
      thumbnail: "/ExploreImages/7.webp",
      alt: "Image"
    },
    {
      href: "/ExploreImages/8.webp",
      thumbnail: "/ExploreImages/8.webp",
      alt: "Image 8"
    },
    {
      href: "/ExploreImages/9.webp",
      thumbnail: "/ExploreImages/9.webp",
      alt: "Image"
    },
    {
      href: "/ExploreImages/10.webp",
      thumbnail: "/ExploreImages/10.webp",
      alt: "Image"
    },
    {
      href: "/ExploreImages/11.webp",
      thumbnail: "/ExploreImages/11.webp",
      alt: "Image"
    },
    {
      href: "/ExploreImages/12.webp",
      thumbnail: "/ExploreImages/12.webp",
      alt: "Image"
    },
    {
      href: "/ExploreImages/13.webp",
      thumbnail: "/ExploreImages/13.webp",
      alt: "Image"
    },
    {
      href: "/ExploreImages/14.webp",
      thumbnail: "/ExploreImages/14.webp",
      alt: "Image"
    },
    {
      href: "/ExploreImages/15.webp",
      thumbnail: "/ExploreImages/15.webp",
      alt: "Image"
    },
  ]

  return (
    <div className="App">
      <LightGallery
        elementClassNames="lg-react-element"
        speed={500}
        plugins={[lgThumbnail, lgZoom]}
      >
        {Images.map((image, index) => {
          return (
            <a href={image.href} key={index}>
              <img alt={image.alt} src={image.thumbnail} loading='lazy' />
            </a>
          )
        })}
      </LightGallery>
    </div>
  );
}

export default Images