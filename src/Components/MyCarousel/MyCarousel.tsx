import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import "./MyCarousel.scss";
function MyCarousel(props) {
  return (
    <Carousel
      className="my-carousel"
      infiniteLoop
      swipeable
      emulateTouch
      showThumbs={false}
      selectedItem={props.slideIndex}
    >
      {props.children}
    </Carousel>
  );
}

export default MyCarousel;
